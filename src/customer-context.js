const interestRules = [
  { interest: 'robos de atendimento e IA', topic: 'ai', pattern: /\bia\b|inteligencia artificial|robos? de atendimento|chatbots?|automacao whatsapp|bot\b|robo\b/ },
  { interest: 'desenvolvimento de sites', topic: 'site', pattern: /\bsite\b|landing page|pagina de vendas|pagina\b/ },
  { interest: 'loja virtual e produtos online', topic: 'store', pattern: /loja virtual|e-?commerce|vender online|loja online|produtos?/ },
  { interest: 'desenvolvimento de aplicativos', topic: 'app', pattern: /aplicativos?|app\b/ },
  { interest: 'sistemas, paineis, CRM ou estoque', topic: 'system', pattern: /sistemas?|painel|crm|estoque|controle de vendas|controle de clientes/ },
  { interest: 'marketing digital', topic: 'marketing', pattern: /marketing|trafego|campanha|instagram|redes sociais|divulgacao/ },
  { interest: 'infraestrutura ou suporte tecnico', topic: 'support', pattern: /infraestrutura|suporte|manutencao|computador|rede|servidor|ti\b/ },
  { interest: 'orcamento', topic: 'budget', pattern: /orcamento|quanto custa|preco|valor|investimento|cobram/ }
];

const stageRules = [
  { stage: 'orcamento', pattern: /orcamento|quanto custa|preco|valor|investimento|cobram|fechar|contratar/ },
  { stage: 'interesse', pattern: /quero|sim|pode|me explica|fala mais|tenho interesse|gostei/ },
  { stage: 'descoberta', pattern: /o que|que tipo|como funciona|me fala|quais|duvida|preciso/ }
];

export function buildCustomerContext(conversation, text, customerName) {
  const normalized = normalizeText(text);
  const previousProfile = conversation.profile || {};
  const detectedInterest = detectInterest(normalized);
  const detectedStage = detectStage(normalized);
  const isShortAffirmative = isAffirmative(normalized);
  const isBudgetIntent = detectedInterest?.topic === 'budget';

  const topic = detectedInterest?.topic || conversation.topic || previousProfile.topic || null;
  const interest = isBudgetIntent
    ? previousProfile.interest || conversation.interest || 'orcamento'
    : detectedInterest?.interest || previousProfile.interest || conversation.interest || null;
  const stage = detectedStage || (isShortAffirmative ? previousProfile.stage || 'interesse' : previousProfile.stage || 'conversa');

  const profile = {
    ...previousProfile,
    customerName: customerName || previousProfile.customerName || '',
    topic,
    interest,
    stage,
    lastIntent: detectedIntent(normalized, isShortAffirmative),
    updatedAt: new Date().toISOString()
  };

  return {
    topic,
    profile
  };
}

export function formatCustomerProfile(profile = {}) {
  const lines = [
    profile.customerName ? `Cliente: ${profile.customerName}` : null,
    profile.interest ? `Interesse percebido: ${profile.interest}` : null,
    profile.topic ? `Assunto atual: ${profile.topic}` : null,
    profile.stage ? `Etapa da conversa: ${profile.stage}` : null,
    profile.lastIntent ? `Intencao da ultima mensagem: ${profile.lastIntent}` : null
  ];

  return lines.filter(Boolean).join('\n');
}

function detectInterest(normalized) {
  return interestRules.find((rule) => rule.pattern.test(normalized)) || null;
}

function detectStage(normalized) {
  return stageRules.find((rule) => rule.pattern.test(normalized))?.stage || null;
}

function detectedIntent(normalized, isShortAffirmative) {
  if (isShortAffirmative) return 'confirmacao curta ligada ao assunto anterior';
  if (/orcamento|quanto custa|preco|valor|investimento|cobram/.test(normalized)) return 'pedido de preco ou orcamento';
  if (/falar com atendente|falar com humano|atendente humano/.test(normalized)) return 'pedido de atendimento humano';
  if (/o que|quais|que tipo|como funciona|me fala|explica/.test(normalized)) return 'pedido de explicacao';
  return 'mensagem aberta';
}

function isAffirmative(normalized) {
  return [
    'sim',
    's',
    'quero',
    'pode',
    'pode sim',
    'me explica',
    'explica',
    'quero saber',
    'fala mais',
    'me fala mais'
  ].includes(normalized);
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
