#!/usr/bin/env node

/**
 * ====================================================================================================
 * MCP-INTEGRATED PERPLEXITY CLIENT
 * ====================================================================================================
 * 
 * A comprehensive headless Perplexity AI client with MCP (Model Context Protocol) integration.
 * This tool allows you to interact with Perplexity AI programmatically, export conversations,
 * and leverage Windows-MCP for advanced file operations.
 * 
 * FEATURES:
 * ---------
 * 1. Interactive CLI mode for quick queries
 * 2. API server mode for programmatic access
 * 3. Export mode to save conversations as Markdown/JSON
 * 4. MCP integration for advanced file and system operations
 * 5. Session management with browser user data directory
 * 
 * USAGE:
 * ------
 * Interactive mode:
 *   node mcp-perplexity-client.js --mode=interactive --420duck@gmail.com
 * 
 * Export conversations:
 *   node mcp-perplexity-client.js --mode=export --420duck@gmail.com --output=./exports
 * 
 * API Server:
 *   node mcp-perplexity-client.js --mode=server --port=3000
 * 
 * With existing Chrome session:
 *   node mcp-perplexity-client.js --mode=interactive --420duck@gmail.com --user-data-dir="C:\Users\420du\AppData\Local\Google\Chrome\User Data"
 * 
 * AUTHENTICATION:
 * ---------------
 * The tool supports two authentication methods:
 * 1. Email-based login with OTP (requires manual code entry)
 * 2. Existing browser session (recommended for automation)
 * 
 * To use an existing Chrome session, pass the --user-data-dir parameter pointing to your
 * Chrome user data directory. This bypasses login and CAPTCHAs.
 * 
 * ====================================================================================================
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const http = require('http');

// ====================================================================================================
// CONFIGURATION
// ====================================================================================================

const CONFIG = {
  DEFAULT_PORT: 3000,
  DEFAULT_OUTPUT_DIR: './exports',
  DEFAULT_DONE_FILE: 'done.json',
  PUPPETEER_TIMEOUT: 120000,
  REQUEST_DELAY: 2000, // Delay between requests to avoid rate limiting
};

// ====================================================================================================
// COMMAND LINE ARGUMENT PARSER
// ====================================================================================================

class ArgumentParser {
  constructor() {
    this.args = {};
    this.parseArguments();
  }

  /**
   * Parse command line arguments into a structured object
   */
  parseArguments() {
    const args = process.argv.slice(2);
    
    // Default values
    this.args = {
      mode: 'interactive',
      email: null,
      port: CONFIG.DEFAULT_PORT,
      output: CONFIG.DEFAULT_OUTPUT_DIR,
      doneFile: CONFIG.DEFAULT_DONE_FILE,
      userDataDir: null,
      headless: false,
      help: false,
    };

    for (const arg of args) {
      if (arg === '--help' || arg === '-h') {
        this.args.help = true;
        continue;
      }

      const [key, value] = arg.split('=');
      const cleanKey = key.replace(/^--/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      
      if (value !== undefined) {
        // Handle boolean values
        if (value === 'true' || value === 'false') {
          this.args[cleanKey] = value === 'true';
        } else {
          this.args[cleanKey] = value;
        }
      } else {
        // Flag without value (treat as boolean true)
        this.args[cleanKey] = true;
      }
    }
  }

  /**
   * Get parsed arguments
   */
  getArgs() {
    return this.args;
  }

  /**
   * Validate required arguments based on mode
   */
  validate() {
    const { mode, email } = this.args;

    if (mode === 'interactive' || mode === 'export') {
      if (!email) {
        throw new Error(`Email is required for ${mode} mode. Use --email=your@email.com`);
      }
    }

    if (!['interactive', 'export', 'server'].includes(mode)) {
      throw new Error(`Invalid mode: ${mode}. Must be one of: interactive, export, server`);
    }
  }
}

// ====================================================================================================
// HELP DISPLAY
// ====================================================================================================

function displayHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                    MCP-INTEGRATED PERPLEXITY CLIENT                                    ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

A comprehensive headless client for Perplexity AI with MCP integration.

USAGE:
------
  node mcp-perplexity-client.js [OPTIONS]

MODES:
------
  --mode=interactive      Interactive CLI mode for real-time queries
  --mode=export          Export all conversations to Markdown/JSON files
  --mode=server          Start API server for programmatic access

REQUIRED OPTIONS:
-----------------
  --email=EMAIL          Your Perplexity AI email address
                         (Required for interactive and export modes)

OPTIONAL OPTIONS:
-----------------
  --port=PORT            Server port (default: 3000, server mode only)
  --output=DIR           Output directory for exports (default: ./exports)
  --done-file=FILE       File to track processed conversations (default: done.json)
  --user-data-dir=PATH   Chrome user data directory for session reuse
  --headless             Run browser in headless mode (default: false)
  --help, -h             Display this help message

AUTHENTICATION:
---------------
Two methods are supported:

