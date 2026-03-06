# Perplexity CLI - Command Line Interface

A simple, direct command-line tool to interact with Perplexity API. Works just like `gemini` or `claude` commands - **no browser, no headless automation, pure API**.

---

## 🎯 What This Is

This is a **TRUE CLI tool** that:
- ✅ Uses Perplexity's official API directly
- ✅ Works from command line like any CLI tool
- ✅ No browser required
- ✅ No Puppeteer/Selenium
- ✅ Fast and lightweight
- ✅ Supports streaming responses
- ✅ Interactive chat mode

**Unlike the previous tool** (Headless-Perpman), this is what you actually wanted - a simple command-line interface like Gemini CLI.

---

## 🚀 Quick Start

### 1. Get API Key

Visit: https://www.perplexity.ai/settings/api

### 2. Set API Key

```bash
# Windows
set PERPLEXITY_API_KEY=your-key-here

# Or create .env file
echo PERPLEXITY_API_KEY=your-key-here > .env
```

### 3. Run

```bash
# Use the launcher (easiest)
perplexity.bat

# Or run directly
node perplexity-cli.js "what is quantum computing?"
```

---

## 📋 Usage

### Interactive Mode (Recommended)

```bash
node perplexity-cli.js --chat
```

Then chat naturally:
```
💭 You: what is machine learning?
🤖 Perplexity: Machine learning is a branch of AI...

💭 You: give me examples
🤖 Perplexity: Common examples include...
```

Commands in chat mode:
- `/help` - Show commands
- `/clear` - Clear history
- `/history` - Show conversation
- `/model` - Change model
- `/exit` - Exit

### One-Shot Queries

```bash
# Simple query
node perplexity-cli.js "what's the weather today?"

# Specify model
node perplexity-cli.js --model=sonar-pro "explain quantum computing"

# Pipe output
node perplexity-cli.js "list top 5 languages" > output.txt
```

### Using the Launcher

```bash
perplexity.bat

# Menu options:
# 1. Interactive chat
# 2. Quick query
# 3. Change model
# 4. Test connection
# 5. View help
# 6. Setup API key
```

---

## 🎮 Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `sonar` | Fast, real-time search | Quick questions |
| `sonar-pro` | Advanced reasoning + search | Complex queries |
| `sonar-reasoning` | Deep analysis + search | Research |

---

## 💡 Examples

### Example 1: Quick Information
```bash
node perplexity-cli.js "who won the last Super Bowl?"
```

### Example 2: Code Help
```bash
node perplexity-cli.js "write a Python function to sort a list"
```

### Example 3: Research
```bash
node perplexity-cli.js --model=sonar-pro "compare React vs Vue performance"
```

### Example 4: Interactive Conversation
```bash
node perplexity-cli.js --chat

💭 You: I'm learning Python
🤖 Perplexity: Great choice! Python is...

💭 You: what should I learn first?
🤖 Perplexity: Start with these concepts...
```

---

## 🔧 Setup Options

### Method 1: Environment Variable
```bash
set PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxx
```

### Method 2: .env File
Create `.env` in the same folder:
```
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxx
```

### Method 3: Use Launcher
Run `perplexity.bat` and choose option 6 (Setup API Key)

---

## 📦 Installation

### Option A: Standalone (Recommended)
```bash
# Already ready to use! Just:
cd C:\Users\420du\.cli-proxy-api
perplexity.bat
```

### Option B: Global Command
```bash
# Add to PATH or create alias
doskey perplexity=node "C:\Users\420du\.cli-proxy-api\perplexity-cli.js" $*
```

---

## 🆚 Comparison

### vs Headless-Perpman (Browser-Based)
| Feature | Perplexity CLI | Headless-Perpman |
|---------|----------------|------------------|
| Method | Direct API | Browser automation |
| Speed | ⚡ Fast | 🐌 Slow |
| Setup | ✅ Simple | ❌ Complex |
| Requires browser | ❌ No | ✅ Yes |
| API key needed | ✅ Yes | ❌ No |
| Reliability | ✅ High | ⚠️ Medium |

### vs Gemini CLI / Claude Code
| Feature | Perplexity CLI | Gemini CLI | Claude Code |
|---------|----------------|------------|-------------|
| Command line | ✅ | ✅ | ✅ |
| Interactive mode | ✅ | ✅ | ✅ |
| Streaming | ✅ | ✅ | ✅ |
| Search capability | ✅ | ❌ | ❌ |
| Real-time info | ✅ | ❌ | ❌ |

---

## 🎯 Use Cases

### 1. Quick Answers
```bash
node perplexity-cli.js "what's 15% of 250?"
```

### 2. Code Generation
```bash
node perplexity-cli.js "write a bash script to backup files"
```

### 3. Research
```bash
node perplexity-cli.js --model=sonar-pro "latest AI developments 2025"
```

### 4. Learning
```bash
node perplexity-cli.js --chat
# Then ask progressive questions
```

### 5. Automation
```bash
# In scripts
FOR /F "delims=" %%i IN ('node perplexity-cli.js "generate random password"') DO SET PASSWORD=%%i
```

---

## 🔧 Troubleshooting

### Error: API key not found
```bash
# Solution: Set API key
set PERPLEXITY_API_KEY=your-key-here

# Or create .env file
echo PERPLEXITY_API_KEY=your-key-here > .env
```

### Error: Cannot find module
```bash
# Node.js not installed
# Download from: https://nodejs.org/
```

### Error: API Error 401
```bash
# Invalid API key
# Get new key from: https://www.perplexity.ai/settings/api
```

### Error: API Error 429
```bash
# Rate limit exceeded
# Wait a moment and try again
```

---

## 🎓 Advanced Usage

### Environment Variables
```bash
# Set model default
set PERPLEXITY_DEFAULT_MODEL=sonar-pro

# Set custom timeout
set PERPLEXITY_TIMEOUT=30000
```

### Scripting
```batch
@echo off
REM Ask AI and save response
node perplexity-cli.js "explain Docker" > docker-explanation.txt

REM Use in pipeline
node perplexity-cli.js "list 5 ideas" | findstr "1."
```

### Integration
```javascript
// Use in Node.js scripts
const { PerplexityClient } = require('./perplexity-cli.js');

const client = new PerplexityClient('your-api-key');
const response = await client.sendMessage('Hello!');
console.log(response);
```

---

## 📁 Files

```
.cli-proxy-api/
├── perplexity-cli.js    # Main CLI tool
├── perplexity.bat       # Launcher menu
├── .env                 # API key (create this)
└── README.md            # This file
```

---

## 🌟 Key Takeaways

**This is what you wanted:**
- ✅ Simple command-line tool
- ✅ Works like `gemini` or `claude` commands
- ✅ No browser automation
- ✅ Direct API access
- ✅ Fast and reliable

**Not the previous tool:**
- ❌ Headless-Perpman is for web scraping
- ❌ This is a pure API CLI tool

---

## 🚀 Get Started Now

```bash
# 1. Get API key
# Visit: https://www.perplexity.ai/settings/api

# 2. Set key
set PERPLEXITY_API_KEY=your-key-here

# 3. Run!
perplexity.bat

# Or
node perplexity-cli.js "hello world"
```

---

**Last Updated:** January 2, 2025  
**Version:** 1.0.0  
**Status:** ✅ READY TO USE
