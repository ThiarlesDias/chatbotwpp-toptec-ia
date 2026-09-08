const brandMishearPatterns = [
  /apeteque\s+de\s+vital/i,
  /pra\s+ter\s+que\s+desvitar/i,
  /para\s+ter\s+que\s+desvitar/i,
  /topte[cq]\s*de\s*vital/i,
  /topite\s+aqui\s+digital/i,
  /topitec?\s+digital/i,
  /toptec\s+de\s+vital/i,
  /tope?tec\s+digital/i
];

const greetingMishearPatterns = [
  /\boito\b/i,
  /\boi to\b/i,
  /\bo roeio\b/i,
  /\bou la\b/i
];

export function cleanTranscript(transcript) {
  let text = String(transcript || '').replace(/\s+/g, ' ').trim();

  if (!text) return '';

  if (brandMishearPatterns.some((pattern) => pattern.test(text))) {
    text = 'oi TOPTEC DIGITAL';
  }

  if (greetingMishearPatterns.some((pattern) => pattern.test(text)) && /top|apeteque|digital|vital/i.test(text)) {
    text = 'oi TOPTEC DIGITAL';
  }

  if (/responder minha (s[eé]rie|serie)/i.test(text)) {
    text = text.replace(/minha (s[eé]rie|serie)/gi, 'minha mensagem');
  }

  if (/eu so disse oi/i.test(text) || /eu só disse oi/i.test(text)) {
    text = 'oi TOPTEC DIGITAL';
  }

  return text;
}

export function looksLikeBadTranscript(transcript, originalTranscript = transcript) {
  if (transcript !== originalTranscript && /toptec digital/i.test(transcript)) {
    return false;
  }

  const normalized = String(transcript || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return true;

  const weirdFragments = [
    'apeteque',
    'topite',
    'desvitar',
    'roeio',
    'eixe',
    'vital'
  ];

  if (weirdFragments.some((fragment) => normalized.includes(fragment))) {
    return true;
  }

  const words = normalized.split(' ');
  return words.length <= 2 && normalized.length < 10;
}
