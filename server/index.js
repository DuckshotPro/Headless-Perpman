#!/usr/bin/env node

/**
 * ====================================================================================================
 * HEADLESS-PERPMAN - REST API SERVER
 * ====================================================================================================
 *
 * Express server that wraps the Perplexity direct API (Cli/perplexity-cli.js)
 * and pushes results to Notion via the official API.
 *
 * ENDPOINTS:
 *   POST /query          - Query Perplexity, get response back as JSON
 *   POST /query-to-notion - Query Perplexity and auto-save result as a Notion page
 *   GET  /status         - Health check
 *
 * SETUP:
 *   cp server/.env.example server/.env
 *   Edit server/.env with your keys
 *   node server/index.js
 *
 * ====================================================================================================
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// Load .env from server/ directory or root
const envPath = fs.existsSync(path.join(__dirname, '.env'))
  ? path.join(__dirname, '.env')
  : path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}

const { PerplexityClient } = require('../Cli/perplexity-cli.js');
const NotionPusher = require('./notion-pusher.js');

const PORT = process.env.SERVER_PORT || 3001;

// ====================================================================================================
// HELPERS
// ====================================================================================================

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, data) {
  const json = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

function getApiKey() {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error('PERPLEXITY_API_KEY not set in environment or .env file');
  return key;
}

// ====================================================================================================
// ROUTE HANDLERS
// ====================================================================================================

async function handleStatus(req, res) {
  send(res, 200, {
    ok: true,
    service: 'headless-perpman-server',
    version: '1.0.0',
    notion: !!process.env.NOTION_API_KEY,
    perplexity: !!process.env.PERPLEXITY_API_KEY,
    timestamp: new Date().toISOString(),
  });
}

async function handleQuery(req, res) {
  const body = await parseBody(req);
  const { prompt, model = 'sonar-pro', stream = false } = body;

  if (!prompt) return send(res, 400, { error: 'prompt is required' });

  const client = new PerplexityClient(getApiKey(), model);
  const response = await client.sendMessage(prompt, false); // non-streaming for REST

  send(res, 200, {
    ok: true,
    prompt,
    model,
    response,
    timestamp: new Date().toISOString(),
  });
}

async function handleQueryToNotion(req, res) {
  const body = await parseBody(req);
  const {
    prompt,
    model = 'sonar-pro',
    pageTitle,
    parentPageId,   // optional: notion page ID to nest under
    databaseId,     // optional: notion database ID to add row to
  } = body;

  if (!prompt) return send(res, 400, { error: 'prompt is required' });

  const notionKey = process.env.NOTION_API_KEY;
  if (!notionKey) return send(res, 500, { error: 'NOTION_API_KEY not set' });

  // 1. Query Perplexity
  const client = new PerplexityClient(getApiKey(), model);
  const response = await client.sendMessage(prompt, false);

  // 2. Push to Notion
  const pusher = new NotionPusher(notionKey);
  const title = pageTitle || `Perplexity: ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}`;

  const notionResult = await pusher.createPage({
    title,
    content: response,
    prompt,
    model,
    parentPageId,
    databaseId,
  });

  send(res, 200, {
    ok: true,
    prompt,
    model,
    response,
    notion: {
      pageId: notionResult.id,
      url: notionResult.url,
      title,
    },
    timestamp: new Date().toISOString(),
  });
}

// ====================================================================================================
// ROUTER
// ====================================================================================================

async function router(req, res) {
  // CORS headers for local n8n / agent access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return send(res, 204, {});

  try {
    if (req.method === 'GET' && req.url === '/status') return await handleStatus(req, res);
    if (req.method === 'POST' && req.url === '/query') return await handleQuery(req, res);
    if (req.method === 'POST' && req.url === '/query-to-notion') return await handleQueryToNotion(req, res);

    send(res, 404, { error: 'Not found', endpoints: ['GET /status', 'POST /query', 'POST /query-to-notion'] });
  } catch (err) {
    console.error('[server] Error:', err.message);
    send(res, 500, { error: err.message });
  }
}

// ====================================================================================================
// MAIN
// ====================================================================================================

const server = http.createServer(router);

server.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════╗`);
  console.log(`║  Headless-Perpman Server  v1.0.0              ║`);
  console.log(`╚═══════════════════════════════════════════════╝`);
  console.log(`\n  🟢 Listening on http://localhost:${PORT}`);
  console.log(`  🔑 Perplexity key: ${process.env.PERPLEXITY_API_KEY ? '✅ set' : '❌ MISSING'}`);
  console.log(`  📓 Notion key:     ${process.env.NOTION_API_KEY ? '✅ set' : '❌ MISSING'}\n`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /status`);
  console.log(`    POST /query            { prompt, model? }`);
  console.log(`    POST /query-to-notion  { prompt, model?, pageTitle?, parentPageId?, databaseId? }\n`);
});

module.exports = server;
