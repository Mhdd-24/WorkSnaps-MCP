import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { WS } from '../config/worksnaps.config.js';
import { formatNamedList, listProjects } from '../services/worksnapsApiService.js';
import { requireToken } from '../utils/token.js';
import { toolError, toolText } from '../utils/toolResponse.js';

export function registerListProjectsTool(server: McpServer): void {
  const cfg = WS.TOOLS.LIST_PROJECTS;
  server.tool(
    cfg.NAME,
    cfg.DESCRIPTION,
    { token: z.string().optional().describe(cfg.TOKEN_DESCRIPTION) },
    async ({ token }) => {
      try {
        const projects = await listProjects(requireToken(token));
        if (!projects.length) {
          return toolText(`${cfg.COUNT_PREFIX} 0`);
        }
        return toolText(`${cfg.COUNT_PREFIX} ${projects.length}\n\n${formatNamedList(projects, cfg.BULLET_PREFIX)}`);
      } catch (error) {
        return toolError(error, cfg.FAILURE);
      }
    },
  );
}
