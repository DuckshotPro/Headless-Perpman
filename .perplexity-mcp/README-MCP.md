# MCP-Integrated Perplexity Client

A comprehensive headless client for Perplexity AI with MCP (Model Context Protocol) integration. This tool enables automated interaction with Perplexity AI, conversation exports, and advanced file operations through Windows-MCP.

---

## 🎯 Overview

This project provides a **production-ready** headless client for Perplexity AI that works similar to ClaudeCode or GeminiCLI. It offers three operational modes:

1. **Interactive Mode** - Real-time browser interaction
2. **Export Mode** - Batch export conversations to Markdown/JSON
3. **API Server Mode** - RESTful API for programmatic access

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- Chrome or Edge browser installed
- Perplexity AI account

### Installation

```bash
# Navigate to the project directory
cd C:\Users\420du\Windows-MCP\Headless-Perpman

# Install dependencies (if not already done)
npm install

# Build TypeScript source
npm run build
```

### Basic Usage

```bash
# Interactive mode with email login
node mcp-perplexity-client.js --mode=interactive --email=your@example.com

# Export conversations
node mcp-perplexity-client.js --mode=export --email=your@example.com --output=./exports

# Start API server
node mcp-perplexity-client.js --mode=server --port=3000

# Get help
node mcp-perplexity-client.js --help
```

---

## 📋 Detailed Features

### 1. Interactive Mode

Launch Perplexity in a browser window for manual interaction. This mode is ideal for:
- Real-time queries
- Testing authentication
- Manual conversation management

```bash
node mcp-perplexity-client.js \
  --mode=interactive \
  --email=your@example.com
```

**Features:**
- Semi-automated login process
- Browser window control
- Session persistence

### 2. Export Mode

Automatically export all your Perplexity conversations to local files. Perfect for:
- Creating backups
- Archiving research
- Offline access to conversations

```bash
node mcp-perplexity-client.js \
  --mode=export \
  --email=your@example.com \
  --output=./my-exports \
  --done-file=processed.json
```

**Output Format:**
- `{conversation-id}.json` - Raw conversation data
- `{conversation-id}.md` - Formatted Markdown

**Features:**
- Tracks processed conversations (no duplicates)
- Rate-limited to avoid detection
- Graceful error handling
- Resume capability

### 3. API Server Mode

Run a REST API server for programmatic access. Ideal for:
- Integration with other tools
- Automated workflows
- Building custom interfaces

```bash
node mcp-perplexity-client.js --mode=server --port=3000
```

**Endpoints:**

#### `GET /export`

Export all conversations for a user.

**Query Parameters:**
- `email` (required) - User's Perplexity email
- `userDataDir` (optional) - Chrome user data directory path

**Example:**
```bash
curl "http://localhost:3000/export?email=your@example.com"
```

**Response:**
```json
[
  {
    "id": "conversation-123",
    "markdown": "# Conversation Title\n\n...",
    "json": { ... }
  }
]
```

---

## 🔐 Authentication

### Method 1: Email + OTP (Manual)

The default method requires manual intervention:

1. Tool opens browser and navigates to Perplexity
2. You enter your email
3. Perplexity sends OTP to your email
4. You enter OTP in the browser
5. Tool proceeds with automation

**Usage:**
```bash
node mcp-perplexity-client.js --mode=export --email=your@example.com
```

**Pros:**
- Works for any account
- No additional setup

**Cons:**
- Requires manual code entry
- Not suitable for full automation

### Method 2: Browser Session Reuse (Recommended)

Use an existing Chrome session to bypass login entirely:

**Step 1: Log in to Perplexity**
- Open Chrome normally
- Navigate to perplexity.ai
- Log in with your credentials

**Step 2: Find Chrome User Data Directory**

Windows Chrome:
```
C:\Users\<YourUser>\AppData\Local\Google\Chrome\User Data
```

Windows Edge:
```
C:\Users\<YourUser>\AppData\Local\Microsoft\Edge\User Data
```

