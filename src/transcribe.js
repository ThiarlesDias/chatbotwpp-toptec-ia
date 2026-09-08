import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { config } from './config.js';

const execFileAsync = promisify(execFile);

export async function transcribeAudioMessage(message, socket, logger) {
  if (!config.transcribeEnabled) {
    return '';
  }

  await mkdir(config.audioDir, { recursive: true });

  const audioBuffer = await downloadMediaMessage(
    message,
    'buffer',
    {},
    {
      logger,
      reuploadRequest: socket.updateMediaMessage
    }
  );

  const timestamp = Date.now();
  const baseName = `audio-${timestamp}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(config.audioDir, `${baseName}.ogg`);

  await writeFile(inputPath, audioBuffer);

  try {
    const { stdout } = await execFileAsync(
      'python3',
      [
        'scripts/transcribe_audio.py',
        inputPath,
        '--model',
        config.whisperModel,
        '--language',
        config.whisperLanguage
      ],
      {
        timeout: config.transcribeTimeoutMs,
        maxBuffer: 1024 * 1024 * 2
      }
    );

    const result = JSON.parse(stdout.trim());
    const text = String(result.text || '').trim();

    if (!text || text.length < config.minTranscriptChars) {
      return '';
    }

    if (result.no_speech_prob !== null && result.no_speech_prob > 0.85) {
      return '';
    }

    if (result.avg_logprob !== null && result.avg_logprob < -1.4) {
      return '';
    }

    return text;
  } finally {
    if (config.keepAudioFiles !== true) {
      await rm(inputPath, { force: true });
    }
  }
}
