# PopTalk

**PopTalk** is a dark-mode AI chat companion I built with a fast, focused UI, a locally-run language model backend, and an animated presentation layer that makes the whole thing feel alive instead of static.

It's a full-stack, self-hosted alternative to the usual cloud chat products. No third-party API keys, no data leaving your machine, no subscription. The entire inference pipeline runs on your own hardware through Ollama.

---

## ✨ Features

- **Conversational AI, powered locally.** General questions get routed to a locally hosted LLM (via [Ollama](https://ollama.com)), so there's zero API cost and your data stays on your machine.
- **Hybrid response engine.** Deterministic intents (time, jokes, quick math, day-planning requests) get resolved instantly by a lightweight rule-based layer, so common interactions stay snappy without waiting on the model.
- **Graceful degradation.** If the AI backend isn't reachable, PopTalk automatically falls back to its local responder so the app never breaks for the user.
- **Light/dark theming.** A full theme system with a saved preference that swaps the entire palette, including the accent color, between a green neon dark mode and a pink neon light mode.
- **Custom animated canvas layers.** A layered rendering pipeline (background ambiance, foreground character animation) built directly on the Canvas API, no animation library needed.
- **Security-conscious API layer.** Request validation, payload size limits, and rate limiting on every backend endpoint.
- **Zero build step.** A fully static, framework-free frontend that ships as is. No bundler or compile pipeline required.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3 (custom properties, `color-mix`, backdrop filters), ES6+ JavaScript |
| Rendering | HTML5 Canvas API (custom particle/animation engine) |
| Backend | Node.js, Express |
| AI Inference | [Ollama](https://ollama.com) (local LLM runtime, default model: `llama3.2`) |
| Security | Helmet, `express-rate-limit`, input validation |
| Persistence | `localStorage` (client-side conversation history & theme preference) |
| Tooling | `dotenv` for environment configuration |

---

## 🚀 Getting Started

```bash
npm install
npm start
```

Then open **http://localhost:5175**.

### Enabling real AI responses

PopTalk works out of the box using its local rule-based responder. To get full conversational AI going:

1. Install [Ollama](https://ollama.com)
2. Pull a model:
   ```bash
   ollama pull llama3.2
   ```
3. Optionally copy `.env.example` to `.env` to customize `OLLAMA_URL` / `OLLAMA_MODEL`
4. Restart the server. PopTalk will detect Ollama automatically and route conversational messages to it.

---

## 📂 Project Structure

```
poptalk/
├── server.js          # Express server + secure AI proxy endpoint
├── index.html         # App shell
├── css/style.css       # Theming, layout, component styles
└── js/
    ├── app.js          # Chat UI wiring, theme toggle, persistence
    ├── chatbot.js       # Deterministic intent responder
    ├── api.js           # Client-side AI request layer
    ├── background.js    # Animated background canvas layer
    └── chase.js          # Foreground character animation layer
```

---

## 🔒 Security Notes

- All AI requests are proxied server-side, so no credentials or model endpoints are ever exposed to the client.
- Incoming chat payloads are length-validated and rate-limited to prevent abuse.
- `helmet` is applied globally for standard HTTP security headers.
