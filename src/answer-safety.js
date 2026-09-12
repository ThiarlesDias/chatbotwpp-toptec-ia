export function sanitizeAnswer(answer, options = {}) {
  const text = String(answer || '').trim();
  const normalized = normalizeText(text);

  if (
    !text ||
    normalized.includes('cliente:') ||
    normalized.includes('robo:') ||
    normalized.includes('system prompt') ||
    normalized.includes('prompt') ||
    normalized.includes('regras internas') ||
    normalized.includes('aqui esta uma possivel continuacao') ||
    normalized.includes('nao posso fornecer') ||
    normalized.includes('nao posso responder') ||
    normalized.includes('nao consigo responder') ||
    normalized.includes('nao tenho informacoes') ||
    normalized.includes('nao tenho informacao') ||
    isBareServiceTitle(normalized)
  ) {
    return buildSafeFallback(options);
  }

  return text.replace(/^\s*["']|["']\s*$/g, '').trim();
}

export function buildSafeFallback(options = {}) {
  const greeting = options.customerName ? `${options.customerName}, ` : '';
  const companyName = options.companyName || 'TOPTEC DIGITAL';
  const botDisplayName = options.botDisplayName || 'Charlie';
  const normalized = normalizeText(options.inputText);

  if (/^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|salve)(\s|$)/.test(normalized)) {
    return `${greeting}tudo bem? Sou o ${botDisplayName}, robo da ${companyName}. Me conta se voce precisa de produto, servico, orcamento ou suporte.`;
  }

  if (/\bsite\b|\bservico\b|\bservicos\b|\bsistema\b|\bestoque\b|\bcrm\b|\bwhatsapp\b|\bproduto\b/.test(normalized)) {
    return `${greeting}posso te ajudar com isso. Pelo site oficial, a ${companyName} trabalha com sites, aplicativos, automacao WhatsApp, marketing digital, infraestrutura de TI, consultoria em TI e CRM/controle de estoque. Qual ponto voce quer ver primeiro?`;
  }

  return `${greeting}posso te ajudar. Me explica em uma frase o que voce precisa, que eu tento orientar e encaminhar para a ${companyName} quando fizer sentido.`;
}

function isBareServiceTitle(normalizedAnswer) {
  return /^(desenvolvimento de sites|desenvolvimento de aplicativos|automacao whatsapp|marketing digital|infraestrutura de ti|consultoria em ti|crm e controle de estoque)( quer mais alguma coisa\??)?$/.test(normalizedAnswer);
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
