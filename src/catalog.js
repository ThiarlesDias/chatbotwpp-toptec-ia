const SERVICE_CATALOG = [
  {
    id: 'sites',
    title: 'Desenvolvimento de Sites',
    short: 'sites modernos, responsivos e pensados para vender',
    description: 'criacao de sites institucionais, landing pages, catalogos, lojas e paginas profissionais com foco em velocidade, clareza e conversao',
    details: [
      'layout responsivo para celular e computador',
      'estrutura pensada para SEO e velocidade',
      'integracao com WhatsApp, formularios e pagamentos'
    ],
    qualify: 'O site seria para apresentar a empresa, vender, receber pedidos ou captar contatos?',
    keywords: [
      /\bsite(s)?\b/,
      /\blanding\b/,
      /\bpagina(s)?\b/,
      /\bcatalogo(s)?\b/,
      /\bloja virtual\b/,
      /\becommerce\b/,
      /\be commerce\b/
    ]
  },
  {
    id: 'apps',
    title: 'Desenvolvimento de aplicativos',
    short: 'apps sob medida para atendimento, vendas e operacao',
    description: 'planejamento e desenvolvimento de aplicativos para transformar processos manuais em experiencias simples para clientes e equipes',
    details: [
      'fluxos sob medida para o negocio',
      'prototipo antes do desenvolvimento',
      'publicacao e evolucao planejadas por etapa'
    ],
    qualify: 'Esse app seria usado por clientes, pela equipe interna ou pelos dois?',
    keywords: [
      /\bapp(s)?\b/,
      /\baplicativo(s)?\b/,
      /\bandroid\b/,
      /\bios\b/,
      /\bmobile\b/
    ]
  },
  {
    id: 'whatsapp',
    title: 'Automacao WhatsApp',
    short: 'atendimento mais rapido com mensagens e fluxos automaticos',
    description: 'automacoes para WhatsApp com perguntas frequentes, captacao de leads, triagem de atendimento e encaminhamento para vendas',
    details: [
      'respostas automaticas para perguntas repetidas',
      'captacao e qualificacao de clientes',
      'encaminhamento para atendimento humano quando necessario'
    ],
    qualify: 'Hoje voce quer automatizar respostas, captar leads ou integrar o WhatsApp com planilha, CRM, site ou loja?',
    keywords: [
      /\bwhatsapp\b/,
      /\bwpp\b/,
      /\brobo(s)?\b/,
      /\bbot(s)?\b/,
      /\bchatbot(s)?\b/,
      /\bia\b/,
      /\bautomacao\b/,
      /\batendimento automatico\b/,
      /\bmensagem automatica\b/
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing Digital',
    short: 'estrategia, campanhas e presenca digital para gerar demanda',
    description: 'apoio para a marca aparecer melhor, medir resultados e transformar visitas em contatos reais para venda',
    details: [
      'campanhas alinhadas ao objetivo do negocio',
      'criativos, paginas e funis de contato',
      'acompanhamento de metricas importantes'
    ],
    qualify: 'Voce quer gerar mensagens, vendas, visitas ou leads? E qual cidade ou regiao deseja atingir?',
    keywords: [
      /\bmarketing\b/,
      /\banuncio(s)?\b/,
      /\bcampanha(s)?\b/,
      /\btrafego\b/,
      /\bgoogle\b/,
      /\bfacebook\b/,
      /\binstagram\b/,
      /\blead(s)?\b/,
      /\bvenda(s)? online\b/
    ]
  },
  {
    id: 'infra',
    title: 'Infraestrutura de TI',
    short: 'rede, computadores, servidores e ambiente mais organizado',
    description: 'organizacao da estrutura de tecnologia da empresa para reduzir paradas, melhorar seguranca e deixar a operacao mais estavel',
    details: [
      'diagnostico de rede e equipamentos',
      'organizacao de infraestrutura fisica e logica',
      'recomendacoes para seguranca e continuidade'
    ],
    qualify: 'O problema principal hoje e rede, internet, computador, servidor ou organizacao do ambiente?',
    keywords: [
      /\binfra\b/,
      /\binfraestrutura\b/,
      /\brede(s)?\b/,
      /\bservidor(es)?\b/,
      /\bcomputador(es)?\b/,
      /\bti\b/,
      /\binternet\b/,
      /\bequipamento(s)?\b/
    ]
  },
  {
    id: 'consultoria',
    title: 'Consultoria em TI',
    short: 'orientacao tecnica para escolher melhor e gastar certo',
    description: 'avaliacao de necessidades, prioridades e riscos para indicar o melhor caminho em sistemas, equipamentos, seguranca e processos',
    details: [
      'diagnostico claro do cenario atual',
      'plano de acao por prioridade',
      'apoio para compra, implantacao ou melhoria de sistemas'
    ],
    qualify: 'Voce precisa decidir uma compra, melhorar seguranca, reduzir custo ou organizar processos?',
    keywords: [
      /\bconsultoria\b/,
      /\bavaliacao\b/,
      /\bdiagnostico\b/,
      /\bseguranca\b/,
      /\bprocesso(s)?\b/,
      /\bmelhoria(s)?\b/,
      /\bescolher\b/,
      /\bgastar certo\b/
    ]
  },
  {
    id: 'crm-estoque',
    title: 'CRM e Controle de Estoque',
    short: 'sistema online para organizar clientes, produtos, estoque e vendas',
    description: 'sistema online para empresas organizarem clientes, atendimentos, produtos, estoque, pedidos e vendas',
    details: [
      'clientes, atendimentos, produtos, estoque e pedidos',
      'planos Start, Professional e Business',
      'teste inicial de 7 dias depois da liberacao pela TopTec'
    ],
    qualify: 'Voce quer controlar clientes, estoque, pedidos, financeiro, equipe ou tudo junto?',
    keywords: [
      /\bcrm\b/,
      /\bestoque\b/,
      /\btopgestor\b/,
      /\bgestor\b/,
      /\bcliente(s)?\b/,
      /\bpedido(s)?\b/,
      /\bordem de servico\b/,
      /\bfinanceiro\b/
    ]
  }
];

const PRODUCT_CATEGORIES = ['Acessorios', 'Audio', 'Games', 'Informatica', 'Smartwatch'];

const FEATURED_PRODUCT_EXAMPLES = [
  'carregador sem fio',
  'carregador USB-C/GaN',
  'console de jogo portatil retro',
  'gamepad ou controle sem fio',
  'fone de ouvido Bluetooth',
  'controle remoto universal',
  'smartwatch',
  'alto-falante para computador',
  'organizador de ferramentas'
];

const POSITIVE_FOLLOW_UP = /^(sim|quero|pode|pode sim|isso|isso mesmo|me explica|explica|fala mais|me fala mais|detalhe|detalhes)$/;

export function getCatalogReply(text, options = {}) {
  const normalized = normalizeText(text);
  const service = findService(normalized);
  const greeting = buildGreeting(options.customerName);
  const companyName = options.companyName || 'TOPTEC DIGITAL';
  const siteUrl = options.siteUrl || 'https://toptecdigital.com';

  if (POSITIVE_FOLLOW_UP.test(normalized) && options.lastTopic) {
    return buildFollowUpReply(options.lastTopic, { greeting, companyName, siteUrl });
  }

  if (wantsServicesOverview(normalized)) {
    return buildServicesOverview({ greeting, companyName });
  }

  if (wantsTopGestor(normalized)) {
    return buildServiceReply(getServiceById('crm-estoque'), { greeting, companyName });
  }

  if (wantsGenericSystem(normalized)) {
    return [
      `${greeting}a ${companyName} pode ajudar com sistemas de duas formas principais: aplicativo sob medida e CRM/Controle de Estoque.`,
      'O app entra quando voce precisa de algo personalizado para clientes ou equipe. O CRM/estoque entra quando o foco e organizar clientes, produtos, pedidos e vendas.',
      'Me diga qual processo voce quer organizar que eu te oriento pelo caminho certo.'
    ].join('\n\n');
  }

  if (service) {
    return buildServiceReply(service, { greeting, companyName });
  }

  if (wantsProductsOverview(normalized)) {
    return buildProductsReply({ greeting, companyName, siteUrl });
  }

  return null;
}

export function detectCatalogTopic(text) {
  const normalized = normalizeText(text);
  const service = findService(normalized);

  if (service) return service.id;
  if (wantsProductsOverview(normalized)) return 'products';
  if (wantsServicesOverview(normalized)) return 'services';
  if (wantsGenericSystem(normalized)) return 'systems';

  return null;
}

export function getServiceCatalog() {
  return SERVICE_CATALOG.map((service) => ({ ...service }));
}

function buildFollowUpReply(topic, context) {
  const service = getServiceById(topic);
  if (service) {
    return [
      `${context.greeting}boa. Para ${service.title}, o proximo passo e entender seu cenario.`,
      service.qualify,
      'Se ja quiser orcamento, me mande cidade/bairro, objetivo, prazo desejado e melhor horario para retorno.'
    ].join('\n\n');
  }

  if (topic === 'products') return buildProductsReply(context);
  if (topic === 'services') return buildServicesOverview(context);

  if (topic === 'systems') {
    return [
      `${context.greeting}para sistema, a TOPTEC DIGITAL pode avaliar app sob medida ou CRM/Controle de Estoque.`,
      'Me conte o que voce quer controlar: clientes, estoque, pedidos, financeiro, atendimento ou outro processo?'
    ].join('\n\n');
  }

  return null;
}

function buildServicesOverview({ greeting, companyName }) {
  const lines = SERVICE_CATALOG.map((service) => `- ${service.title}: ${service.short}.`);
  return [
    `${greeting}pelo site oficial, a ${companyName} trabalha com:`,
    lines.join('\n'),
    'Qual deles voce quer ver com mais detalhe?'
  ].join('\n\n');
}

function buildServiceReply(service, { greeting, companyName }) {
  const details = service.details.map((item) => `- ${item}.`).join('\n');
  return [
    `${greeting}sim. A ${companyName} faz ${service.title}: ${service.description}.`,
    details,
    service.qualify
  ].join('\n\n');
}

function buildProductsReply({ greeting, companyName, siteUrl }) {
  return [
    `${greeting}a ${companyName} tambem tem loja online. As categorias no site sao: ${PRODUCT_CATEGORIES.join(', ')}.`,
    `Exemplos que aparecem na loja: ${FEATURED_PRODUCT_EXAMPLES.join(', ')}.`,
    `Para preco e disponibilidade atual, o melhor e consultar ${siteUrl}/produtos/ ou me dizer o produto que voce procura.`
  ].join('\n\n');
}

function findService(normalized) {
  return SERVICE_CATALOG.find((service) => service.keywords.some((pattern) => pattern.test(normalized))) || null;
}

function getServiceById(id) {
  return SERVICE_CATALOG.find((service) => service.id === id) || null;
}

function wantsServicesOverview(normalized) {
  return (
    /^(servico|servicos)$/.test(normalized) ||
    /\bservico(s)?\b/.test(normalized) ||
    /\bquais servicos\b/.test(normalized) ||
    /\bque servicos\b/.test(normalized) ||
    /\bque tipo de servico/.test(normalized) ||
    /\bservicos voces\b/.test(normalized) ||
    /\bo que voces fazem\b/.test(normalized) ||
    /\bo que vcs fazem\b/.test(normalized) ||
    /\bvoces fazem o que\b/.test(normalized) ||
    /\bvcs fazem o que\b/.test(normalized) ||
    /\bcom o que trabalham\b/.test(normalized) ||
    /\btoptec faz\b/.test(normalized)
  );
}

function wantsProductsOverview(normalized) {
  return (
    /\bproduto(s)?\b/.test(normalized) ||
    /\bloja\b/.test(normalized) ||
    /\bcomprar\b/.test(normalized) ||
    /\bvende(m)?\b/.test(normalized) ||
    /\bacessorio(s)?\b/.test(normalized) ||
    /\baudio\b/.test(normalized) ||
    /\bgames?\b/.test(normalized) ||
    /\binformatica\b/.test(normalized) ||
    /\bsmartwatch\b/.test(normalized) ||
    /\bcarregador\b/.test(normalized) ||
    /\bfone\b/.test(normalized) ||
    /\bcontrole\b/.test(normalized)
  );
}

function wantsTopGestor(normalized) {
  return /\btopgestor\b/.test(normalized) || /\btop gestor\b/.test(normalized);
}

function wantsGenericSystem(normalized) {
  return /\bsistema(s)?\b/.test(normalized) && !findService(normalized);
}

function buildGreeting(name) {
  return name ? `${name}, ` : '';
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
