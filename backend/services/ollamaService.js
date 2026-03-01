/**
 * ollamaService.js
 * Service to communicate with the local Ollama REST API for LLM inference.
 */

const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'https://80b1-122-177-240-52.ngrok-free.app';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

/**
 * Check if Ollama server is available
 * @returns {Promise<boolean>}
 */
async function isAvailable() {
    try {
        const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
            timeout: 8000,
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'User-Agent': 'SkillVerify/1.0'
            }
        });
        const isJson = typeof response.data === 'object';
        console.log(`[OllamaService] Server check: status=${response.status}, isJson=${isJson}`);
        return response.status === 200 && isJson;
    } catch (err) {
        console.warn(`[OllamaService] Server not available: ${err.message}`);
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
        const postData = {
            model,
            messages,
            stream: false,
            options: {
                temperature,
                num_predict: 4096
            }
        };

        const axiosConfig = {
            timeout: timeoutMs,
            maxRedirects: 0,  // Don't auto-follow redirects (they convert POST→GET)
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'User-Agent': 'SkillVerify/1.0'
            }
        };

        let response;
        try {
            response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, postData, axiosConfig);
        } catch (redirectErr) {
            // If we get a redirect (301/302), re-POST to the new URL
            if (redirectErr.response && [301, 302, 307, 308].includes(redirectErr.response.status)) {
                const redirectUrl = redirectErr.response.headers.location;
                console.log(`[OllamaService] Following redirect to: ${redirectUrl}`);
                response = await axios.post(redirectUrl, postData, {
                    ...axiosConfig,
                    maxRedirects: 5  // Allow normal redirects on the final URL
                });
            } else {
                throw redirectErr;
            }
        }

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
        throw new Error(`Ollama request failed: ${err.response?.status || err.message}`);
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
