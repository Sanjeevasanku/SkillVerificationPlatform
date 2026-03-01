/**
 * Quick test script to verify Ollama integration works.
 * Run: node test-ollama.js
 */
require('dotenv').config();
const ollamaService = require('./services/ollamaService');

async function test() {
    console.log('=== Ollama Integration Test ===\n');

    // 1. Check availability
    console.log('1. Checking Ollama server...');
    const available = await ollamaService.isAvailable();
    console.log(`   Server available: ${available}`);
    if (!available) {
        console.log('    Ollama is not running. Start with: ollama serve');
        process.exit(1);
    }

    // 2. Simple chat test
    console.log('\n2. Testing simple chat...');
    try {
        const response = await ollamaService.chat([
            { role: 'user', content: 'Reply with just the word "hello" in lowercase, nothing else.' }
        ], { timeoutMs: 30000 });
        console.log(`   Response: "${response.trim()}"`);
        console.log('    Chat works!');
    } catch (err) {
        console.log(`    Chat failed: ${err.message}`);
        process.exit(1);
    }

    // 3. JSON extraction test (simulates skill extraction)
    console.log('\n3. Testing JSON extraction (skill detection simulation)...');
    try {
        const result = await ollamaService.chatJSON([
            {
                role: 'system',
                content: 'You are a code analyzer. Respond ONLY with valid JSON, no markdown.'
            },
            {
                role: 'user',
                content: `Analyze this package.json and list the technologies used:
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "react": "^18.2.0",
    "jsonwebtoken": "^9.0.0"
  }
}

Respond with JSON: { "skills": [{ "name": "...", "category": "...", "confidenceScore": 0.9 }] }`
            }
        ], { timeoutMs: 60000 });

        console.log('   Parsed JSON result:');
        console.log(JSON.stringify(result, null, 2));

        if (result.skills && Array.isArray(result.skills)) {
            console.log(`    JSON extraction works! Found ${result.skills.length} skills.`);
        } else {
            console.log('     Response received but no "skills" array found.');
        }
    } catch (err) {
        console.log(`    JSON extraction failed: ${err.message}`);
    }

    console.log('\n=== Test Complete ===');
}

test().catch(console.error);
