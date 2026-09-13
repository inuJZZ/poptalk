PopTalk 
A dark mode AI chat companion with a light mode toggle, an animated background, and a playful chase scene animation (a runner fleeing a neon spider roaming the page x) , you can talk to it, ask it questions, basically just spend your wasted time in there instead, i created this web page out of boredom and killing time has always been cool to me while combing it with some creating and coding, if you use it let know what you think and if anything you think could be better, let me know.  

## Features
- Chat UI with instant answers for common intents (time, jokes, math, day planning) and free form conversation routed to a local AI model via [Ollama](https://ollama.com)
- Light/dark theme toggle (green neon in dark mode, pink neon in light mode)
- Animated popcorn-shower background and a wandering chase-scene foreground animation
- Falls back to a local rule-based bot automatically if no AI backend is available

## Run locally
```
npm install
npm start
```
Open http://localhost:5175

## Optional: real AI responses
Install [Ollama](https://ollama.com), then:
```
ollama pull llama3.2
```
Copy `.env.example` to `.env` if you want to customize `OLLAMA_URL` / `OLLAMA_MODEL`. Restart the server — it will automatically use Ollama when available, and fall back to the local bot otherwise.

## Deploy
Includes a `render.yaml` for deploying to [Render](https://render.com) as a free web service. Note: cloud hosting has no access to your local Ollama instance, so a deployed instance will use the local rule-based bot unless you configure a hosted model.
