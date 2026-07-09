# Worksnaps MCP — Project Wiki

Guide for **@mhdd_24/worksnaps-mcp**: Worksnaps time tracking from Cursor via MCP.

---

## 1. What this project does

**worksnaps-mcp** is an MCP server that integrates with the [Worksnaps](https://www.worksnaps.com/) REST API (XML over HTTPS).

| Tool | Worksnaps API | Purpose |
|------|---------------|---------|
| `whoami` | `GET /me.xml` | Verify token; show user id, login, name, email |
| `list_projects` | `GET /projects.xml` | List projects you can access |
| `list_tasks` | `GET /projects/{id}/tasks.xml` | List tasks in a project |
| `log_time` | `POST /projects/{id}/time_entries.xml` | Log offline time for yourself |

---

## 2. Architecture

```
MCP client (Cursor)
  → stdio JSON-RPC
  → src/index.ts (McpServer)
  → tools/*.ts
  → services/worksnapsApiService.ts
  → https://api.worksnaps.com/api/…
```

Layers match Timelog MCP:

| Layer | Location |
|-------|----------|
| Config | `src/config/worksnaps.config.ts` (`WS` constant) |
| Env | `src/env.ts` |
| Interfaces | `src/interfaces/worksnaps.ts` |
| Services | `src/services/worksnapsApiService.ts` |
| Tools | `src/tools/*.ts` |
| Utils | `src/utils/token.ts`, `xml.ts`, `toolResponse.ts` |

---

## 3. Authentication

Worksnaps uses **HTTP Basic Auth**:

- **Username:** your API token
- **Password:** empty (ignored)

Get your token: Worksnaps → **Profile & Settings → Web Service API → Show my API Token**.

---

## 4. Configuration

### Cursor `mcp.json`

```json
"worksnaps": {
  "command": "npx",
  "args": ["-y", "@mhdd_24/worksnaps-mcp"],
  "env": {
    "WORKSNAPS_API_TOKEN": "<token>",
    "WORKSNAPS_DEFAULT_PROJECT_ID": "1234",
    "WORKSNAPS_DEFAULT_TASK_ID": "5678"
  }
}
```

### `.env` (local dev)

Copy `.env.example` to `.env` and fill in values.

---

## 5. Typical workflow

1. **`whoami`** — confirm token works
2. **`list_projects`** — find project ID
3. **`list_tasks`** — find task ID for that project
4. **`log_time`** — log minutes with optional comment

Example:

> Log 720 minutes offline to Worksnaps project 3456 task 12 for today. Comment: Access Control development.

---

## 6. log_time details

POST body (XML):

```xml
<time_entry>
  <task_id type="integer">12</task_id>
  <user_comment>Access Control development</user_comment>
  <from_timestamp type="integer">1334257200</from_timestamp>
  <duration_in_minutes type="integer">720</duration_in_minutes>
</time_entry>
```

- **`from_timestamp`:** derived from `date` + `startHour` (default 9), aligned to 10-minute boundary
- **`duration_in_minutes`:** total offline minutes
- Creates offline time for **yourself** only (per Worksnaps API)

---

## 7. Local development

```bash
cd worksnaps-mcp
npm install
npm run dev    # tsx src/index.ts
npm run build  # tsc → dist/
```

---

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| `No API token provided` | Set `WORKSNAPS_API_TOKEN` in mcp.json or pass `token` per call |
| `401 Unauthorized` | Regenerate token in Worksnaps; update env |
| `projectId is required` | Run `list_projects` or set `WORKSNAPS_DEFAULT_PROJECT_ID` |
| `422 Unprocessable Entity` | Check task belongs to project; verify timestamp boundary |

---

## 9. API reference

Official docs: https://api.worksnaps.com/api_docs/

Swagger spec: https://api.worksnaps.com/api_docs/worksnaps.json

Base URL: `https://api.worksnaps.com/api`
