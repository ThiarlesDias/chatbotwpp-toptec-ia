const identityPatterns = [
  /\bquem (e|eh) (vc|voce|tu)\b/,
  /\bquem (vc|voce|tu) (e|eh)\b/,
  /\b(vc|voce|tu) (e|eh) quem\b/,
  /\b(vc|voce|tu) (e|eh) (o que|oq|que)\b/,
  /\bo que (vc|voce|tu) (e|eh)\b/,
  /\b(oq|que) (vc|voce|tu) (e|eh)\b/,
  /\bqual (e|eh) seu nome\b/,
  /\bcomo (vc|voce|tu) chama\b/,
  /\b(voce|vc|tu) trabalha com o que\b/,
  /\bo que (vc|voce|tu) faz\b/
];

const servicesPatterns = [
  /\bquais servicos\b/,
  /\bservicos voces fazem\b/,
  /\bservicos (vcs|voces) fazem\b/,
  /\bque (vcs|voces) fazem\b/,
  /\bo que (vcs|voces) fazem\b/,
  /\bque tipo de servicos\b/,
  /\be os servicos\b/,
  /\bo que voces fazem\b/,
  /\bo que a toptec faz\b/,
  /\bservicos da toptec\b/
];

const budgetPatterns = [
  /\bquero orcamento\b/,
  /\bfazer orcamento\b/,
  /\bpedir orcamento\b/,
  /\bsolicitar orcamento\b/,
  /\bpreciso de orcamento\b/,
  /\bquanto custa\b/,
  /\bvalor\b/,
  /\bpreco\b/
];

const attendantPatterns = [
  /\bfalar com atendente\b/,
  /\bfalar com humano\b/,
  /\batendente humano\b/,
  /\bchamar atendente\b/,
  /\bsuporte humano\b/
];

const clarificationPatterns = [
  /\bpor que (vc|voce) nao (pode )?responder\b/,
  /\bporque (vc|voce) nao (pode )?responder\b/,
  /\bnao respondeu\b/,
  /\bnao entendi\b/,
  /\bcomo assim\b/,
  /\bque resposta foi essa\b/,
  /\bresponde minha mensagem\b/
];

const greetingPatterns = [
  /\b(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|salve)\b/,
  /\beu so disse oi\b/,
  /\bso disse oi\b/,
  /\boi toptec digital\b/,
  /\boi top tec digital\b/
];

const siteServicePatterns = [
  /\bsite\b/,
  /\bdesenvolvimento de sites\b/,
  /\blanding page\b/,
  /\bpagina de vendas\b/
];

const systemServicePatterns = [
  /\bsistema\b/,
  /\bsistemas\b/,
  /\bestoque\b/,
  /\bcrm\b/,
  /\bcontrole de estoque\b/,
  /\bcontrole de vendas\b/
];

const whatsappAutomationPatterns = [
  /\bautomacao whatsapp\b/,
  /\bautomacao no whatsapp\b/,
  /\brobo whatsapp\b/,
  /\brobo de whatsapp\b/,
  /\bchatbot\b/,
  /\batendimento automatico\b/
];

const productPatterns = [
  /\bproduto\b/,
  /\bprodutos\b/,
  /\bloja\b/,
  /\bacessorios\b/,
  /\baudio\b/,
  /\bgames\b/,
  /\binformatica\b/,
  /\bsmartwatch\b/
];

const aiPatterns = [
  /\bia\b/,
  /\binteligencia artificial\b/,
  /\brobos? de atendimento\b/,
  /\bme fala sobre robos?\b/,
  /\brobo com ia\b/,
  /\bchatbot com ia\b/,
  /\bautomacao com ia\b/,
  /\bvoce usa ia\b/
];

export function getPresetReply(text, companyName, options = {}) {
  const normalized = normalizeText(text);
  const activeRobotPhone = options.activeRobotPhone || options.officialPhone || '43991939187';
  const greeting = options.customerName ? `${options.customerName}, ` : '';

  if (clarificationPatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}desculpa pela confusao. Eu consigo responder sim; as vezes audio curto pode ser transcrito errado. Me manda novamente em texto ou audio mais claro que eu continuo o atendimento da ${companyName}.`;
  }

  if (greetingPatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}tudo bem? Sou o robo da ${companyName}. Me conta o que voce precisa: produto, servico, orcamento ou suporte?`;
  }

  if (siteServicePatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}sim, a ${companyName} trabalha com desenvolvimento de sites. Pelo site oficial, sao sites modernos, responsivos e pensados para vender. Quer um site institucional, landing page ou pagina de vendas?`;
  }

  if (systemServicePatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}sim, a ${companyName} trabalha com CRM e Controle de Estoque. Pelo site oficial, e um sistema online para organizar clientes, produtos, estoque e vendas. Voce quer controlar estoque, vendas, clientes ou pedidos?`;
  }

  if (whatsappAutomationPatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}sim, a ${companyName} trabalha com Automacao WhatsApp: atendimento mais rapido com mensagens e fluxos automaticos. Isso ajuda a responder clientes, organizar pedidos e encaminhar oportunidades.`;
  }

  if (productPatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}no site da ${companyName} tem produtos em categorias como acessorios, audio, games, informatica e smartwatch. Para valores e disponibilidade atualizados, o ideal e consultar https://toptecdigital.com/produtos/.`;
  }

  if (servicesPatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}pelo site oficial, a ${companyName} oferece desenvolvimento de sites, aplicativos, automacao WhatsApp, marketing digital, infraestrutura de TI, consultoria em TI e CRM/controle de estoque. Qual desses voce quer entender melhor?`;
  }

  if (identityPatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}eu sou um robo da ${companyName}. Estou aqui para apresentar nossos servicos e produtos, tirar duvidas iniciais e ajudar voce a pedir um orcamento.`;
  }

  if (attendantPatterns.some((pattern) => pattern.test(normalized))) {
    return `${greeting}claro. Para falar com o atendimento ativo da ${companyName}, chame no WhatsApp: ${activeRobotPhone}.`;
  }

  return null;
}

export function shouldNotifyAdmin(text) {
  const normalized = normalizeText(text);
  return budgetPatterns.some((pattern) => pattern.test(normalized));
}

export function getConversationTopic(text) {
  const normalized = normalizeText(text);

  if (aiPatterns.some((pattern) => pattern.test(normalized))) {
    return 'ai';
  }

  if (budgetPatterns.some((pattern) => pattern.test(normalized))) {
    return 'budget';
  }

  if (servicesPatterns.some((pattern) => pattern.test(normalized))) {
    return 'services';
  }

  return null;
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
