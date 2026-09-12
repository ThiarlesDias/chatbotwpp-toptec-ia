import assert from 'node:assert/strict';
import test from 'node:test';
import { detectCatalogTopic, getCatalogReply, getServiceCatalog } from '../src/catalog.js';

const baseOptions = {
  companyName: 'TOPTEC DIGITAL',
  customerName: 'ThiarlesDias',
  siteUrl: 'https://toptecdigital.com'
};

test('lista todos os servicos oficiais quando o cliente pergunta o que faz', () => {
  const reply = getCatalogReply('que tipo de servicos voces fazem?', baseOptions);

  assert.match(reply, /Desenvolvimento de Sites/);
  assert.match(reply, /Desenvolvimento de aplicativos/);
  assert.match(reply, /Automacao WhatsApp/);
  assert.match(reply, /Marketing Digital/);
  assert.match(reply, /Infraestrutura de TI/);
  assert.match(reply, /Consultoria em TI/);
  assert.match(reply, /CRM e Controle de Estoque/);
});

test('responde sobre desenvolvimento de sites com qualificacao comercial', () => {
  const reply = getCatalogReply('voces fazem site?', baseOptions);

  assert.match(reply, /TOPTEC DIGITAL faz Desenvolvimento de Sites/);
  assert.match(reply, /responsivo/);
  assert.match(reply, /WhatsApp/);
  assert.match(reply, /vender|receber pedidos|captar contatos/);
});

test('responde sobre robo de WhatsApp sem inventar produto fora do site', () => {
  const reply = getCatalogReply('quero robo de atendimento para whatsapp', baseOptions);

  assert.match(reply, /Automacao WhatsApp/);
  assert.match(reply, /perguntas frequentes/);
  assert.match(reply, /leads/);
  assert.match(reply, /atendimento humano/);
});

test('responde sobre estoque pelo CRM e TopGestor', () => {
  const reply = getCatalogReply('sistema de estoque', baseOptions);

  assert.match(reply, /CRM e Controle de Estoque/);
  assert.match(reply, /clientes/);
  assert.match(reply, /produtos/);
  assert.match(reply, /pedidos/);
});

test('responde sobre produtos com categorias e link da loja', () => {
  const reply = getCatalogReply('quais produtos voces vendem?', baseOptions);

  assert.match(reply, /Acessorios/);
  assert.match(reply, /Audio/);
  assert.match(reply, /Games/);
  assert.match(reply, /Informatica/);
  assert.match(reply, /Smartwatch/);
  assert.match(reply, /https:\/\/toptecdigital\.com\/produtos\//);
});

test('usa assunto anterior para continuar resposta curta', () => {
  const reply = getCatalogReply('sim', {
    ...baseOptions,
    lastTopic: 'whatsapp'
  });

  assert.match(reply, /Automacao WhatsApp/);
  assert.match(reply, /automatizar respostas|captar leads|integrar/);
});

test('detecta topicos comerciais', () => {
  assert.equal(detectCatalogTopic('quero um app'), 'apps');
  assert.equal(detectCatalogTopic('quero marketing no instagram'), 'marketing');
  assert.equal(detectCatalogTopic('produto'), 'products');
});

test('catalogo oficial tem sete servicos', () => {
  assert.equal(getServiceCatalog().length, 7);
});
