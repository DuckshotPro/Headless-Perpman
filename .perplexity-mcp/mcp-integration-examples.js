#!/usr/bin/env node

/**
 * ====================================================================================================
 * MCP INTEGRATION EXAMPLES
 * ====================================================================================================
 * 
 * This file demonstrates how to integrate the Perplexity client with Windows-MCP
 * for advanced automation and workflows.
 * 
 * These examples show real-world use cases combining:
 * - Perplexity conversation exports
 * - File system operations via MCP
 * - Process management
 * - Data processing and analysis
 * 
 * ====================================================================================================
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// ====================================================================================================
// EXAMPLE 1: AUTOMATED DAILY BACKUP
// ====================================================================================================

/**
 * Automatically export all Perplexity conversations and organize by date
 * Perfect for running as a scheduled task
 */
async function example1_DailyBackup() {
  console.log('=== EXAMPLE 1: Automated Daily Backup ===\n');
  
  const today = new Date().toISOString().split('T')[0];
  const backupDir = `./backups/${today}`;
  
  // Create backup directory
  await fs.mkdir(backupDir, { recursive: true });
  console.log(`✅ Created backup directory: ${backupDir}`);
  
  // Run export using Chrome session (no manual intervention)
  const args = [
    'mcp-perplexity-client.js',
    '--mode=export',
    '--email=your@example.com',
    '--output=' + backupDir,
    '--user-data-dir=C:\\Users\\420du\\AppData\\Local\\Google\\Chrome\\User Data',
    '--headless'
  ];
  
  console.log('📤 Starting export...\n');
  
  return new Promise((resolve, reject) => {
    const child = spawn('node', args, { stdio: 'inherit' });
    
    child.on('exit', async (code) => {
      if (code === 0) {
        console.log(`\n✅ Backup completed: ${backupDir}`);
        
        // Count exported files
        const files = await fs.readdir(backupDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        console.log(`📊 Exported ${mdFiles.length} conversations`);
        
        resolve();
      } else {
        reject(new Error(`Export failed with code ${code}`));
      }
    });
  });
}

// ====================================================================================================
// EXAMPLE 2: CONVERSATION ANALYSIS WITH AI
// ====================================================================================================

/**
 * Export conversations and analyze them using AI
 * Demonstrates integration with AI models for insights
 */
async function example2_ConversationAnalysis() {
  console.log('=== EXAMPLE 2: Conversation Analysis ===\n');
  
  const exportDir = './exports';
  const analysisDir = './analysis';
  
  // Ensure directories exist
  await fs.mkdir(exportDir, { recursive: true });
  await fs.mkdir(analysisDir, { recursive: true });
  
  // Step 1: Export conversations
  console.log('📤 Exporting conversations...');
  await runPerplexityExport(exportDir);
  
  // Step 2: Read all markdown files
  console.log('\n📖 Reading conversations...');
  const files = await fs.readdir(exportDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  console.log(`Found ${mdFiles.length} conversations\n`);
  
  // Step 3: Analyze each conversation
  for (const file of mdFiles.slice(0, 3)) { // Analyze first 3 for demo
    const filePath = path.join(exportDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    console.log(`🔍 Analyzing: ${file}`);
    
    // Extract key information
    const analysis = {
      filename: file,
      wordCount: content.split(/\s+/).length,
      lines: content.split('\n').length,
      hasCodeBlocks: content.includes('```'),
      topics: extractTopics(content),
      summary: generateSummary(content)
    };
    
    // Save analysis
    const analysisFile = file.replace('.md', '-analysis.json');
    await fs.writeFile(
      path.join(analysisDir, analysisFile),
      JSON.stringify(analysis, null, 2)
    );
    
    console.log(`  ✅ Word count: ${analysis.wordCount}`);
    console.log(`  ✅ Topics: ${analysis.topics.join(', ')}`);
  }
  
  console.log(`\n✅ Analysis complete. Results in: ${analysisDir}`);
}

// ====================================================================================================
// EXAMPLE 3: SEARCH AND FILTER CONVERSATIONS
// ====================================================================================================

/**
 * Search through exported conversations for specific topics
 * Useful for finding relevant information quickly
 */
async function example3_SearchConversations() {
  console.log('=== EXAMPLE 3: Search Conversations ===\n');
  
  const exportDir = './exports';
  const searchTerm = 'machine learning'; // Change this to search for different topics
  
  console.log(`🔍 Searching for: "${searchTerm}"\n`);
  
  // Read all markdown files
  const files = await fs.readdir(exportDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  const results = [];
  
  for (const file of mdFiles) {
    const filePath = path.join(exportDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Search for term (case-insensitive)
    if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
      // Extract context around the match
      const lines = content.split('\n');
      const matchingLines = lines.filter(line => 
        line.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      results.push({
        file,
        matches: matchingLines.length,
        preview: matchingLines[0]?.substring(0, 100) + '...'
      });
    }
  }
  
  // Display results
  if (results.length > 0) {
    console.log(`✅ Found ${results.length} conversations with "${searchTerm}":\n`);
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.file}`);
      console.log(`   Matches: ${result.matches}`);
      console.log(`   Preview: ${result.preview}\n`);
    });
  } else {
    console.log(`❌ No conversations found with "${searchTerm}"`);
  }
}

// ====================================================================================================
// EXAMPLE 4: KNOWLEDGE BASE BUILDER
// ====================================================================================================

/**
 * Build a searchable knowledge base from Perplexity conversations
 * Creates an index for quick searching
 */
async function example4_KnowledgeBase() {
  console.log('=== EXAMPLE 4: Knowledge Base Builder ===\n');
  
  const exportDir = './exports';
  const kbDir = './knowledge-base';
  
  await fs.mkdir(kbDir, { recursive: true });
  
  console.log('📚 Building knowledge base...\n');
  
  // Read all conversations
  const files = await fs.readdir(exportDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  const knowledgeBase = {
    created: new Date().toISOString(),
    totalConversations: mdFiles.length,
    conversations: [],
    topicIndex: {}
  };
  
  // Process each conversation
  for (const file of mdFiles) {
    const filePath = path.join(exportDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    const topics = extractTopics(content);
    const summary = generateSummary(content);
    
    const entry = {
      id: file.replace('.md', ''),
      filename: file,
      topics,
      summary,
      wordCount: content.split(/\s+/).length,
      path: filePath
    };
    
    knowledgeBase.conversations.push(entry);
    
    // Build topic index
    topics.forEach(topic => {
      if (!knowledgeBase.topicIndex[topic]) {
        knowledgeBase.topicIndex[topic] = [];
      }
      knowledgeBase.topicIndex[topic].push(entry.id);
    });
  }
  
  // Save knowledge base
  await fs.writeFile(
    path.join(kbDir, 'index.json'),
    JSON.stringify(knowledgeBase, null, 2)
  );
  
  console.log('✅ Knowledge base created!');
  console.log(`📊 Total conversations: ${knowledgeBase.totalConversations}`);
  console.log(`📋 Topics indexed: ${Object.keys(knowledgeBase.topicIndex).length}`);
  console.log(`📁 Location: ${path.join(kbDir, 'index.json')}`);
}

// ====================================================================================================
// EXAMPLE 5: AUTOMATED REPORT GENERATION
// ====================================================================================================

/**
 * Generate a weekly report summarizing all Perplexity usage
 * Perfect for tracking research progress
 */
async function example5_WeeklyReport() {
  console.log('=== EXAMPLE 5: Weekly Report ===\n');
  
  const exportDir = './exports';
  const reportDir = './reports';
  
  await fs.mkdir(reportDir, { recursive: true });
  
  console.log('📊 Generating weekly report...\n');
  
  // Read all conversations
  const files = await fs.readdir(exportDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  // Gather statistics
  let totalWords = 0;
  let totalConversations = mdFiles.length;
  const topicCounts = {};
  const dailyCounts = {};
  
  for (const file of mdFiles) {
    const filePath = path.join(exportDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    
    // Word count
    totalWords += content.split(/\s+/).length;
    
    // Topics
    const topics = extractTopics(content);
    topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    
    // Date
    const date = stats.mtime.toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  }
  
  // Generate report
  const report = `
# Perplexity Usage Report
**Generated:** ${new Date().toISOString()}

## Summary
- **Total Conversations:** ${totalConversations}
- **Total Words:** ${totalWords.toLocaleString()}
- **Average Words per Conversation:** ${Math.round(totalWords / totalConversations)}

## Top Topics
${Object.entries(topicCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([topic, count]) => `- **${topic}:** ${count} conversations`)
  .join('\n')}

## Daily Activity
${Object.entries(dailyCounts)
  .sort((a, b) => b[0].localeCompare(a[0]))
  .slice(0, 7)
  .map(([date, count]) => `- **${date}:** ${count} conversations`)
  .join('\n')}

---
*Generated by MCP Perplexity Client*
`;
  
  // Save report
  const reportFile = `report-${new Date().toISOString().split('T')[0]}.md`;
  await fs.writeFile(path.join(reportDir, reportFile), report);
  
  console.log('✅ Report generated!');
  console.log(`📄 Location: ${path.join(reportDir, reportFile)}`);
}

// ====================================================================================================
// HELPER FUNCTIONS
// ====================================================================================================

/**
 * Run Perplexity export
 */
function runPerplexityExport(outputDir) {
  return new Promise((resolve, reject) => {
    const args = [
      'mcp-perplexity-client.js',
      '--mode=export',
      '--email=your@example.com',
      '--output=' + outputDir,
      '--user-data-dir=C:\\Users\\420du\\AppData\\Local\\Google\\Chrome\\User Data',
      '--headless'
    ];
    
    const child = spawn('node', args, { stdio: 'inherit' });
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Export failed: ${code}`)));
  });
}

