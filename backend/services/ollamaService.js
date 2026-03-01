/**
 * ollamaService.js
 * Service to communicate with the local Ollama REST API for LLM inference.
 */

const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'codellama';

/**
 * Check if Ollama server is available
 * @returns {Promise<boolean>}
 */
async function isAvailable() {
    try {
        const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });
        return response.status === 200;
    } catch {
        return false;
    }
}

/**
 * Send a chat completion request to Ollama
 * @param {Array} messages - Array of { role, content } messages
 * @param {Object} options - Additional options
 * @param {string} options.model - Model name override
 * @param {number} options.temperature - Temperature (default 0.3 for structured output)
 * @param {number} options.timeoutMs - Timeout in ms (default 120000 = 2 min)
 * @returns {Promise<string>} - Raw response text from the model
 */
async function chat(messages, options = {}) {
    const model = options.model || OLLAMA_MODEL;
    const temperature = options.temperature ?? 0.3;
    const timeoutMs = options.timeoutMs || 120000;

    console.log(`[OllamaService] Sending request to ${model}...`);

    try {
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
            model,
            messages,
            stream: false,
            options: {
                temperature,
                num_predict: 4096
            }
        }, {
            timeout: timeoutMs,
            headers: { 'Content-Type': 'application/json' }
        });

        const content = response.data?.message?.content;
        if (!content) {
            throw new Error('Empty response from Ollama');
        }

        console.log(`[OllamaService] Got response (${content.length} chars)`);
        return content;
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            throw new Error('Ollama server is not running. Start it with: ollama serve');
        }
        if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
            throw new Error(`Ollama request timed out after ${timeoutMs}ms. The model may be loading or the prompt is too large.`);
        }
        throw new Error(`Ollama request failed: ${err.message}`);
    }
}

/**
 * Send a chat request and parse the response as JSON
 * Handles common issues like markdown code fences in the response
 * @param {Array} messages - Chat messages
 * @param {Object} options - Options passed to chat()
 * @returns {Promise<Object>} - Parsed JSON object
 */
async function chatJSON(messages, options = {}) {
    const raw = await chat(messages, options);

    // Clean up common LLM response issues
    let cleaned = raw.trim();

    // Remove markdown code fences if present (```json ... ```)
    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
        cleaned = jsonBlockMatch[1].trim();
    }

    // Try to extract JSON array or object
    const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
        cleaned = jsonMatch[1];
    }

    try {
        return JSON.parse(cleaned);
    } catch (parseErr) {
        console.error('[OllamaService] Failed to parse JSON response:', cleaned.substring(0, 500));
        throw new Error(`Failed to parse Ollama response as JSON: ${parseErr.message}`);
    }
}

module.exports = {
    isAvailable,
    chat,
    chatJSON,
    OLLAMA_MODEL,
    OLLAMA_BASE_URL
};
