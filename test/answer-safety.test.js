import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSafeFallback, sanitizeAnswer } from '../src/answer-safety.js';

const options = {
  customerName: 'ThiarlesDias',
  botDisplayName: 'Charlie',
  companyName: 'TOPTEC DIGITAL',
  inputText: 'Servico'
};

test('bloqueia recusa absurda sobre servico da TOPTEC', () => {
  const reply = sanitizeAnswer(
    'Desculpe, mas nao posso fornecer servicos de desenvolvimento de aplicativos.',
    options
  );

  assert.match(reply, /TOPTEC DIGITAL trabalha com sites/);
  assert.doesNotMatch(reply, /nao posso fornecer/);
});

test('bloqueia resposta seca com titulo de servico', () => {
  const reply = sanitizeAnswer('Desenvolvimento de aplicativos. Quer mais alguma coisa?', {
    ...options,
    inputText: 'Oxe'
  });

  assert.match(reply, /posso te ajudar/);
  assert.doesNotMatch(reply, /^Desenvolvimento de aplicativos/);
});

test('bloqueia roteiro exposto para cliente', () => {
  const reply = sanitizeAnswer('Aqui esta uma possivel continuacao:\nCliente: oi\nRobo: ola', options);

  assert.match(reply, /posso te ajudar/);
  assert.doesNotMatch(reply, /Cliente:/);
});

test('fallback de servico mostra catalogo resumido', () => {
  const reply = buildSafeFallback(options);

  assert.match(reply, /sites, aplicativos, automacao WhatsApp/);
});

test('fallback de saudacao se apresenta como Charlie', () => {
  const reply = buildSafeFallback({
    ...options,
    inputText: 'Oi'
  });

  assert.match(reply, /Sou o Charlie, robo da TOPTEC DIGITAL/);
});
