// Talks to PopTalk's backend, which proxies to the configured AI provider.
const PopTalkAPI = (function () {
  async function askAI(message, history) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }

    const data = await res.json();
    return data.reply;
  }

  return { askAI };
})();
