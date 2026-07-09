# @mhdd_24/worksnaps-mcp

MCP server for **Worksnaps** time tracking from [Cursor](https://cursor.com) chat. Verify your API token, list projects and tasks, and log offline time without opening the Worksnaps web UI.

Same architecture as Timelog / Flyway / Notepad++ / Caffeine / Workspace Build MCP packages.

**Full documentation:** [docs/WIKI.md](./docs/WIKI.md)

---

## How it works (30 seconds)

```
You (chat)
  → worksnaps-mcp
  → Worksnaps REST API (XML over HTTPS)
  → GET /me.xml | /projects.xml | /tasks.xml
  → POST /projects/{id}/time_entries.xml (offline time)
```

1. Configure `WORKSNAPS_API_TOKEN` (Profile & Settings → Web Service API in Worksnaps)
2. Say **"list Worksnaps projects"** to pick a project ID
3. Say **"list tasks for project 1234"** to pick a task ID
4. Say **"log 480 minutes to Worksnaps project 1234 task 56"** with an optional comment

---

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Node.js 18+** | Uses native `fetch` |
| **Worksnaps API token** | Profile & Settings → Web Service API → Show my API Token |
| **Project + task IDs** | Use `list_projects` / `list_tasks`, or set defaults in env |

---

## Install

### Option A — npm (after publish)

```bash
npm install -g @mhdd_24/worksnaps-mcp
```

### Option B — npx

```bash
npx @mhdd_24/worksnaps-mcp
```

### Option C — clone and build

```bash
git clone https://github.com/Mhdd-24/Worksnaps-MCP.git
cd Worksnaps-MCP
npm install
npm run build
node dist/index.js
```

---

## Configure Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "worksnaps": {
      "command": "npx",
      "args": ["-y", "@mhdd_24/worksnaps-mcp"],
      "env": {
        "WORKSNAPS_API_TOKEN": "<your-api-token>",
        "WORKSNAPS_DEFAULT_PROJECT_ID": "1234",
        "WORKSNAPS_DEFAULT_TASK_ID": "5678"
      }
    }
  }
}
```

**Local development:**

```json
"command": "node",
"args": ["C:/path/to/worksnaps-mcp/dist/index.js"]
```

Reload MCP after saving.

---

## Tools

| Tool | Purpose |
|------|---------|
| `whoami` | Resolve current user from API token (`GET /me.xml`) |
| `list_projects` | List accessible projects |
| `list_tasks` | List tasks in a project |
| `log_time` | Create offline time entry for yourself |

### Chat examples

- "Run whoami on Worksnaps"
- "List Worksnaps projects"
- "List tasks for Worksnaps project 3456"
- "Log 6 hours offline time to Worksnaps project 3456 task 12 — comment: Sprint development"

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `WORKSNAPS_API_TOKEN` | Yes* | API token (Basic auth username; password ignored) |
| `WORKSNAPS_DEFAULT_PROJECT_ID` | No | Default project for `log_time` |
| `WORKSNAPS_DEFAULT_TASK_ID` | No | Default task for `log_time` |
| `WORKSNAPS_BASE_URL` | No | API base URL (default `https://api.worksnaps.com/api`) |

\*Can be passed as `token` per tool call instead.

---

## Notes

- `log_time` creates **offline** time entries (Worksnaps API: POST `/projects/{project_id}/time_entries.xml`).
- `from_timestamp` is aligned to a **10-minute boundary** (Worksnaps API requirement).
- Default `startHour` is **9** (local time) when only a date is provided.

---

## License

ISC