**Step 3: Use with Tool**
```bash
node mcp-perplexity-client.js \
  --mode=export \
  --email=your@example.com \
  --user-data-dir="C:\Users\420du\AppData\Local\Google\Chrome\User Data"
```

**Pros:**
- Fully automated
- No CAPTCHA or OTP
- Fast startup

**Cons:**
- Requires existing login
- Chrome must be closed before running

---

## ⚙️ Configuration Options

### Command Line Arguments

| Argument | Description | Default | Required |
|----------|-------------|---------|----------|
| `--mode` | Operation mode (interactive/export/server) | interactive | No |
| `--email` | Perplexity account email | - | Yes* |
| `--port` | Server port (server mode) | 3000 | No |
| `--output` | Export output directory | ./exports | No |
| `--done-file` | Processed URLs tracker file | done.json | No |
| `--user-data-dir` | Chrome user data directory | - | No |
| `--headless` | Run browser in headless mode | false | No |
| `--help` | Show help message | - | No |

*Required for interactive and export modes only

### Environment Variables

You can also use environment variables:

```bash
# Windows
set PERPLEXITY_EMAIL=your@example.com
set PERPLEXITY_OUTPUT_DIR=C:\exports

# Unix/Mac
export PERPLEXITY_EMAIL=your@example.com
export PERPLEXITY_OUTPUT_DIR=/path/to/exports
```

---

## 🛠️ Advanced Usage

### Headless Mode

Run without visible browser window (requires existing session):

```bash
node mcp-perplexity-client.js \
  --mode=export \
  --email=your@example.com \
  --user-data-dir="C:\Users\420du\AppData\Local\Google\Chrome\User Data" \
  --headless
```

### Custom Output Directory

Organize exports by date or project:

```bash
node mcp-perplexity-client.js \
  --mode=export \
  --email=your@example.com \
  --output="./exports/2025-01-02"
```

### Resume Interrupted Exports

The `done.json` file tracks processed conversations:

```bash
# First run - processes all conversations
node mcp-perplexity-client.js --mode=export --email=you@example.com

# Second run - only processes new conversations
node mcp-perplexity-client.js --mode=export --email=you@example.com
```

---

## 🔧 Troubleshooting

### Issue: "Email is required"

**Solution:** Provide email via `--email` argument:
```bash
node mcp-perplexity-client.js --mode=export --email=your@example.com
```

### Issue: Login fails or CAPTCHA appears

**Solution:** Use browser session reuse method (Method 2 above)

### Issue: "Chrome is already running"

**Solution:** Close all Chrome instances before using `--user-data-dir`

### Issue: Module not found errors

**Solution:** Rebuild the project:
```bash
npm run build
```

### Issue: Rate limiting or blocked requests

**Solution:** Increase delay between requests in `exportLibrary.ts`:
```typescript
await sleep(5000); // Increase from 2000 to 5000ms
```

### Issue: Headless mode doesn't work

**Solution:** Headless mode requires existing session. Use `--user-data-dir`:
```bash
node mcp-perplexity-client.js \
  --mode=export \
  --email=your@example.com \
  --user-data-dir="PATH_TO_CHROME_DATA" \
  --headless
```

---

## 🧩 MCP Integration

### What is MCP?

Model Context Protocol (MCP) enables AI assistants to interact with external tools and systems. Windows-MCP specifically provides:

- File system operations
- Process management  
- System monitoring
- Windows-specific integrations

### Using with Windows-MCP

1. **File Operations via MCP:**
```javascript
// Read exported conversation
const conversation = await mcp.readFile('./exports/conversation-123.md');

// Process with AI
const summary = await processWithAI(conversation);

// Save summary
await mcp.writeFile('./summaries/conversation-123.md', summary);
```

2. **Process Management:**
```javascript
// Start export in background
const pid = await mcp.startProcess('node mcp-perplexity-client.js --mode=export ...');

// Monitor progress
const output = await mcp.readProcessOutput(pid);
```

