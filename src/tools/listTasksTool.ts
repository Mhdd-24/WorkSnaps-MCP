import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { WS } from '../config/worksnaps.config.js';
import { formatNamedList, listTasks } from '../services/worksnapsApiService.js';
import { requireToken } from '../utils/token.js';
import { toolError, toolText } from '../utils/toolResponse.js';

export function registerListTasksTool(server: McpServer): void {
  const cfg = WS.TOOLS.LIST_TASKS;
  server.tool(
    cfg.NAME,
    cfg.DESCRIPTION,
    {
      token: z.string().optional().describe(cfg.TOKEN_DESCRIPTION),
      projectId: z.number().int().positive().describe(cfg.PROJECT_DESCRIPTION),
    },
    async ({ token, projectId }) => {
      try {
        const tasks = await listTasks(requireToken(token), projectId);
        if (!tasks.length) {
          return toolText(`${cfg.COUNT_PREFIX} ${projectId}: 0`);
        }
        return toolText(
          `${cfg.COUNT_PREFIX} ${projectId}: ${tasks.length}\n\n${formatNamedList(tasks, cfg.BULLET_PREFIX)}`,
        );
      } catch (error) {
        return toolError(error, cfg.FAILURE);
      }
    },
  );
}
