import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.js';

const conversations = new Map();
const ttlMs = 24 * 60 * 60 * 1000;

loadConversations();

export function getConversation(remoteJid) {
  const conversation = conversations.get(remoteJid);

  if (!conversation || Date.now() - conversation.updatedAt > ttlMs) {
    conversations.delete(remoteJid);
    return {};
  }

  return conversation;
}

export function updateConversation(remoteJid, patch) {
  const current = getConversation(remoteJid);
  conversations.set(remoteJid, {
    ...current,
    ...patch,
    updatedAt: Date.now()
  });
  saveConversations();
}

export function appendConversationTurn(remoteJid, role, text) {
  const current = getConversation(remoteJid);
  const history = [
    ...(current.history || []),
    { role, text: String(text).slice(0, 1000) }
  ].slice(-8);

  updateConversation(remoteJid, { history });
}

function loadConversations() {
  if (!existsSync(config.stateFile)) return;

  try {
    const parsed = JSON.parse(readFileSync(config.stateFile, 'utf8'));
    for (const [remoteJid, conversation] of Object.entries(parsed)) {
      conversations.set(remoteJid, conversation);
    }
  } catch (error) {
    console.warn(`Nao consegui carregar ${config.stateFile}:`, error.message);
  }
}

function saveConversations() {
  try {
    mkdirSync(dirname(config.stateFile), { recursive: true });
    writeFileSync(config.stateFile, JSON.stringify(Object.fromEntries(conversations), null, 2));
  } catch (error) {
    console.warn(`Nao consegui salvar ${config.stateFile}:`, error.message);
  }
}
