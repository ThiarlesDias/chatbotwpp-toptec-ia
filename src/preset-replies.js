import { hasLoosePhrase, hasLooseTerm, normalizeText } from './text-match.js';

export function getPresetReply(text, companyName, options = {}) {
  const normalized = normalizeText(text);
  const name = options.customerName;
  const greeting = name ? `${name}, ` : '';
  const botDisplayName = options.botDisplayName || 'Charlie';
  const activePhone = options.activeRobotPhone || options.officialPhone || '43991939187';

  if (isGreeting(normalized)) {
    return `${greeting}tudo bem? Sou o ${botDisplayName}, robo da ${companyName}. Me conta o que voce precisa: produto, servico, orcamento ou suporte?`;
  }

  if (isIdentityQuestion(normalized)) {
    return `${greeting}eu sou o ${botDisplayName}, robo da ${companyName}. Posso apresentar nossos produtos e servicos, tirar duvidas iniciais e ajudar com orcamentos.`;
  }

  if (isBudgetRequest(normalized)) {
    if (isProductQuestion(normalized)) {
      return `${greeting}os precos e disponibilidade dos produtos podem mudar. Veja a loja oficial em ${options.siteUrl || 'https://toptecdigital.com'}/produtos/ ou me diga qual produto voce procura que eu tento te orientar.`;
    }

    const serviceHint = getServiceHint(normalized);
    const subject = serviceHint ? ` de ${serviceHint}` : '';
    return `${greeting}o valor${subject} depende do escopo. Me envie cidade/bairro, objetivo, prazo desejado e melhor horario para retorno. Vou encaminhar para o admin da ${companyName}.`;
  }

  if (isHumanRequest(normalized)) {
    return `${greeting}claro. Para falar com o atendimento da ${companyName}, chame no WhatsApp: ${activePhone}.`;
  }

  if (isConfusionReaction(normalized)) {
    return `${greeting}desculpa, respondi mal. Posso te mostrar servicos, produtos, orcamento ou atendimento humano. Sobre qual deles voce quer falar?`;
  }

  if (isDoneOrNegative(normalized)) {
    return `${greeting}combinado. Se precisar, me chama por aqui e eu te ajudo com produtos, servicos, orcamento ou suporte da ${companyName}.`;
  }

  if (isOnlyQuestionMarks(text)) {
    return `${greeting}acho que nao entendi. Pode me mandar sua duvida em uma frase?`;
  }

  return null;
}

export function shouldNotifyAdmin(text) {
  return isBudgetRequest(normalizeText(text));
}

function isGreeting(normalized) {
  return /^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|salve|bomdia|boatarde|boanoite)(\s|$)/.test(normalized);
}

function isIdentityQuestion(normalized) {
  return (
    /\bquem (e|eh) (vc|voce|tu)\b/.test(normalized) ||
    /\b(voce|vc|tu) (e|eh) quem\b/.test(normalized) ||
    /\bqual (e|eh) seu nome\b/.test(normalized) ||
    /\b(o que|oq|que) (vc|voce|tu) (e|eh)\b/.test(normalized) ||
    hasLoosePhrase(normalized, 'quem e voce') ||
    hasLoosePhrase(normalized, 'quem e vc') ||
    hasLoosePhrase(normalized, 'qual e seu nome')
  );
}

function isBudgetRequest(normalized) {
  return (
    /\borcamento\b|\bpreco\b|\bvalor\b|\bquanto custa\b|\bcontratar\b|\bfechar\b/.test(normalized) ||
    hasLooseTerm(normalized, ['orcamento', 'orsamento', 'orcameto', 'orcamento', 'preco', 'preso', 'valor', 'valores', 'contratar', 'fechar']) ||
    hasLoosePhrase(normalized, 'quanto custa')
  );
}

function isProductQuestion(normalized) {
  return (
    /\bproduto(s)?\b|\bloja\b|\bcomprar\b|\bcarregador\b|\bfone\b|\bsmartwatch\b|\bcontrole\b|\bconsole\b/.test(normalized) ||
    hasLooseTerm(normalized, ['produto', 'produtos', 'prodto', 'prodtos', 'loja', 'comprar', 'carregador', 'fone', 'smartwatch', 'controle', 'console'])
  );
}

function getServiceHint(normalized) {
  if (/\bsite(s)?\b|\blanding\b|\bloja virtual\b|\bcatalogo\b/.test(normalized) || hasLooseTerm(normalized, ['site', 'sites', 'sait', 'saite', 'pagina', 'catalogo'])) return 'site';
  if (/\bapp(s)?\b|\baplicativo\b/.test(normalized) || hasLooseTerm(normalized, ['app', 'aplicativo', 'aplicatvo', 'aplcativo'])) return 'aplicativo';
  if (/\bwhatsapp\b|\bwpp\b|\brobo\b|\bchatbot\b|\bautomacao\b/.test(normalized) || hasLooseTerm(normalized, ['whatsapp', 'whats', 'wats', 'zap', 'wpp', 'robo', 'chatbot', 'automacao'])) return 'automacao WhatsApp';
  if (/\bmarketing\b|\banuncio\b|\bcampanha\b|\btrafego\b/.test(normalized) || hasLooseTerm(normalized, ['marketing', 'markting', 'mkt', 'anuncio', 'campanha', 'trafego'])) return 'marketing digital';
  if (/\binfra\b|\binfraestrutura\b|\brede\b|\bservidor\b|\bcomputador\b/.test(normalized) || hasLooseTerm(normalized, ['infra', 'infraestrutura', 'rede', 'servidor', 'computador'])) return 'infraestrutura de TI';
  if (/\bconsultoria\b|\bdiagnostico\b/.test(normalized) || hasLooseTerm(normalized, ['consultoria', 'consutoria', 'diagnostico'])) return 'consultoria em TI';
  if (/\bcrm\b|\bestoque\b|\btopgestor\b|\bpedido\b/.test(normalized) || hasLooseTerm(normalized, ['crm', 'estoque', 'estoq', 'estoqui', 'topgestor', 'pedido'])) return 'CRM e controle de estoque';

  return '';
}

function isHumanRequest(normalized) {
  return (
    /\bfalar com atendente\b|\bfalar com humano\b|\batendente humano\b|\bsuporte humano\b/.test(normalized) ||
    hasLoosePhrase(normalized, 'falar com atendente') ||
    hasLoosePhrase(normalized, 'falar com humano') ||
    hasLooseTerm(normalized, ['atendente', 'atedente', 'humano', 'alguem'])
  );
}

function isConfusionReaction(normalized) {
  const clean = normalized.replace(/\?+$/g, '').trim();
  return /^(como assim|oxe|vish|ue|ué|eita|que isso|nao entendi|n entendi|confuso|estranho)$/.test(clean);
}

function isDoneOrNegative(normalized) {
  return /^(nao|nao obrigado|nao obrigada|n|ok|okay|blz|beleza|ta bom|tudo certo|so isso|nao so isso|nao, so isso)$/.test(normalized);
}

function isOnlyQuestionMarks(text) {
  return /^\s*\?+\s*$/.test(String(text || ''));
}
