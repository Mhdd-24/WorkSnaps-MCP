import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerListProjectsTool } from './listProjectsTool.js';
import { registerListTasksTool } from './listTasksTool.js';
import { registerLogTimeTool } from './logTimeTool.js';
import { registerWhoamiTool } from './whoamiTool.js';

export function registerTools(server: McpServer): void {
  registerWhoamiTool(server);
  registerListProjectsTool(server);
  registerListTasksTool(server);
  registerLogTimeTool(server);
}
