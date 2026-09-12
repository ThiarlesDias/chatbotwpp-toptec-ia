import assert from 'node:assert/strict';
import test from 'node:test';
import { hasLoosePhrase, hasLooseTerm, isCloseToken, normalizeText } from '../src/text-match.js';

test('normaliza acento, pontuacao e espacos', () => {
  assert.equal(normalizeText('  Serviço do Whats!!!  '), 'servico do whats');
});

test('aceita erro pequeno em palavra longa', () => {
  assert.equal(isCloseToken('serviso', 'servico'), true);
  assert.equal(isCloseToken('orcameto', 'orcamento'), true);
  assert.equal(isCloseToken('aplicatvo', 'aplicativo'), true);
});

test('nao aproxima palavras muito curtas para evitar falso positivo', () => {
  assert.equal(isCloseToken('ia', 'ti'), false);
  assert.equal(isCloseToken('ok', 'os'), false);
});

test('encontra termos escritos errado', () => {
  assert.equal(hasLooseTerm('quero um serviso', ['servico']), true);
  assert.equal(hasLooseTerm('quero orsamento', ['orcamento']), true);
});

test('encontra frases com pequeno erro', () => {
  assert.equal(hasLoosePhrase('qem e voce', 'quem e voce'), true);
});