3. **Automated Workflows:**
```javascript
// Daily backup script
async function dailyBackup() {
  const today = new Date().toISOString().split('T')[0];
  const outputDir = `./exports/${today}`;
  
  await mcp.createDirectory(outputDir);
  await mcp.startProcess(`node mcp-perplexity-client.js --mode=export --output=${outputDir}`);
}
```

---

## 📁 Project Structure

```
Headless-Perpman/
├── src/                      # TypeScript source files
│   ├── api.ts               # API export functionality
│   ├── cli.ts               # Command-line interface
│   ├── server.ts            # REST API server
│   ├── exportLibrary.ts     # Core export logic
│   ├── login.ts             # Authentication handler
│   ├── listConversations.ts # Conversation discovery
│   ├── ConversationSaver.ts # Conversation persistence
│   └── utils.ts             # Utility functions
├── dist/                     # Compiled JavaScript
├── node_modules/            # Dependencies
├── mcp-perplexity-client.js # Main CLI wrapper (NEW)
├── package.json             # Project metadata
├── tsconfig.json            # TypeScript config
└── README-MCP.md            # This file (NEW)
```

---

## 🎯 Use Cases

### 1. Research Backup
Export all research conversations monthly:
```bash
node mcp-perplexity-client.js \
  --mode=export \
  --email=researcher@university.edu \
  --output="./research-backup/$(date +%Y-%m)"
```

### 2. Knowledge Base Building
Build a searchable knowledge base from conversations:
```bash
# Export all conversations
node mcp-perplexity-client.js --mode=export --email=you@example.com

# Index with grep/ag/ripgrep
rg "machine learning" ./exports/*.md
```

### 3. Integration with AI Assistants
Feed conversations to Claude or GPT for analysis:
```bash
# Export and process
node mcp-perplexity-client.js --mode=export --email=you@example.com
cat ./exports/*.md | claude summarize
```

### 4. Automated Documentation
Generate project documentation from research:
```python
import os
import anthropic

# Read all exports
exports = []
for file in os.listdir('./exports'):
    if file.endswith('.md'):
        with open(f'./exports/{file}') as f:
            exports.append(f.read())

# Generate documentation
client = anthropic.Anthropic()
docs = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    messages=[{
        "role": "user",
        "content": f"Create documentation from these research conversations: {exports}"
    }]
)
```

---

## 🔒 Security & Privacy

### Data Storage
- All exports are stored **locally only**
- No data is sent to third parties
- Original Perplexity data remains in your account

### Authentication
- Email/password never stored in code
- OTP codes entered directly in browser
- Session cookies stored in Chrome user data (encrypted by OS)

### Best Practices
1. Keep `done.json` private (contains conversation URLs)
2. Don't commit exports to public repositories
3. Use `.gitignore` for export directories:
```gitignore
exports/
done.json
*.md
```

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

1. **Enhanced MCP Integration**
   - More MCP server bindings
   - Advanced file operations
   - System monitoring

2. **Authentication**
   - Support for more SSO providers
   - API key authentication (if Perplexity adds it)

3. **Export Formats**
   - HTML export
   - PDF generation
   - Structured JSON schemas

4. **Error Handling**
   - Retry logic
   - Better error messages
   - Graceful degradation

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Original Perplexport by Leonid Shevtsov
- Puppeteer team for excellent automation tools
- Windows-MCP team for MCP integration framework
- Perplexity AI for their platform

---

## 📞 Support

**Issues:** Open an issue on GitHub
**Questions:** Check existing issues or start a discussion
**Security:** Report vulnerabilities privately via GitHub Security

---

## 🗺️ Roadmap

- [ ] Real-time conversation streaming
- [ ] Multi-account support
- [ ] Conversation search and filtering
- [ ] Export scheduling (cron/Task Scheduler)
- [ ] Web UI for management
- [ ] Docker containerization
- [ ] Cloud deployment options

---

**Last Updated:** January 2, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
