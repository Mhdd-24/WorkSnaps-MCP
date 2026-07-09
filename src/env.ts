import dotenv from 'dotenv';

import { WS } from './config/worksnaps.config.js';

dotenv.config();

function readEnv(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }
  return undefined;
}

export const env = {
  API_TOKEN: readEnv(WS.ENV.API_TOKEN_KEYS) ?? '',
  BASE_URL: readEnv(WS.ENV.BASE_URL_KEYS) ?? WS.API.DEFAULT_BASE_URL,
  DEFAULT_PROJECT_ID: readEnv(WS.ENV.DEFAULT_PROJECT_ID_KEYS) ?? '',
  DEFAULT_TASK_ID: readEnv(WS.ENV.DEFAULT_TASK_ID_KEYS) ?? '',
};

export function validateEnv(): void {
  if (!env.API_TOKEN.trim()) {
    console.error(WS.MESSAGES.MISSING_TOKEN_HINT);
  }
}
