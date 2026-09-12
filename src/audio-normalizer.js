export function normalizeAudioTranscript(text) {
  const normalized = normalizeText(text);

  if (/^eu so disse oi\b/.test(normalized)) {
    return 'oi';
  }

  if (looksLikeToptecGreeting(normalized)) {
    return 'oi toptec digital';
  }

  return String(text || '').trim();
}

function looksLikeToptecGreeting(normalized) {
  const words = normalized.split(/\s+/).filter(Boolean);
  const shortEnough = words.length > 0 && words.length <= 8;
  const hasGreeting = /\b(oi|ola|opa|oito|e ai)\b/.test(normalized);
  const hasToptecLikeWord = /\b(toptec|top tec|topite|topit|topteque|topeteque|apeteque|digital|vital|desvitar)\b/.test(normalized);

  return shortEnough && hasGreeting && hasToptecLikeWord;
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
