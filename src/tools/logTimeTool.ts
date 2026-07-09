import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { WS } from '../config/worksnaps.config.js';
import { env } from '../env.js';
import { getCurrentUser, isSuccessStatus, postOfflineTimeEntry } from '../services/worksnapsApiService.js';
import { dateToFromTimestamp, requireToken, todayLocalISO } from '../utils/token.js';
import { extractTagText } from '../utils/xml.js';
import { toolError, toolText } from '../utils/toolResponse.js';

export function registerLogTimeTool(server: McpServer): void {
  const cfg = WS.TOOLS.LOG_TIME;
  server.tool(
    cfg.NAME,
    cfg.DESCRIPTION,
    {
      token: z.string().optional().describe(cfg.TOKEN_DESCRIPTION),
      minutes: z.number().int().positive().describe(cfg.MINUTES_DESCRIPTION),
      comment: z.string().nullable().optional().describe(cfg.COMMENT_DESCRIPTION),
      projectId: z.number().int().positive().optional().describe(cfg.PROJECT_DESCRIPTION),
      taskId: z.number().int().positive().optional().describe(cfg.TASK_DESCRIPTION),
      date: z.string().regex(WS.DATE.PATTERN, WS.DATE.PATTERN_MESSAGE).optional().describe(cfg.DATE_DESCRIPTION),
      startHour: z.number().int().min(0).max(23).optional().describe(cfg.START_HOUR_DESCRIPTION),
    },
    async (args) => {
      try {
        const apiToken = requireToken(args.token);
        const projectId = args.projectId ?? Number(env.DEFAULT_PROJECT_ID);
        const taskId = args.taskId ?? Number(env.DEFAULT_TASK_ID);
        if (!projectId) {
          throw new Error(WS.MESSAGES.PROJECT_ID_REQUIRED);
        }
        if (!taskId) {
          throw new Error(WS.MESSAGES.TASK_ID_REQUIRED);
        }

        const date = args.date ?? todayLocalISO();
        const startHour = args.startHour ?? 9;
        const user = await getCurrentUser(apiToken);
        const result = await postOfflineTimeEntry(apiToken, {
          projectId,
          taskId,
          minutes: args.minutes,
          comment: args.comment ?? null,
          date,
          startHour,
        });

        const ok = isSuccessStatus(result.status);
        const entryId = extractTagText(result.body, 'id');
        const fromTimestamp = dateToFromTimestamp(date, startHour);
        const body = result.body.slice(0, WS.LIMITS.RESPONSE_BODY_SLICE) || WS.LIMITS.EMPTY_BODY;
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.login;

        return toolText(
          `${ok ? cfg.SUCCESS : cfg.FAILURE} as ${fullName}\n` +
            `POST ${result.url}\n` +
            `HTTP ${result.status}\n` +
            `projectId: ${projectId}, taskId: ${taskId}, minutes: ${args.minutes}\n` +
            `date: ${date}, from_timestamp: ${fromTimestamp}` +
            (entryId ? `, entryId: ${entryId}` : '') +
            `\n\n${body}`,
          !ok,
        );
      } catch (error) {
        return toolError(error, cfg.TOOL_FAILURE);
      }
    },
  );
}
