import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import Pino from 'pino';
import qrcode from 'qrcode-terminal';
import { askLocalAi } from './ai.js';
import { normalizeAudioTranscript } from './audio-normalizer.js';
import { detectCatalogTopic, getCatalogReply } from './catalog.js';
import { config } from './config.js';
import { getMessageText, getMessageType, isGroupMessage } from './message.js';
import { getPresetReply, shouldNotifyAdmin } from './preset-replies.js';
import {
  getSessionContext,
  rememberBotMessage,
  rememberCustomerMessage,
  rememberTopic
} from './session.js';
import { transcribeAudioMessage } from './transcribe.js';

const logger = Pino({ level: 'silent' });

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

      await handleIncomingMessage(socket, message, remoteJid);
    }
  });
}

async function handleIncomingMessage(socket, message, remoteJid) {
  const customerName = getCustomerName(message);
  const messageType = getMessageType(message);
  const input = messageType === 'audio'
    ? await getAudioText(socket, message, remoteJid, customerName)
    : { text: getMessageText(message), fromAudio: false };

  if (!input.text) return;

  if (input.text.length > config.maxInputChars) {
    await socket.sendMessage(remoteJid, {
      text: `${customerName ? `${customerName}, ` : ''}mensagem muito longa. Envie ate ${config.maxInputChars} caracteres.`
    });
    return;
  }

  rememberCustomerMessage(remoteJid, input.text);
  const sessionContext = getSessionContext(remoteJid);

  try {
    await socket.sendPresenceUpdate('composing', remoteJid);

    const rawAnswer = getPresetReply(input.text, config.companyName, {
      ...config,
      customerName
    }) || getCatalogReply(input.text, {
      ...config,
      customerName,
      lastTopic: sessionContext.lastTopic
    }) || await askLocalAi(input.text, {
      customerName,
      fromAudio: input.fromAudio,
      history: sessionContext.history,
      lastTopic: sessionContext.lastTopic
    });

    const answer = sanitizeAnswer(rawAnswer, customerName, input.text);
    await socket.sendMessage(remoteJid, { text: answer });
    rememberBotMessage(remoteJid, answer);

    const detectedTopic = detectCatalogTopic(input.text) || sessionContext.lastTopic;
    rememberTopic(remoteJid, detectedTopic);

    if (shouldNotifyAdmin(input.text)) {
      await notifyAdmin(socket, remoteJid, input.text, customerName);
    }
  } catch (error) {
    console.error('Erro ao responder mensagem:', error);
    await socket.sendMessage(remoteJid, {
      text: buildSafeFallback(customerName, input.text)
    });
  } finally {
    await socket.sendPresenceUpdate('paused', remoteJid);
  }
}

async function getAudioText(socket, message, remoteJid, customerName) {
  try {
    await socket.sendPresenceUpdate('composing', remoteJid);
    const transcript = await transcribeAudioMessage(message, socket, logger);

    if (transcript) {
      console.log(`Audio transcrito de ${remoteJid}: ${transcript}`);
      const normalizedTranscript = normalizeAudioTranscript(transcript);

      if (normalizedTranscript !== transcript) {
        console.log(`Audio normalizado de ${remoteJid}: ${normalizedTranscript}`);
      }

      return { text: normalizedTranscript, fromAudio: true };
    }
  } catch (error) {
    console.error('Erro ao transcrever audio:', error);
  }

  const greeting = customerName ? `${customerName}, ` : '';
  await socket.sendMessage(remoteJid, {
    text: `${greeting}recebi seu audio, mas nao consegui entender com clareza. Pode mandar em texto ou gravar novamente?`
  });
  return { text: '', fromAudio: true };
}

function sanitizeAnswer(answer, customerName, inputText) {
  const text = String(answer || '').trim();
  const normalized = normalize(text);

  if (
    !text ||
    normalized.includes('cliente:') ||
    normalized.includes('robo:') ||
    normalized.includes('system prompt') ||
    normalized.includes('prompt') ||
    normalized.includes('regras internas') ||
    normalized.includes('nao posso fornecer informacoes') ||
    normalized.includes('nao tenho informacoes') ||
    normalized.includes('nao tenho informacao')
  ) {
    return buildSafeFallback(customerName, inputText);
  }

  return text.replace(/^\s*["']|["']\s*$/g, '').trim();
}

function buildSafeFallback(customerName, inputText) {
  const greeting = customerName ? `${customerName}, ` : '';
  const normalized = normalize(inputText);

  if (/^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|salve)(\s|$)/.test(normalized)) {
    return `${greeting}tudo bem? Sou o robo da ${config.companyName}. Me conta se voce precisa de produto, servico, orcamento ou suporte.`;
  }

  if (/\bsite\b|\bservico\b|\bservicos\b|\bsistema\b|\bestoque\b|\bcrm\b|\bwhatsapp\b|\bproduto\b/.test(normalized)) {
    return `${greeting}posso te ajudar com isso. Pelo site oficial, a ${config.companyName} trabalha com sites, aplicativos, automacao WhatsApp, marketing digital, infraestrutura de TI, consultoria em TI e CRM/controle de estoque. Qual ponto voce quer ver primeiro?`;
  }

  return `${greeting}posso te ajudar. Me explica em uma frase o que voce precisa, que eu tento orientar e encaminhar para a ${config.companyName} quando fizer sentido.`;
}

async function notifyAdmin(socket, customerJid, text, customerName) {
  const adminJid = toBrazilianWhatsappJid(config.adminPhone);
  const customerPhone = customerJid.split('@')[0];

  await socket.sendMessage(adminJid, {
    text: [
      `Novo pedido de orcamento pelo robo da ${config.companyName}.`,
      `Cliente: ${customerName || 'Nome nao informado pelo WhatsApp'}`,
      `WhatsApp: +${customerPhone}`,
      `Mensagem: ${text}`
    ].join('\n')
  });
}

function getCustomerName(message) {
  const name = message.pushName || message.verifiedBizName || '';
  return String(name).replace(/\s+/g, ' ').trim().slice(0, 40);
}

function toBrazilianWhatsappJid(phone) {
  const digits = String(phone).replace(/\D/g, '');
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `${withCountry}@s.whatsapp.net`;
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

startBot().catch((error) => {
  console.error('Erro ao iniciar o bot:', error);
  process.exit(1);
});