/**
 * Extract topics from conversation text
 */
function extractTopics(content) {
  // Simple topic extraction - can be enhanced with NLP
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !commonWords.has(w));
  
  // Count word frequency
  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });
  
  // Return top 5 topics
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Generate simple summary
 */
function generateSummary(content) {
  // Take first 200 characters as summary
  const text = content.replace(/[#*`]/g, '').trim();
  return text.substring(0, 200) + (text.length > 200 ? '...' : '');
}

// ====================================================================================================
// MAIN MENU
// ====================================================================================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║           MCP INTEGRATION EXAMPLES                                 ║
╚════════════════════════════════════════════════════════════════════╝

Choose an example to run:

1. Automated Daily Backup
2. Conversation Analysis with AI
3. Search and Filter Conversations
4. Knowledge Base Builder
5. Weekly Report Generation
6. Run All Examples
7. Exit

`);
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Enter your choice (1-7): ', async (answer) => {
    rl.close();
    
    try {
      switch (answer.trim()) {
        case '1':
          await example1_DailyBackup();
          break;
        case '2':
          await example2_ConversationAnalysis();
          break;
        case '3':
          await example3_SearchConversations();
          break;
        case '4':
          await example4_KnowledgeBase();
          break;
        case '5':
          await example5_WeeklyReport();
          break;
        case '6':
          await example1_DailyBackup();
          await example2_ConversationAnalysis();
          await example3_SearchConversations();
          await example4_KnowledgeBase();
          await example5_WeeklyReport();
          break;
        case '7':
          console.log('\nGoodbye!\n');
          process.exit(0);
          break;
        default:
          console.log('\nInvalid choice. Please run again.\n');
          process.exit(1);
      }
      
      console.log('\n✅ Example completed!\n');
    } catch (error) {
      console.error('\n❌ Error:', error.message, '\n');
      process.exit(1);
    }
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  example1_DailyBackup,
  example2_ConversationAnalysis,
  example3_SearchConversations,
  example4_KnowledgeBase,
  example5_WeeklyReport
};
