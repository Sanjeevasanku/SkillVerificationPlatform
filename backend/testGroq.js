require('dotenv').config();
const Groq = require('groq-sdk');

const key = process.env.GROQ_API_KEY;
console.log('GROQ_API_KEY loaded:', key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : ' NOT SET');

const groq = new Groq({ apiKey: key });

(async () => {
    try {
        const res = await groq.chat.completions.create({
            model: 'moonshotai/kimi-k2-instruct',
            messages: [{ role: 'user', content: 'Say "API key works!" and nothing else.' }],
            max_tokens: 20
        });
        console.log(' Response:', res.choices[0].message.content);
    } catch (err) {
        console.error(' Error:', err.message);
    }
})();
