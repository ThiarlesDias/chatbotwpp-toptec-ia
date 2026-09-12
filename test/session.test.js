import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getSessionContext,
  rememberBotMessage,
  rememberCustomerMessage,
  rememberTopic
} from '../src/session.js';

test('guarda historico curto e ultimo topico por contato', () => {
  const jid = '5511999999999@s.whatsapp.net';

  rememberCustomerMessage(jid, 'quero robo de whatsapp');
  rememberTopic(jid, 'whatsapp');
  rememberBotMessage(jid, 'A TOPTEC DIGITAL faz Automacao WhatsApp.');

  const context = getSessionContext(jid);

  assert.equal(context.lastTopic, 'whatsapp');
  assert.match(context.history, /contato: quero robo de whatsapp/);
  assert.match(context.history, /robo: A TOPTEC DIGITAL faz Automacao WhatsApp/);
});

test('nao mistura contexto de outro contato', () => {
  const context = getSessionContext('554388888888@s.whatsapp.net');

  assert.equal(context.lastTopic, null);
  assert.equal(context.history, '');
});
