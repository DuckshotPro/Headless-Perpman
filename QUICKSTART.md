# 🚀 QUICKSTART GUIDE - MCP Perplexity Client

**Get started in 5 minutes!**

---

## ✅ Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Node.js 16+** installed ([Download here](https://nodejs.org/))
- [ ] **Chrome or Edge** browser installed
- [ ] **Perplexity AI account** (free or Pro)
- [ ] **Email access** (for OTP codes)

---

## 📦 Installation

### Step 1: Navigate to the project

```bash
cd C:\Users\420du\Windows-MCP\Headless-Perpman
```

### Step 2: Install dependencies (if needed)

```bash
npm install
```

### Step 3: Build the project

```bash
npm run build
```

That's it! You're ready to go.

---

## 🎯 Choose Your Path

Pick the method that best fits your needs:

### 🔰 PATH 1: Beginner - Interactive Mode
**Best for:** First-time users, testing, manual control

```bash
node mcp-perplexity-client.js --mode=interactive --email=YOUR_EMAIL@example.com
```

**What happens:**
1. Browser opens automatically
2. You enter OTP code from email
3. You can use Perplexity normally
4. Conversations are tracked automatically

**Use when:** You want to try it out or work interactively

---

### 💾 PATH 2: Recommended - Export with Chrome Session
**Best for:** Automation, scheduled backups, no manual intervention

#### Setup (One-time):

1. **Open Chrome and log in to Perplexity**
   - Go to https://www.perplexity.ai/
   - Log in normally and stay logged in

2. **Find your Chrome profile path:**
   ```
   Windows: C:\Users\YOUR_USERNAME\AppData\Local\Google\Chrome\User Data
   ```

3. **Close ALL Chrome windows**

#### Run Export:

```bash
node mcp-perplexity-client.js ^
  --mode=export ^
  --email=YOUR_EMAIL@example.com ^
  --user-data-dir="C:\Users\YOUR_USERNAME\AppData\Local\Google\Chrome\User Data"
```

**What happens:**
1. Tool uses your existing Chrome session
2. No OTP needed - already logged in!
3. Exports all conversations to `./exports` folder
4. Creates both `.json` and `.md` files

**Use when:** You want automation without manual login

---

### 🌐 PATH 3: Advanced - API Server
**Best for:** Integration with other tools, programmatic access

```bash
node mcp-perplexity-client.js --mode=server --port=3000
```

Then make API calls:
```bash
curl "http://localhost:3000/export?email=YOUR_EMAIL@example.com"
```

**Use when:** You're building integrations or tools on top of this

---

## 🎬 Real-World Examples

### Example 1: Daily Backup
```bash
# Create a backup folder with today's date
node mcp-perplexity-client.js ^
  --mode=export ^
  --email=researcher@university.edu ^
  --output=./backups/2025-01-02 ^
  --user-data-dir="C:\Users\researcher\AppData\Local\Google\Chrome\User Data"
```

### Example 2: Export Specific Conversations
```bash
# Use done.json to track what's been exported
# First run - exports all
node mcp-perplexity-client.js --mode=export --email=you@example.com

# Second run - only exports NEW conversations
node mcp-perplexity-client.js --mode=export --email=you@example.com
```

### Example 3: Headless Automation
```bash
# Perfect for scheduled tasks (Task Scheduler, cron)
node mcp-perplexity-client.js ^
  --mode=export ^
  --email=you@example.com ^
  --user-data-dir="C:\Users\you\AppData\Local\Google\Chrome\User Data" ^
  --headless ^
  --output=./auto-exports
```

---

## 🎮 Using the Launcher Scripts

### Option A: Batch File (Simple)

1. **Edit configuration in `launch.bat`:**
   ```batch
   SET PERPLEXITY_EMAIL=your@example.com
   SET CHROME_USER_DATA=C:\Users\YourName\AppData\Local\Google\Chrome\User Data
   ```

2. **Double-click `launch.bat`**

3. **Choose from menu:**
   - `1` - Interactive mode
   - `2` - Export with email
   - `3` - Export with Chrome session ⭐ **RECOMMENDED**
   - `4` - Start API server
   - And more...

### Option B: PowerShell (Advanced)

```powershell
.\launch.ps1
```

**Features:**
- Interactive menu
- Built-in testing
- Configuration editor
- View recent exports
- Error checking

---

## 📁 What Gets Created

After exporting, you'll see:

```
exports/
├── conversation-abc123.md     # Human-readable markdown
├── conversation-abc123.json   # Raw data
├── conversation-def456.md
├── conversation-def456.json
└── ...

done.json                       # Tracks processed conversations
```

### Example Markdown Output:

```markdown
# Conversation Title

**User:** How does quantum computing work?

**Perplexity:** Quantum computing harnesses quantum mechanical phenomena...

[Sources]
1. Nature Physics - Quantum Computing Basics
2. MIT Technology Review - Future of Computing
```

---

## 🔧 Troubleshooting Quick Fixes

### "Email is required"
```bash
# ❌ Wrong
node mcp-perplexity-client.js --mode=export

# ✅ Correct
node mcp-perplexity-client.js --mode=export --email=you@example.com
```

### "Chrome is already running"
```bash
# Close ALL Chrome windows, then run:
node mcp-perplexity-client.js --mode=export --email=you@example.com --user-data-dir="..."
```

### Login fails / CAPTCHA appears
```bash
# Solution: Use Chrome session method instead
node mcp-perplexity-client.js ^
  --mode=export ^
  --email=you@example.com ^
  --user-data-dir="C:\Users\...\Chrome\User Data"
```

### Module not found
```bash
# Rebuild the project
npm run build
```

---

## 🎯 Next Steps

Once you're comfortable with the basics:

1. **Read the full README-MCP.md** for advanced features
2. **Set up automated backups** using Task Scheduler
3. **Integrate with MCP** for advanced file operations
4. **Build custom tools** using the API server mode

---

## 📚 Additional Resources

- **Full Documentation:** `README-MCP.md`
- **Help Command:** `node mcp-perplexity-client.js --help`
- **Test Everything:** Run launcher and choose option 9 (Quick Test)

---

## 💡 Pro Tips

1. **Use Chrome session method** for automation - no manual intervention needed
2. **Close Chrome** before using `--user-data-dir` to avoid conflicts
3. **Check `done.json`** to see what's been processed
4. **Organize exports by date** using `--output=./exports/2025-01-02`
5. **Run in headless mode** for scheduled tasks

---

## ❓ Still Stuck?

**Quick Diagnostics:**

```bash
# Test if Node.js works
node --version

# Test if project is built
dir dist\cli.js

# Test if CLI works
node mcp-perplexity-client.js --help
```

If these work, you're good to go!

---

**Last Updated:** January 2, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
