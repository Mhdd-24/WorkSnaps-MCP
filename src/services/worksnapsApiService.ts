import { WS } from '../config/worksnaps.config.js';
import { env } from '../env.js';
import type {
  OfflineTimeEntryRequest,
  WorksnapsApiResult,
  WorksnapsProject,
  WorksnapsTask,
  WorksnapsUser,
} from '../interfaces/worksnaps.js';
import { buildBasicAuthHeader, dateToFromTimestamp } from '../utils/token.js';
import { buildOfflineTimeEntryXml, extractElements, extractTagText, parseApiError } from '../utils/xml.js';

function apiUrl(path: string): string {
  const base = env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolvePath(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`{${key}}`, encodeURIComponent(String(value))),
    template,
  );
}

async function request(
  token: string,
  method: 'GET' | 'POST',
  path: string,
  body?: string,
): Promise<WorksnapsApiResult> {
  const url = apiUrl(path);
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        [WS.HEADERS.ACCEPT]: WS.HEADERS.XML,
        [WS.HEADERS.CONTENT_TYPE]: WS.HEADERS.XML,
        [WS.HEADERS.AUTHORIZATION]: buildBasicAuthHeader(token),
      },
      body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    throw new Error(`${WS.MESSAGES.NETWORK} ${message}`);
  }

  const responseBody = await response.text().catch(() => '');
  if (!response.ok) {
    const apiError = parseApiError(responseBody);
    throw new Error(
      `${WS.MESSAGES.REQUEST_FAILED} ${response.status} ${response.statusText}` +
        (apiError ? `\n${apiError}` : `\n${responseBody.slice(0, WS.LIMITS.ERROR_BODY_SLICE)}`),
    );
  }

  return { status: response.status, body: responseBody, url };
}

function parseUser(xml: string): WorksnapsUser {
  const userId = extractTagText(xml, 'id');
  const login = extractTagText(xml, 'login');
  if (!userId || !login) {
    throw new Error(WS.MESSAGES.PARSE_FAILED);
  }
  return {
    userId,
    login,
    firstName: extractTagText(xml, 'first_name') ?? '',
    lastName: extractTagText(xml, 'last_name') ?? '',
    email: extractTagText(xml, 'email') ?? '',
    timezoneId: extractTagText(xml, 'timezone_id'),
    timezoneName: extractTagText(xml, 'timezone_name'),
  };
}

function parseNamedItems(xml: string, elementName: string): Array<{ id: string; name: string; description?: string }> {
  return extractElements(xml, elementName)
    .map(block => ({
      id: extractTagText(block, 'id') ?? '',
      name: extractTagText(block, 'name') ?? '',
      description: extractTagText(block, 'description'),
    }))
    .filter(item => item.id && item.name);
}

export async function getCurrentUser(token: string): Promise<WorksnapsUser> {
  const result = await request(token, 'GET', WS.API.PATHS.ME);
  return parseUser(result.body);
}

export async function listProjects(token: string): Promise<WorksnapsProject[]> {
  const result = await request(token, 'GET', WS.API.PATHS.PROJECTS);
  return parseNamedItems(result.body, 'project');
}

export async function listTasks(token: string, projectId: number): Promise<WorksnapsTask[]> {
  const path = resolvePath(WS.API.PATHS.TASKS, { projectId });
  const result = await request(token, 'GET', path);
  return parseNamedItems(result.body, 'task');
}

export async function postOfflineTimeEntry(
  token: string,
  requestInput: OfflineTimeEntryRequest,
): Promise<WorksnapsApiResult> {
  const path = resolvePath(WS.API.PATHS.TIME_ENTRIES, { projectId: requestInput.projectId });
  const fromTimestamp = dateToFromTimestamp(requestInput.date, requestInput.startHour ?? 9);
  const body = buildOfflineTimeEntryXml({
    taskId: requestInput.taskId,
    minutes: requestInput.minutes,
    fromTimestamp,
    comment: requestInput.comment,
  });
  return request(token, 'POST', path, body);
}

export function isSuccessStatus(status: number): boolean {
  return status >= WS.HTTP.SUCCESS_MIN && status <= WS.HTTP.SUCCESS_MAX;
}

export function formatNamedList(items: Array<{ id: string; name: string }>, bulletPrefix: string): string {
  return items.map(item => `${bulletPrefix}${item.id}: ${item.name}`).join('\n');
}