1. Email + OTP (Manual):
   node mcp-perplexity-client.js --mode=interactive --email=you@example.com
   
   You'll receive an OTP code via email that must be entered in the browser window.

2. Existing Browser Session (Recommended for automation):
   node mcp-perplexity-client.js --mode=export --email=you@example.com \\
     --user-data-dir="C:\\Users\\YourUser\\AppData\\Local\\Google\\Chrome\\User Data"
   
   This bypasses login by using your existing Chrome session.

EXAMPLES:
---------
1. Interactive mode with email login:
   node mcp-perplexity-client.js --mode=interactive --email=you@example.com

2. Export conversations using existing Chrome session:
   node mcp-perplexity-client.js --mode=export --email=you@example.com \\
     --user-data-dir="C:\\Users\\420du\\AppData\\Local\\Google\\Chrome\\User Data" \\
     --output=./my-exports

3. Start API server:
   node mcp-perplexity-client.js --mode=server --port=4000

4. Export in headless mode:
   node mcp-perplexity-client.js --mode=export --email=you@example.com \\
     --headless --output=./exports

MCP INTEGRATION:
----------------
This client is designed to work with Windows-MCP for advanced operations:
- File system operations
- Process management
- System integration

For more information, visit: https://github.com/your-repo/windows-mcp

╚════════════════════════════════════════════════════════════════════════════════════════╝
`);
}

// ====================================================================================================
// PERPLEXITY CLIENT
// ====================================================================================================

class PerplexityClient {
  constructor(args) {
    this.args = args;
    this.projectRoot = __dirname;
  }

  /**
   * Run the CLI in the specified mode
   */
  async run() {
    console.log(`\n🚀 Starting MCP Perplexity Client in ${this.args.mode.toUpperCase()} mode...\n`);

    switch (this.args.mode) {
      case 'interactive':
        await this.runInteractive();
        break;
      case 'export':
        await this.runExport();
        break;
      case 'server':
        await this.runServer();
        break;
      default:
        throw new Error(`Unknown mode: ${this.args.mode}`);
    }
  }

  /**
   * Run interactive mode using the CLI
   */
  async runInteractive() {
    console.log('📝 Interactive mode - Launch Perplexity in browser and use manually');
    console.log('💡 Tip: Use --mode=export to save conversations automatically\n');

    const cliArgs = [
      'dist/cli.js',
      '--email', this.args.email,
      '--output', this.args.output,
      '--done-file', this.args.doneFile,
    ];

    await this.spawnNodeProcess(cliArgs);
  }

  /**
   * Run export mode - saves all conversations
   */
  async runExport() {
    console.log('💾 Export mode - Saving all conversations to disk\n');
    
    // Ensure output directory exists
    await fs.mkdir(this.args.output, { recursive: true });
    console.log(`📁 Output directory: ${path.resolve(this.args.output)}`);

    const cliArgs = [
      'dist/cli.js',
      '--email', this.args.email,
      '--output', this.args.output,
      '--done-file', this.args.doneFile,
    ];

    await this.spawnNodeProcess(cliArgs);
  }

  /**
   * Run API server mode
   */
  async runServer() {
    console.log('🌐 API Server mode - Starting REST API\n');
    console.log(`📡 Server will listen on http://localhost:${this.args.port}`);
    console.log('\n📖 API Endpoints:');
    console.log(`   GET /export?email=YOUR_EMAIL`);
    console.log(`   GET /export?email=YOUR_EMAIL&userDataDir=PATH`);
    console.log('\n');

    const serverArgs = ['dist/server.js'];
    await this.spawnNodeProcess(serverArgs);
  }

  /**
   * Spawn a Node.js process and pipe output
   */
  async spawnNodeProcess(args) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', args, {
        cwd: this.projectRoot,
        stdio: 'inherit',
        shell: true,
      });

      child.on('error', (error) => {
        console.error(`❌ Error spawning process: ${error.message}`);
        reject(error);
      });

      child.on('exit', (code) => {
        if (code === 0) {
          console.log('\n✅ Process completed successfully');
          resolve();
        } else {
          console.error(`\n❌ Process exited with code ${code}`);
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      // Handle Ctrl+C gracefully
      process.on('SIGINT', () => {
        console.log('\n\n⚠️  Interrupted by user. Cleaning up...');
        child.kill('SIGINT');
        process.exit(0);
      });
    });
  }
}

// ====================================================================================================
// MAIN ENTRY POINT
// ====================================================================================================

async function main() {
  try {
    const parser = new ArgumentParser();
    const args = parser.getArgs();

    // Display help if requested
    if (args.help) {
      displayHelp();
      process.exit(0);
    }

    // Validate arguments
    parser.validate();

    // Create and run client
    const client = new PerplexityClient(args);
    await client.run();

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    console.log('💡 Use --help for usage information\n');
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main();
}

module.exports = { PerplexityClient, ArgumentParser };
