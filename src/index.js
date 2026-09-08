import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import Pino from 'pino';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { askLocalAi } from './ai.js';
import { appendConversationTurn, getConversation, updateConversation } from './conversation-state.js';
import { config } from './config.js';
import { buildCustomerContext } from './customer-context.js';
import { getMessageText, getMessageType, isGroupMessage } from './message.js';
import { getConversationTopic, getPresetReply, shouldNotifyAdmin } from './preset-replies.js';
import { cleanTranscript, looksLikeBadTranscript } from './transcript-cleaner.js';
import { transcribeAudioMessage } from './transcribe.js';

const logger = Pino({ level: 'silent' });
const pendingAudioByContact = new Map();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.authDir);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('Escaneie este QR Code no WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log(`${config.botName} conectado ao WhatsApp usando a sessao ${config.authDir}.`);
    }

    if (connection === 'close') {
      const error = lastDisconnect?.error;
      const statusCode = error instanceof Boom ? error.output.statusCode : undefined;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log('Conexao fechada.', shouldReconnect ? 'Reconectando...' : 'Sessao encerrada.');

      if (shouldReconnect) {
        startBot().catch((startError) => {
          console.error('Erro ao reconectar:', startError);
        });
      }
    }
  });

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const message of messages) {
      const remoteJid = message.key.remoteJid;

      if (!remoteJid || message.key.fromMe || isGroupMessage(remoteJid)) {
        continue;
      }

      const customerName = getCustomerName(message);
      const messageType = getMessageType(message);
      let text = getMessageText(message);

      if (messageType === 'audio') {
        await handleAudioMessage(socket, message, remoteJid, customerName);
        continue;
      }

      if (!text) continue;

      await processTextMessage(socket, remoteJid, text, customerName);
    }
  });
}

async function processTextMessage(socket, remoteJid, text, customerName) {
  if (text.length > config.maxInputChars) {
    await socket.sendMessage(remoteJid, {
      text: `${customerName ? `${customerName}, ` : ''}mensagem muito longa. Envie ate ${config.maxInputChars} caracteres.`
    });
    return;
  }

  try {
    await socket.sendPresenceUpdate('composing', remoteJid);
    const conversation = getConversation(remoteJid);
    const isFirstContact = !conversation.history?.length;
    const customerContext = buildCustomerContext(conversation, text, customerName);
    updateConversation(remoteJid, {
      customerName,
      topic: customerContext.topic,
      profile: customerContext.profile
    });
    appendConversationTurn(remoteJid, 'customer', text);
    const updatedConversation = getConversation(remoteJid);
    const rawAnswer = getPresetReply(text, config.companyName, {
      ...config,
      customerName,
      conversation: updatedConversation
    }) || await askLocalAi(text, {
      customerName,
      conversation: updatedConversation,
      profile: customerContext.profile,
      isFirstContact
    });
    const answer = sanitizeBotAnswer(rawAnswer, customerName, text, customerContext.profile);
    await socket.sendMessage(remoteJid, { text: answer });
    appendConversationTurn(remoteJid, 'bot', answer);

    const topic = getConversationTopic(text) || updatedConversation.topic;
    updateConversation(remoteJid, {
      customerName,
      lastMessage: text,
      topic,
      profile: {
        ...customerContext.profile,
        topic
      }
    });

    if (shouldNotifyAdmin(text)) {
      await notifyAdmin(socket, remoteJid, text, customerName, customerContext.profile);
    }
  } catch (error) {
    console.error('Erro ao responder mensagem:', error);
    const fallbackConversation = getConversation(remoteJid);
    await socket.sendMessage(remoteJid, {
      text: buildFallbackReply(customerName, text, fallbackConversation.profile)
    });
  } finally {
    await socket.sendPresenceUpdate('paused', remoteJid);
  }
}

async function handleAudioMessage(socket, message, remoteJid, customerName) {
  const greeting = customerName ? `${customerName}, ` : '';

  try {
    await socket.sendPresenceUpdate('composing', remoteJid);
    const transcript = await transcribeAudioMessage(message, socket, logger);

    if (transcript) {
      const cleanedTranscript = cleanTranscript(transcript);
      console.log(`Audio transcrito de ${remoteJid}: ${transcript}`);

      if (looksLikeBadTranscript(cleanedTranscript, transcript)) {
        await askForAudioConfirmation(socket, remoteJid, customerName);
        return;
      }

      console.log(`Audio normalizado de ${remoteJid}: ${cleanedTranscript}`);
      queueAudioTranscript(socket, remoteJid, customerName, cleanedTranscript);
      return;
    }
  } catch (error) {
    console.error('Erro ao transcrever audio:', error);
  }

  const reply = `${greeting}recebi seu audio, mas nao consegui transcrever com clareza agora. Me manda em texto rapidinho o que voce precisa? Se for orcamento, envie tambem cidade/bairro, servico desejado e melhor horario para retorno.`;

  appendConversationTurn(remoteJid, 'customer', '[audio recebido sem transcricao]');
  appendConversationTurn(remoteJid, 'bot', reply);
  updateConversation(remoteJid, {
    customerName,
    lastMessage: '[audio recebido sem transcricao]',
    profile: {
      ...getConversation(remoteJid).profile,
      customerName,
      stage: 'aguardando texto do audio',
      lastIntent: 'cliente enviou audio'
    }
  });

  await socket.sendMessage(remoteJid, { text: reply });
}

