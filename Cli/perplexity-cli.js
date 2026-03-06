#!/usr/bin/env node

/**
 * ========================================================================================================
 * PERPLEXITY CLI - Command Line Interface for Perplexity API
 * ========================================================================================================
 * 
 * A simple, direct command-line tool to interact with Perplexity API - no browser, no wrapper.
 * Works like `gemini` or `claude` commands.
 * 
 * FEATURES:
 * - Interactive chat mode
 * - One-shot queries
 * - Streaming responses
 * - Conversation history
 * - Multiple model support
 * - Search-enabled responses
 * 
 * USAGE:
 *   perplexity "what is quantum computing?"          # One-shot query
 *   perplexity --chat                                 # Interactive mode
 *   perplexity --model=sonar-pro "advanced query"    # Specify model
 *   perplexity --help                                 # Show help
 * 
 * SETUP:
 *   Set PERPLEXITY_API_KEY environment variable or create .env file
 * 
 * ========================================================================================================
 */

const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ========================================================================================================
// CONFIGURATION
// ========================================================================================================

const CONFIG = {
  API_URL: 'api.perplexity.ai',
  API_PATH: '/chat/completions',
  DEFAULT_MODEL: 'sonar',
  AVAILABLE_MODELS: [
    'sonar',          // Fast, real-time search
    'sonar-pro',      // Advanced reasoning + search
    'sonar-reasoning' // Deep analysis + search
  ],
  HISTORY_FILE: path.join(process.env.USERPROFILE || process.env.HOME, '.perplexity-cli-history.json'),
  MAX_HISTORY: 50
};

// ========================================================================================================
// API KEY MANAGEMENT
// ========================================================================================================

function getApiKey() {
  // Try environment variable first
  if (process.env.PERPLEXITY_API_KEY) {
    return process.env.PERPLEXITY_API_KEY;
  }
  
  // Try .env file
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/PERPLEXITY_API_KEY=(.+)/);
    if (match) {
      return match[1].trim();
    }
  }
  
  console.error('❌ ERROR: Perplexity API key not found!');
  console.error('\nPlease set your API key using one of these methods:');
  console.error('  1. Environment variable: set PERPLEXITY_API_KEY=your-key-here');
  console.error('  2. Create .env file with: PERPLEXITY_API_KEY=your-key-here');
  console.error('\nGet your API key at: https://www.perplexity.ai/settings/api\n');
  process.exit(1);
}

// ========================================================================================================
// API CLIENT
// ========================================================================================================

class PerplexityClient {
  constructor(apiKey, model = CONFIG.DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
    this.conversationHistory = [];
  }

  /**
   * Send a message to Perplexity API
   */
  async sendMessage(message, stream = true) {
    const payload = {
      model: this.model,
      messages: [
        ...this.conversationHistory,
        { role: 'user', content: message }
      ],
      stream: stream
    };

    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      
      const options = {
        hostname: CONFIG.API_URL,
        path: CONFIG.API_PATH,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          let error = '';
          res.on('data', chunk => error += chunk);
          res.on('end', () => {
            reject(new Error(`API Error ${res.statusCode}: ${error}`));
          });
          return;
        }

        if (stream) {
          this.handleStreamResponse(res, message, resolve, reject);
        } else {
          this.handleJsonResponse(res, message, resolve, reject);
        }
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Handle streaming response
   */
  handleStreamResponse(res, userMessage, resolve, reject) {
    let fullResponse = '';
    let buffer = '';

    res.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              process.stdout.write(content);
              fullResponse += content;
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    });

    res.on('end', () => {
      console.log('\n');
      
      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: fullResponse }
      );
      
      resolve(fullResponse);
    });

    res.on('error', reject);
  }

  /**
   * Handle JSON response (non-streaming)
   */
  handleJsonResponse(res, userMessage, resolve, reject) {
    let data = '';
    
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.message?.content || '';
        
        console.log(content);
        
        // Update conversation history
        this.conversationHistory.push(
          { role: 'user', content: userMessage },
          { role: 'assistant', content: content }
        );
        
        resolve(content);
      } catch (e) {
        reject(e);
      }
    });

    res.on('error', reject);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }
}

// ========================================================================================================
// INTERACTIVE CHAT MODE
// ========================================================================================================

