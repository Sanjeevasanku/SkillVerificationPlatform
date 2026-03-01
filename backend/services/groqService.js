/**
 * groqService.js
 * Handles all Groq LLM communication for skill test question generation and evaluation.
 */

const Groq = require('groq-sdk');

let groqClient = null;

function getGroqClient() {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not set in environment variables');
        }
        console.log(`[GroqService] Initializing with key: ${apiKey.substring(0, 8)}...`);
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

const MODELS = [
    'moonshotai/kimi-k2-instruct',
    'moonshotai/kimi-k2-instruct-0905',
    'meta-llama/llama-4-scout-17b-16e-instruct'
];

/**
 * Call Groq with automatic model fallback
 * @param {Array} messages Chat messages array
 * @returns {Promise<string>} LLM response content
 */
async function callGroq(messages) {
    let lastError;

    for (const model of MODELS) {
        try {
            console.log(`[GroqService] Trying model: ${model}`);
            const response = await getGroqClient().chat.completions.create({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error('Empty response from model');

            console.log(`[GroqService] Success with model: ${model}`);
            return content;
        } catch (err) {
            console.warn(`[GroqService] Model ${model} failed: ${err.message}`);
            lastError = err;
        }
    }

    throw new Error(`All Groq models failed. Last error: ${lastError?.message}`);
}

/**
 * Generate fill-in-the-blank skill test questions
 * @param {Array} skills Array of skill objects { name, category, confidenceScore }
 * @param {number} round 1 or 2
 * @returns {Promise<Array>} Array of question objects
 */
exports.generateQuestions = async (skills, round = 1, previousQuestions = []) => {
    const skillList = skills.map(s => `${s.name} (${s.category}, confidence: ${(s.confidenceScore * 100).toFixed(0)}%)`).join(', ');

    let prompt;

    if (round === 1) {
        prompt = `You are a strict technical interviewer. A student claims proficiency in these skills: ${skillList}.

Generate exactly 4 FILL-IN-THE-BLANK technical questions. Each question must be a statement with exactly one blank represented by "___" (three underscores) that the student must fill in.

Rules:
1. Spread questions across different skills.
2. Difficulty levels:
   - 2 questions must be EASY: Basic fact/definition blank (e.g. "In React, ___ is the hook used to manage component-level state."  answer: useState)
   - 2 questions must be MEDIUM: Applied knowledge blank (e.g. "In Express, the ___ method is used to register middleware."  answer: use)
3. The correct answer MUST be a SINGLE function name, method name, hook name, keyword, or technical term. NO parentheses, NO phrases, NO multiple words. Just the bare name.
4. The statement around the blank must provide enough context to determine the answer without ambiguity.

Respond ONLY with valid JSON:
{
  "questions": [
    { "id": 1, "difficulty": "easy", "skill": "<skill>", "question": "<statement with ___ blank>", "correctAnswer": "<expected answer>" },
    { "id": 2, "difficulty": "easy", "skill": "<skill>", "question": "<statement with ___ blank>", "correctAnswer": "<expected answer>" },
    { "id": 3, "difficulty": "medium", "skill": "<skill>", "question": "<statement with ___ blank>", "correctAnswer": "<expected answer>" },
    { "id": 4, "difficulty": "medium", "skill": "<skill>", "question": "<statement with ___ blank>", "correctAnswer": "<expected answer>" }
  ]
}`;
    } else {
        const prevBlock = previousQuestions.map(q => `- [${q.skill}] ${q.question} (answer: ${q.correctAnswer})`).join('\n');

        prompt = `You are a strict technical interviewer conducting a follow-up deep-dive. The student passed round 1 on these skills: ${skillList}.

The following 4 questions were already asked in round 1 — DO NOT repeat the same topics or concepts:
${prevBlock}

Generate exactly 2 HARD-LEVEL fill-in-the-blank questions. Each must be a statement with one "___" blank.

Rules:
1. Target the most complex skills
2. These should test deep internals, edge cases, or advanced concepts (e.g. "In Node.js, the ___ phase of the event loop handles I/O callbacks."  answer: poll)
3. The correct answer MUST be a SINGLE function name, method name, keyword, or technical term. NO parentheses, NO phrases. Just the bare name.
4. Significantly harder than the initial round
5. Must cover DIFFERENT topics from the round 1 questions listed above

Respond ONLY with valid JSON:
{
  "questions": [
    { "id": 5, "difficulty": "hard", "skill": "<skill>", "question": "<statement with ___ blank>", "correctAnswer": "<expected answer>" },
    { "id": 6, "difficulty": "hard", "skill": "<skill>", "question": "<statement with ___ blank>", "correctAnswer": "<expected answer>" }
  ]
}`;
    }

    const response = await callGroq([
        { role: 'system', content: 'You are a technical interviewer AI. Always respond with valid JSON only. No markdown, no explanation outside JSON.' },
        { role: 'user', content: prompt }
    ]);

    const parsed = JSON.parse(response);
    return parsed.questions;
};

/**
 * Evaluate fill-in-the-blank student answers
 * @param {Array} questionsAndAnswers Array of { id, difficulty, skill, question, answer, correctAnswer }
 * @returns {Promise<Object>} { scores: [{ id, score, feedback }], totalScore }
 */
exports.evaluateAnswers = async (questionsAndAnswers) => {
    const qaBlock = questionsAndAnswers.map(qa =>
        `Q${qa.id}: "${qa.question}" | Correct: "${qa.correctAnswer}" | Student wrote: "${qa.answer}"`
    ).join('\n');

    const prompt = `You are a STRICT fill-in-the-blank answer checker. Each line below has a question, the correct answer, and what the student wrote.

RULES:
- Score is ONLY 0 or 1.
- Award 1 if the student's answer matches the correct answer. Accept: minor typos, case differences, common abbreviations (e.g. "useState" = "usestate", "JWT" = "jsonwebtoken").
- Award 0 if the answer is wrong, blank, gibberish, a joke, or a different concept entirely.

${qaBlock}

Respond ONLY with valid JSON:
{
  "scores": [
    { "id": <question_id>, "score": <0 or 1>, "feedback": "<one-line reason>" }
  ],
  "totalScore": <sum>
}`;

    const response = await callGroq([
        { role: 'system', content: 'You are a strict answer checker. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
    ]);

    const parsed = JSON.parse(response);
    return parsed;
};