async function askForAudioConfirmation(socket, remoteJid, customerName) {
  const greeting = customerName ? `${customerName}, ` : '';
  const reply = `${greeting}acho que nao entendi bem o audio. Voce quis falar com a TOPTEC DIGITAL? Me manda de novo ou escreve rapidinho sua duvida que eu continuo o atendimento.`;

  appendConversationTurn(remoteJid, 'customer', '[audio com transcricao duvidosa]');
  appendConversationTurn(remoteJid, 'bot', reply);
  updateConversation(remoteJid, {
    customerName,
    lastMessage: '[audio com transcricao duvidosa]',
    profile: {
      ...getConversation(remoteJid).profile,
      customerName,
      stage: 'confirmando audio',
      lastIntent: 'audio transcrito com baixa confianca'
    }
  });

  await socket.sendMessage(remoteJid, { text: reply });
}

function queueAudioTranscript(socket, remoteJid, customerName, transcript) {
  const existing = pendingAudioByContact.get(remoteJid);

  if (existing?.timer) {
    clearTimeout(existing.timer);
  }

  const transcripts = [...(existing?.transcripts || []), transcript].slice(-5);
  const timer = setTimeout(async () => {
    pendingAudioByContact.delete(remoteJid);
    const combinedText = transcripts.join('\n');
    await processTextMessage(socket, remoteJid, combinedText, customerName);
  }, config.audioReplyDelayMs);

  pendingAudioByContact.set(remoteJid, {
    customerName,
    transcripts,
    timer
  });
}

function buildFallbackReply(customerName, text, profile = {}) {
  const greeting = customerName ? `${customerName}, ` : '';
  const normalized = normalizeIncomingText(text);

  if (isBotStatusQuestion(normalized)) {
    return `${greeting}estou aqui sim. As vezes eu demoro um pouco quando recebo audio ou quando a IA local esta carregando, mas sigo acompanhando a conversa. Me fala o que voce quer testar ou resolver.`;
  }

  if (isOnlyQuestionMarks(text)) {
    return `${greeting}acho que minha resposta anterior nao ficou clara. Pode me dizer de novo o que voce queria saber? Se for sobre a ${config.companyName}, posso te explicar servicos, produtos, orcamento ou atendimento.`;
  }

  if (isGreeting(normalized)) {
    return `${greeting}tudo bem? Me conta o que voce precisa. Posso conversar contigo e, se fizer sentido, te mostro como a ${config.companyName} pode ajudar com site, sistema, automacao, IA, marketing ou suporte.`;
  }

  if (isSportsQuestion(normalized)) {
    return `${greeting}sobre jogo ou placar de hoje, eu nao consigo confirmar em tempo real por aqui. Mas se voce quer divulgar jogos, eventos, agenda, promocao ou atendimento no WhatsApp, a ${config.companyName} pode montar uma pagina ou robo para captar interessados e responder automaticamente.`;
  }

  if (isToptecSiteQuestion(normalized)) {
    return `${greeting}pelo site da ${config.companyName}, trabalhamos com desenvolvimento de sites, aplicativos, automacao WhatsApp, marketing digital, infraestrutura de TI, consultoria em TI e CRM/controle de estoque. Tambem temos produtos em categorias como acessorios, audio, games, informatica e smartwatch.`;
  }

  if (isGeneralQuestion(normalized)) {
    return `${greeting}posso conversar sobre isso de forma geral, mas se depender de informacao atualizada em tempo real eu preciso confirmar por uma fonte externa. Me diz o contexto que eu tento te orientar e, se couber, vejo como a ${config.companyName} pode transformar isso em site, automacao ou atendimento.`;
  }

  if (profile?.interest) {
    return `${greeting}sobre ${profile.interest}, consigo te orientar e encaminhar para orcamento. Me diga o objetivo, cidade/bairro e melhor horario para retorno que eu passo para o admin da ${config.companyName}.`;
  }

  return `${greeting}me conta melhor o que voce quer fazer ou resolver. Eu consigo conversar contigo e ir entendendo a ideia; quando aparecer uma oportunidade, te mostro como a ${config.companyName} pode ajudar com tecnologia, automacao, IA, site ou suporte.`;
}

