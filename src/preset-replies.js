export function getPresetReply(text, companyName, options = {}) {
  const normalized = normalizeText(text);
  const name = options.customerName;
  const greeting = name ? `${name}, ` : '';
  const activePhone = options.activeRobotPhone || options.officialPhone || '43991939187';

  if (isGreeting(normalized)) {
    return `${greeting}tudo bem? Sou o robo da ${companyName}. Me conta o que voce precisa: produto, servico, orcamento ou suporte?`;
  }

  if (isIdentityQuestion(normalized)) {
    return `${greeting}eu sou o robo da ${companyName}. Posso apresentar nossos produtos e servicos, tirar duvidas iniciais e ajudar com orcamentos.`;
  }

  if (isBudgetRequest(normalized)) {
    return `${greeting}para orcamento, o valor depende do que voce precisa. Me envie cidade/bairro, servico desejado, objetivo e melhor horario para retorno. Vou encaminhar para o admin da ${companyName}.`;
  }

  if (isHumanRequest(normalized)) {
    return `${greeting}claro. Para falar com o atendimento da ${companyName}, chame no WhatsApp: ${activePhone}.`;
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
  return /^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|salve)(\s|$)/.test(normalized);
}

function isIdentityQuestion(normalized) {
  return /\bquem (e|eh) (vc|voce|tu)\b|\b(voce|vc|tu) (e|eh) quem\b|\bqual (e|eh) seu nome\b|\b(o que|oq|que) (vc|voce|tu) (e|eh)\b/.test(normalized);
}

function isBudgetRequest(normalized) {
  return /\borcamento\b|\bpreco\b|\bvalor\b|\bquanto custa\b|\bcontratar\b|\bfechar\b/.test(normalized);
}

function isHumanRequest(normalized) {
  return /\bfalar com atendente\b|\bfalar com humano\b|\batendente humano\b|\bsuporte humano\b/.test(normalized);
}

function isOnlyQuestionMarks(text) {
  return /^\s*\?+\s*$/.test(String(text || ''));
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
