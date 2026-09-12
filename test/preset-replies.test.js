import assert from 'node:assert/strict';
import test from 'node:test';
import { getPresetReply, shouldNotifyAdmin } from '../src/preset-replies.js';

const options = {
  customerName: 'ThiarlesDias',
  officialPhone: '43991939187',
  activeRobotPhone: '43991939187',
  siteUrl: 'https://toptecdigital.com'
};

test('cumprimenta usando o nome do contato', () => {
  const reply = getPresetReply('oi', 'TOPTEC DIGITAL', options);

  assert.match(reply, /^ThiarlesDias, tudo bem\?/);
  assert.match(reply, /robo da TOPTEC DIGITAL/);
});

test('se apresenta como robo da TOPTEC DIGITAL', () => {
  const reply = getPresetReply('quem e voce?', 'TOPTEC DIGITAL', options);

  assert.match(reply, /robo da TOPTEC DIGITAL/);
  assert.match(reply, /produtos e servicos/);
});

test('orcamento de servico coleta dados para o admin', () => {
  const reply = getPresetReply('quanto custa um site?', 'TOPTEC DIGITAL', options);

  assert.match(reply, /valor de site depende do escopo/);
  assert.match(reply, /cidade\/bairro/);
  assert.match(reply, /melhor horario/);
  assert.match(reply, /admin da TOPTEC DIGITAL/);
});

test('preco de produto aponta para a loja oficial', () => {
  const reply = getPresetReply('qual preco do carregador?', 'TOPTEC DIGITAL', options);

  assert.match(reply, /precos e disponibilidade/);
  assert.match(reply, /https:\/\/toptecdigital\.com\/produtos\//);
});

test('pedido de humano informa telefone ativo', () => {
  const reply = getPresetReply('falar com atendente', 'TOPTEC DIGITAL', options);

  assert.match(reply, /43991939187/);
});

test('reacao de confusao nao cai na IA local', () => {
  const reply = getPresetReply('Como assim?', 'TOPTEC DIGITAL', options);

  assert.match(reply, /desculpa, respondi mal/);
  assert.match(reply, /servicos, produtos, orcamento ou atendimento humano/);
});

test('resposta negativa ou encerramento fecha sem loop', () => {
  const noReply = getPresetReply('Nao so isso', 'TOPTEC DIGITAL', options);
  const okReply = getPresetReply('Ok', 'TOPTEC DIGITAL', options);

  assert.match(noReply, /combinado/);
  assert.match(okReply, /combinado/);
});

test('notifica admin somente quando parece pedido comercial', () => {
  assert.equal(shouldNotifyAdmin('quero orcamento'), true);
  assert.equal(shouldNotifyAdmin('oi'), false);
});