function sanitizeBotAnswer(answer, customerName, text, profile) {
  const trimmedAnswer = String(answer || '').trim();
  const normalizedAnswer = answer
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    !trimmedAnswer ||
    trimmedAnswer.length < 8 ||
    normalizedAnswer.includes('nao posso fornecer informacoes') ||
    normalizedAnswer.includes('nao tenho informacoes') ||
    normalizedAnswer.includes('nao tenho informacao') ||
    normalizedAnswer.includes('nao posso continuar essa conversa') ||
    normalizedAnswer.includes('conteudo inapropriado') ||
    normalizedAnswer.includes('nao posso ajudar com isso') ||
    normalizedAnswer.includes('nao posso responder a essa mensagem') ||
    normalizedAnswer.includes('nao posso responder essa mensagem') ||
    normalizedAnswer.includes('nao tenho acesso ao historico') ||
    normalizedAnswer.includes('sem acesso ao historico') ||
    normalizedAnswer.includes('nao tenho informacoes sobre o que voce esta pensando') ||
    normalizedAnswer.includes('nao tenho informacao sobre o que voce esta pensando') ||
    normalizedAnswer.includes('vou tentar novamente') ||
    normalizedAnswer.includes('aqui esta uma possivel continuacao') ||
    normalizedAnswer.includes('cliente:') ||
    normalizedAnswer.includes('robo:') ||
    normalizedAnswer.includes('[audio transcrito]') ||
    normalizedAnswer.includes('perfil/contexto') ||
    normalizedAnswer.includes('historico recente') ||
    normalizedAnswer.includes('mensagem atual do cliente') ||
    normalizedAnswer.includes('nao posso fornecer informacoes sobre o site') ||
    normalizedAnswer.includes('plataforma principal') ||
    normalizedAnswer.includes('nossa missao e visao') ||
    normalizedAnswer.includes('empresas em larga escala') ||
    normalizedAnswer.includes('empresas de grande escala')
  ) {
    return buildFallbackReply(customerName, text, profile);
  }

  return trimmedAnswer
    .replace(/^\s*["']|["']\s*$/g, '')
    .trim();
}

function normalizeIncomingText(text) {
  return text
    .replace(/^\[audio transcrito\]\s*/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isGreeting(normalized) {
  return /^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|salve)\b/.test(normalized.trim());
}

function isBotStatusQuestion(normalized) {
  return /\bmorreu\b|\btravou\b|\bparou\b|\bcaiu\b|\bta ai\b|\besta ai\b|\bresponde\b/.test(normalized);
}

function isOnlyQuestionMarks(text) {
  return /^\s*\?+\s*$/.test(text);
}

function isSportsQuestion(normalized) {
  return /\bjogo\b|\bjogos\b|\bplacar\b|\blondrina\b|\bfutebol\b|\bpartida\b|\btem jogo\b|\bjogo hoje\b|\bjogo hj\b/.test(normalized);
}

function isToptecSiteQuestion(normalized) {
  return /\btoptec\b|\btop tec\b|\bsite\b|\bservicos\b|\bprodutos\b|\bsistema\b|\bestoque\b|\bcrm\b/.test(normalized);
}

function isGeneralQuestion(normalized) {
  return /\?$|\bcomo\b|\bpor que\b|\bporque\b|\bqual\b|\bquais\b|\bquando\b|\bonde\b|\bquem\b|\bo que\b|\bquanto\b|\bqunto\b/.test(normalized.trim());
}

async function notifyAdmin(socket, customerJid, text, customerName, profile = {}) {
  const adminJid = toBrazilianWhatsappJid(config.adminPhone);
  const customerPhone = customerJid.split('@')[0];

  await socket.sendMessage(adminJid, {
    text: [
      `Novo pedido de orcamento pelo robo da ${config.companyName}.`,
      `Cliente: ${customerName || 'Nome nao informado pelo WhatsApp'}`,
      `WhatsApp: +${customerPhone}`,
      profile.interest ? `Interesse: ${profile.interest}` : null,
      profile.stage ? `Etapa: ${profile.stage}` : null,
      `Mensagem: ${text}`
    ].filter(Boolean).join('\n')
  });
}

function getCustomerName(message) {
  const name = message.pushName || message.verifiedBizName || '';
  const cleaned = String(name).replace(/\s+/g, ' ').trim();
  return cleaned.length > 40 ? cleaned.slice(0, 40).trim() : cleaned;
}

function toBrazilianWhatsappJid(phone) {
  const digits = String(phone).replace(/\D/g, '');
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `${withCountry}@s.whatsapp.net`;
}

startBot().catch((error) => {
  console.error('Erro ao iniciar o bot:', error);
  process.exit(1);
});
