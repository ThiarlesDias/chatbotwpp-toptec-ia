import 'dotenv/config';

export const config = {
  botName: process.env.BOT_NAME || 'ChatbotWpp',
  botDisplayName: process.env.BOT_DISPLAY_NAME || 'Charlie',
  companyName: process.env.COMPANY_NAME || 'TOPTEC DIGITAL',
  officialPhone: process.env.OFFICIAL_PHONE || '43991939187',
  adminPhone: process.env.ADMIN_PHONE || '43999612132',
  activeRobotPhone: process.env.ACTIVE_ROBOT_PHONE || '43991939187',
  siteUrl: process.env.SITE_URL || 'https://toptecdigital.com',
  knowledgeFile: process.env.KNOWLEDGE_FILE || 'knowledge/toptec-digital.md',
  audioDir: process.env.AUDIO_DIR || 'data/audio',
  authDir: process.env.AUTH_DIR || 'auth/chatbotwpp-vm',
  transcribeEnabled: (process.env.TRANSCRIBE_AUDIO || 'true').toLowerCase() === 'true',
  whisperModel: process.env.WHISPER_MODEL || 'base',
  whisperLanguage: process.env.WHISPER_LANGUAGE || 'pt',
  transcribeTimeoutMs: Number(process.env.TRANSCRIBE_TIMEOUT_MS || 120000),
  minTranscriptChars: Number(process.env.MIN_TRANSCRIPT_CHARS || 8),
  keepAudioFiles: (process.env.KEEP_AUDIO_FILES || 'false').toLowerCase() === 'true',
  aiProvider: (process.env.AI_PROVIDER || 'ollama').toLowerCase(),
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.1'
  },
  lmStudio: {
    url: process.env.LMSTUDIO_URL || 'http://localhost:1234/v1',
    model: process.env.LMSTUDIO_MODEL || 'local-model'
  },
  maxInputChars: Number(process.env.MAX_INPUT_CHARS || 1800),
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 120000)
};
