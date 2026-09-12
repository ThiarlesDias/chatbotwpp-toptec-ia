const sessions = new Map();
const MAX_TURNS = 8;
const SESSION_TTL_MS = 1000 * 60 * 60 * 6;

export function getSessionContext(remoteJid) {
  const session = getOrCreateSession(remoteJid);

  return {
    lastTopic: session.lastTopic,
    history: session.turns
      .slice(-6)
      .map((turn) => `${turn.role}: ${turn.text}`)
      .join('\n')
  };
}

export function rememberCustomerMessage(remoteJid, text) {
  rememberTurn(remoteJid, 'contato', text);
}

export function rememberBotMessage(remoteJid, text) {
  rememberTurn(remoteJid, 'robo', text);
}

export function rememberTopic(remoteJid, topic) {
  if (!topic) return;

  const session = getOrCreateSession(remoteJid);
  session.lastTopic = topic;
  session.updatedAt = Date.now();
}

export function clearExpiredSessions(now = Date.now()) {
  for (const [remoteJid, session] of sessions.entries()) {
    if (now - session.updatedAt > SESSION_TTL_MS) {
      sessions.delete(remoteJid);
    }
  }
}

function rememberTurn(remoteJid, role, text) {
  const session = getOrCreateSession(remoteJid);
  session.turns.push({
    role,
    text: String(text || '').replace(/\s+/g, ' ').trim().slice(0, 600)
  });
  session.turns = session.turns.slice(-MAX_TURNS);
  session.updatedAt = Date.now();
}

function getOrCreateSession(remoteJid) {
  clearExpiredSessions();

  if (!sessions.has(remoteJid)) {
    sessions.set(remoteJid, {
      lastTopic: null,
      turns: [],
      updatedAt: Date.now()
    });
  }

  return sessions.get(remoteJid);
}
