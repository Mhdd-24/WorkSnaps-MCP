import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { WS } from '../config/worksnaps.config.js';
import { getCurrentUser } from '../services/worksnapsApiService.js';
import { requireToken } from '../utils/token.js';
import { toolError, toolText } from '../utils/toolResponse.js';

export function registerWhoamiTool(server: McpServer): void {
  const cfg = WS.TOOLS.WHOAMI;
  server.tool(
    cfg.NAME,
    cfg.DESCRIPTION,
    { token: z.string().optional().describe(cfg.TOKEN_DESCRIPTION) },
    async ({ token }) => {
      try {
        const user = await getCurrentUser(requireToken(token));
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.login;
        return toolText(
          `${cfg.RESOLVED_HEADER}\n` +
            `- ${cfg.LABELS.USER_ID}: ${user.userId}\n` +
            `- ${cfg.LABELS.LOGIN}: ${user.login}\n` +
            `- ${cfg.LABELS.NAME}: ${fullName}\n` +
            `- ${cfg.LABELS.EMAIL}: ${user.email || '(not returned)'}\n` +
            `- ${cfg.LABELS.TIMEZONE}: ${user.timezoneName || user.timezoneId || '(not returned)'}`,
        );
      } catch (error) {
        return toolError(error, cfg.FAILURE);
      }
    },
  );
}
