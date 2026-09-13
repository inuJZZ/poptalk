// PopTalk backend: serves the static site and securely proxies chat requests to a local Ollama model.
// No API key required — everything runs on your machine.
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = Number(process.env.PORT || 5175);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';


app.use(helmet());
app.use(express.json({ limit: '10kb' }));

app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please slow down.' },
  })
);

const SYSTEM_PROMPT =
  'You are PopTalk, a friendly, professional AI companion. You chat naturally, answer questions ' +
  'clearly and concisely, and help the user plan and organize their day. Keep replies conversational ' +
  'and not overly long. You may use simple HTML tags like <strong> and <em> for emphasis, but no ' +
  'markdown code fences and no <script> tags.';

app.post('/api/chat', async (req, res) => {
  try {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > 2000) {
      return res.status(400).json({ error: 'Message must be between 1 and 2000 characters.' });
    }

    const historyIn = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];
    const history = historyIn
      .filter((h) => h && typeof h.userText === 'string' && typeof h.botHtml === 'string')
      .flatMap((h) => [
        { role: 'user', content: h.userText.slice(0, 2000) },
        { role: 'assistant', content: h.botHtml.replace(/<[^>]*>/g, '').slice(0, 2000) },
      ]);

    let response;
    try {
      response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: message }],
          stream: false,
        }),
      });
    } catch {
      return res.status(503).json({ error: 'Ollama is not reachable. Is it running (ollama serve)?' });
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error('Ollama error:', response.status, errBody);
      return res.status(502).json({ error: 'The AI provider returned an error.' });
    }

    const data = await response.json();
    const reply = data.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: 'Empty response from AI provider.' });

    return res.json({ reply });
  } catch (error) {
    console.error('Chat handler failed:', error);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
});

app.use(express.static(__dirname));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PopTalk running at http://localhost:${PORT}`);
  console.log(`Using Ollama at ${OLLAMA_URL} with model "${OLLAMA_MODEL}" (falls back to local replies if unreachable).`);
});