async function runInteractiveMode(client) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           PERPLEXITY CLI - Interactive Mode                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\nModel: ${client.model}`);
  console.log('Commands: /help, /clear, /history, /model, /exit\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '💭 You: '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (!input) {
      rl.prompt();
      return;
    }

    // Handle commands
    if (input.startsWith('/')) {
      await handleCommand(input, client, rl);
      rl.prompt();
      return;
    }

    // Send message
    try {
      console.log('\n🤖 Perplexity: ');
      await client.sendMessage(input, true);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n👋 Goodbye!\n');
    process.exit(0);
  });
}

/**
 * Handle interactive commands
 */
async function handleCommand(command, client, rl) {
  const cmd = command.toLowerCase().split(' ')[0];
  
  switch (cmd) {
    case '/help':
      console.log('\nAvailable Commands:');
      console.log('  /help      - Show this help');
      console.log('  /clear     - Clear conversation history');
      console.log('  /history   - Show conversation history');
      console.log('  /model     - Change model');
      console.log('  /exit      - Exit interactive mode\n');
      break;
      
    case '/clear':
      client.clearHistory();
      console.log('✅ Conversation history cleared\n');
      break;
      
    case '/history':
      const history = client.getHistory();
      if (history.length === 0) {
        console.log('No conversation history\n');
      } else {
        console.log('\n📜 Conversation History:\n');
        history.forEach((msg, i) => {
          const icon = msg.role === 'user' ? '💭' : '🤖';
          console.log(`${icon} ${msg.role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
        });
        console.log('');
      }
      break;
      
    case '/model':
      console.log('\nAvailable Models:');
      CONFIG.AVAILABLE_MODELS.forEach((m, i) => {
        const current = m === client.model ? ' (current)' : '';
        console.log(`  ${i + 1}. ${m}${current}`);
      });
      console.log('\nEnter model name to switch, or press Enter to cancel');
      
      rl.question('Model: ', (answer) => {
        const newModel = answer.trim();
        if (newModel && CONFIG.AVAILABLE_MODELS.includes(newModel)) {
          client.model = newModel;
          console.log(`✅ Switched to model: ${newModel}\n`);
        } else if (newModel) {
          console.log('❌ Invalid model\n');
        }
        rl.prompt();
      });
      return; // Don't prompt again, rl.question will handle it
      
    case '/exit':
      rl.close();
      break;
      
    default:
      console.log(`Unknown command: ${cmd}. Type /help for available commands.\n`);
  }
}

// ========================================================================================================
// ONE-SHOT QUERY MODE
// ========================================================================================================

async function runOneShotQuery(client, query) {
  try {
    await client.sendMessage(query, true);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// ========================================================================================================
// COMMAND LINE ARGUMENT PARSER
// ========================================================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  
  const options = {
    chat: false,
    model: CONFIG.DEFAULT_MODEL,
    query: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--chat' || arg === '-c') {
      options.chat = true;
    } else if (arg.startsWith('--model=')) {
      options.model = arg.split('=')[1];
    } else if (arg === '--model' || arg === '-m') {
      options.model = args[++i];
    } else if (!options.query) {
      // First non-flag argument is the query
      options.query = arg;
    }
  }

  return options;
}

// ========================================================================================================
// HELP DISPLAY
// ========================================================================================================

function displayHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║              PERPLEXITY CLI - Command Line Interface               ║
╚════════════════════════════════════════════════════════════════════╝

Direct API access to Perplexity AI from your command line.

USAGE:
  perplexity "your question here"           One-shot query
  perplexity --chat                          Interactive chat mode
  perplexity --model=sonar-pro "question"   Specify model

OPTIONS:
  --chat, -c              Start interactive chat mode
  --model=MODEL, -m       Use specific model (default: sonar)
  --help, -h              Show this help message

AVAILABLE MODELS:
  sonar                   Fast, real-time search (default)
  sonar-pro               Advanced reasoning + search
  sonar-reasoning         Deep analysis + search

SETUP:
  1. Get API key from: https://www.perplexity.ai/settings/api
  2. Set environment variable:
     set PERPLEXITY_API_KEY=your-key-here
  
  Or create .env file:
     PERPLEXITY_API_KEY=your-key-here

EXAMPLES:
  # One-shot query
  perplexity "what is quantum computing?"
  
  # Interactive mode
  perplexity --chat
  
  # Use advanced model
  perplexity --model=sonar-pro "explain relativity in detail"
  
  # Pipe output
  perplexity "list top 5 programming languages" > output.txt

INTERACTIVE COMMANDS:
  /help       Show available commands
  /clear      Clear conversation history
  /history    Show conversation history
  /model      Change model
  /exit       Exit interactive mode

╚════════════════════════════════════════════════════════════════════╝
`);
}

// ========================================================================================================
// MAIN ENTRY POINT
// ========================================================================================================

async function main() {
  const options = parseArgs();

  if (options.help) {
    displayHelp();
    process.exit(0);
  }

  const apiKey = getApiKey();
  const client = new PerplexityClient(apiKey, options.model);

  if (options.chat) {
    await runInteractiveMode(client);
  } else if (options.query) {
    await runOneShotQuery(client, options.query);
  } else {
    console.error('❌ No query provided. Use --chat for interactive mode or provide a query.\n');
    console.error('Try: perplexity --help\n');
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  main().catch(error => {
    console.error(`\n❌ Fatal error: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = { PerplexityClient };
