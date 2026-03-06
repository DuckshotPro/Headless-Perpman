'use strict';

/**
 * ====================================================================================================
 * NOTION PUSHER
 * ====================================================================================================
 * Handles creating Notion pages from Perplexity responses.
 * Uses the Notion REST API directly — no SDK dependency.
 *
 * Supports:
 *   - Standalone pages (workspace root)
 *   - Pages nested under a parent page
 *   - Rows in a Notion database
 * ====================================================================================================
 */

const https = require('https');

class NotionPusher {
  constructor(apiKey) {
    if (!apiKey) throw new Error('Notion API key is required');
    this.apiKey = apiKey;
    this.version = '2022-06-28';
  }

  // --------------------------------------------------------------------------------------------------
  // PUBLIC
  // --------------------------------------------------------------------------------------------------

  /**
   * Create a Notion page from a Perplexity response.
   *
   * @param {object} opts
   * @param {string} opts.title         - Page title
   * @param {string} opts.content       - Raw text response from Perplexity
   * @param {string} opts.prompt        - Original prompt (stored as callout)
   * @param {string} opts.model         - Model used
   * @param {string} [opts.parentPageId]  - Notion page ID to nest under
   * @param {string} [opts.databaseId]    - Notion database ID to add as a row
   */
  async createPage({ title, content, prompt, model, parentPageId, databaseId }) {
    const parent = this._buildParent(parentPageId, databaseId);
    const properties = this._buildProperties(title, databaseId);
    const children = this._buildChildren(prompt, model, content);

    const body = { parent, properties, children };

    return await this._request('POST', '/v1/pages', body);
  }

  // --------------------------------------------------------------------------------------------------
  // BUILDERS
  // --------------------------------------------------------------------------------------------------

  _buildParent(parentPageId, databaseId) {
    if (databaseId) return { database_id: databaseId };
    if (parentPageId) return { page_id: parentPageId };
    // Workspace root — requires integration to have access
    return { type: 'workspace', workspace: true };
  }

  _buildProperties(title, databaseId) {
    // Database rows need Name property; standalone pages use title
    const titleProp = databaseId ? 'Name' : 'title';
    return {
      [titleProp]: {
        title: [{ text: { content: title } }],
      },
    };
  }

  _buildChildren(prompt, model, content) {
    const blocks = [];

    // Prompt callout block
    blocks.push({
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [{ type: 'text', text: { content: prompt } }],
        icon: { emoji: '💭' },
        color: 'blue_background',
      },
    });

    // Model + timestamp metadata
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: `Model: ${model} · ${new Date().toLocaleString()}` },
            annotations: { italic: true, color: 'gray' },
          },
        ],
      },
    });

    // Divider
    blocks.push({ object: 'block', type: 'divider', divider: {} });

    // Response content — split into 2000-char chunks (Notion block limit)
    const chunks = this._chunkText(content, 1900);
    for (const chunk of chunks) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: chunk } }],
        },
      });
    }

    return blocks;
  }

  _chunkText(text, size) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks.length ? chunks : [''];
  }

  // --------------------------------------------------------------------------------------------------
  // HTTP
  // --------------------------------------------------------------------------------------------------

  _request(method, path, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const options = {
        hostname: 'api.notion.com',
        path,
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': this.version,
          'Content-Length': Buffer.byteLength(data),
        },
      };

      const req = https.request(options, (res) => {
        let raw = '';
        res.on('data', chunk => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode >= 400) {
              reject(new Error(`Notion API error ${res.statusCode}: ${parsed.message || raw}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error(`Failed to parse Notion response: ${raw}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

module.exports = NotionPusher;
