# 🎯 PERPLEXITY CLI - THIS IS WHAT YOU WANTED!

## ✅ What You Got

A **TRUE command-line tool** for Perplexity - just like `gemini` or `claude` commands.

**NOT the previous browser-based tool** - this uses the Perplexity API directly.

---

## 🚀 Setup (2 Minutes)

### Step 1: Get API Key (30 seconds)
1. Go to: https://www.perplexity.ai/settings/api
2. Click "Generate API Key"
3. Copy the key (starts with `pplx-`)

### Step 2: Set API Key (30 seconds)

**Option A - Environment Variable:**
```bash
set PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxx
```

**Option B - Create .env file:**
```bash
cd C:\Users\420du\.cli-proxy-api
echo PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxx > .env
```

### Step 3: Run It! (10 seconds)
```bash
cd C:\Users\420du\.cli-proxy-api
perplexity.bat
```

Or directly:
```bash
node perplexity-cli.js "hello world"
```

---

## 💡 Quick Examples

### Example 1: Ask a Question
```bash
node perplexity-cli.js "what is the capital of France?"
```

### Example 2: Interactive Chat
```bash
node perplexity-cli.js --chat

💭 You: tell me about AI
🤖 Perplexity: [streams response]

💭 You: give examples
🤖 Perplexity: [streams response]

💭 You: /exit
```

### Example 3: Use Menu
```bash
perplexity.bat

# Choose:
# 1 = Interactive chat
# 2 = Quick query
# 4 = Test connection
```

---

## 🎯 Key Differences

### This Tool (Perplexity CLI)
- ✅ Direct API access
- ✅ Fast (no browser)
- ✅ Lightweight
- ✅ Works like `gemini` command
- ✅ Simple setup

### Previous Tool (Headless-Perpman)
- ❌ Browser automation
- ❌ Slow
- ❌ Complex setup
- ❌ Not a CLI tool
- ❌ For web scraping

---

## 📋 Usage Cheat Sheet

```bash
# One-shot query
node perplexity-cli.js "your question"

# Interactive mode
node perplexity-cli.js --chat

# Specify model
node perplexity-cli.js --model=sonar-pro "question"

# Show help
node perplexity-cli.js --help

# Use launcher menu
perplexity.bat
```

---

## 🔧 Troubleshooting

### "API key not found"
```bash
# Set the key:
set PERPLEXITY_API_KEY=pplx-xxxxxxxx

# Or create .env file
```

### "Node.js not found"
- Install from: https://nodejs.org/

### "Invalid API key"
- Get new key from: https://www.perplexity.ai/settings/api

---

## 🎉 You're Ready!

**This is your true CLI tool for Perplexity.**

Just like how you use:
- `gemini "question"` 
- `claude "question"`

Now you have:
- `node perplexity-cli.js "question"`

Or make it simpler:
```bash
# Create alias
doskey perplexity=node "C:\Users\420du\.cli-proxy-api\perplexity-cli.js" $*

# Then use:
perplexity "hello world"
```

---

**Location:** `C:\Users\420du\.cli-proxy-api\`  
**Files:**
- `perplexity-cli.js` - Main CLI tool
- `perplexity.bat` - Launcher menu
- `README.md` - Full documentation
- `.env` - Your API key (create this)

**Status:** ✅ READY TO USE
