# Headless-Perpman Server

A zero-dependency Express-like REST server that wraps the Perplexity direct API and pushes results straight into Notion.

---

## Setup

### 1. Copy and fill the env file
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
PERPLEXITY_API_KEY=pplx-...
NOTION_API_KEY=secret_...
```

### 2. Get your Notion integration key
1. Go to https://www.notion.so/my-integrations
2. Click **New integration**
3. Name it `Headless-Perpman`, give it **Read + Write + Insert** content permissions
4. Copy the **Internal Integration Token** → paste as `NOTION_API_KEY`
5. Open any Notion page you want to save to → **Share → Invite your integration**

### 3. Start the server
```bash
node server/index.js
```

---

## Endpoints

### `GET /status`
Health check — confirms keys are loaded.
```json
{ "ok": true, "perplexity": true, "notion": true }
```

---

### `POST /query`
Query Perplexity, get the response back as JSON. No Notion.

**Body:**
```json
{
  "prompt": "What is the latest in AI agents?",
  "model": "sonar-pro"
}
```

**Response:**
```json
{
  "ok": true,
  "prompt": "What is the latest in AI agents?",
  "model": "sonar-pro",
  "response": "...",
  "timestamp": "2026-03-06T..."
}
```

---

### `POST /query-to-notion`
Query Perplexity **and** auto-create a Notion page with the result.

**Body:**
```json
{
  "prompt": "Summarize the top 5 LLM frameworks in 2026",
  "model": "sonar-pro",
  "pageTitle": "LLM Frameworks 2026",
  "parentPageId": "your-notion-page-id-here"
}
```

**Response:**
```json
{
  "ok": true,
  "prompt": "...",
  "response": "...",
  "notion": {
    "pageId": "abc123",
    "url": "https://notion.so/...",
    "title": "LLM Frameworks 2026"
  }
}
```

**Body options:**
| Field | Required | Description |
|-------|----------|-------------|
| `prompt` | ✅ | The question to ask Perplexity |
| `model` | ❌ | `sonar`, `sonar-pro`, `sonar-reasoning` (default: `sonar-pro`) |
| `pageTitle` | ❌ | Notion page title (auto-generated from prompt if omitted) |
| `parentPageId` | ❌ | Nest page under this Notion page ID |
| `databaseId` | ❌ | Add as a row to this Notion database |

---

## n8n Integration

1. Add an **HTTP Request** node
2. Method: `POST`
3. URL: `http://localhost:3001/query-to-notion`
4. Body (JSON):
```json
{
  "prompt": "{{ $json.prompt }}",
  "model": "sonar-pro",
  "parentPageId": "your-page-id"
}
```
5. That's it — Notion page gets created automatically on every workflow run.

---

## AutonomiX / Agent Integration

Any agent can hit the server directly:
```python
import requests

result = requests.post('http://localhost:3001/query-to-notion', json={
    'prompt': task_description,
    'model': 'sonar-pro',
    'parentPageId': NOTION_RESEARCH_PAGE_ID
})
print(result.json()['notion']['url'])
```

---

## File Structure
```
server/
├── index.js          # Main server + route handlers
├── notion-pusher.js  # Notion REST API wrapper
├── .env.example      # Copy to .env and fill in keys
└── README.md         # This file
```
