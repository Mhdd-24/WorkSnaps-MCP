import { WS } from '../config/worksnaps.config.js';
import { env } from '../env.js';

export function requireToken(token?: string): string {
  const resolved = token?.trim() || env.API_TOKEN.trim();
  if (!resolved) {
    throw new Error(WS.MESSAGES.NO_TOKEN);
  }
  return resolved;
}

export function buildBasicAuthHeader(token: string): string {
  return `Basic ${Buffer.from(`${token}:`, 'utf8').toString('base64')}`;
}

export function todayLocalISO(): string {
  return new Date().toLocaleDateString(WS.DATE.LOCALE);
}

export function alignToTenMinutes(epochSeconds: number): number {
  return Math.floor(epochSeconds / WS.API.TEN_MINUTE_SECONDS) * WS.API.TEN_MINUTE_SECONDS;
}

export function dateToFromTimestamp(date: string, startHour = 9): number {
  const [year, month, day] = date.split('-').map(Number);
  const local = new Date(year, month - 1, day, startHour, 0, 0, 0);
  return alignToTenMinutes(Math.floor(local.getTime() / 1000));
}
