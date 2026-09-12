import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAudioTranscript } from '../src/audio-normalizer.js';

test('normaliza erro comum do Whisper para oi toptec digital', () => {
  assert.equal(normalizeAudioTranscript('o oito pra ter que desvitar.'), 'oi toptec digital');
  assert.equal(normalizeAudioTranscript('oito apeteque de vital'), 'oi toptec digital');
});

test('normaliza audio em que o cliente explicou que so disse oi', () => {
  assert.equal(normalizeAudioTranscript('Eu so disse oi.'), 'oi');
});

test('preserva transcricao util', () => {
  assert.equal(
    normalizeAudioTranscript('Queria saber sobre sistema de estoque'),
    'Queria saber sobre sistema de estoque'
  );
});
