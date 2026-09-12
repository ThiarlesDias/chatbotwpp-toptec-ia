export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasLooseTerm(normalizedText, terms) {
  const text = normalizeText(normalizedText);
  const tokens = tokenize(text);

  return terms.some((term) => {
    const normalizedTerm = normalizeText(term);

    if (!normalizedTerm) return false;
    if (normalizedTerm.includes(' ')) return hasLoosePhrase(tokens, normalizedTerm);

    return tokens.some((token) => isCloseToken(token, normalizedTerm));
  });
}

export function hasLoosePhrase(normalizedTextOrTokens, phrase) {
  const tokens = Array.isArray(normalizedTextOrTokens)
    ? normalizedTextOrTokens
    : tokenize(normalizeText(normalizedTextOrTokens));
  const phraseTokens = tokenize(normalizeText(phrase));

  if (phraseTokens.length === 0 || tokens.length < phraseTokens.length) {
    return false;
  }

  for (let index = 0; index <= tokens.length - phraseTokens.length; index += 1) {
    const matched = phraseTokens.every((term, offset) => isCloseToken(tokens[index + offset], term));

    if (matched) return true;
  }

  return false;
}

export function isCloseToken(token, expected) {
  if (!token || !expected) return false;
  if (token === expected) return true;

  if (expected.length <= 3 || token.length <= 2) {
    return false;
  }

  if (token[0] !== expected[0]) {
    return false;
  }

  const maxDistance = expected.length <= 5 ? 1 : 2;

  if (Math.abs(token.length - expected.length) > maxDistance) {
    return false;
  }

  return levenshteinDistance(token, expected, maxDistance) <= maxDistance;
}

function tokenize(text) {
  return normalizeText(text)
    .replace(/\?/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function levenshteinDistance(left, right, maxDistance) {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = current[0];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const insertion = current[rightIndex - 1] + 1;
      const deletion = previous[rightIndex] + 1;
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      const value = Math.min(insertion, deletion, substitution);
      current[rightIndex] = value;
      rowMinimum = Math.min(rowMinimum, value);
    }

    if (rowMinimum > maxDistance) {
      return rowMinimum;
    }

    previous = current;
  }

  return previous[right.length];
}
