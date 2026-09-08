export function getMessageText(message) {
  const content = message.message;

  if (!content) return '';

  return (
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    ''
  ).trim();
}

export function getMessageType(message) {
  const content = message.message;

  if (!content) return 'unknown';
  if (content.audioMessage) return 'audio';
  if (content.ptvMessage) return 'video-note';
  if (content.imageMessage) return 'image';
  if (content.videoMessage) return 'video';
  if (content.documentMessage) return 'document';
  if (content.stickerMessage) return 'sticker';
  if (content.conversation || content.extendedTextMessage) return 'text';

  return 'unknown';
}

export function isGroupMessage(remoteJid) {
  return remoteJid?.endsWith('@g.us');
}
