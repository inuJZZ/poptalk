// PopTalk app: chat wiring + local conversation persistence
(function () {
  const STORAGE_KEY = 'poptalk_history';
  const THEME_KEY = 'poptalk_theme';

  // ---------- Theme toggle ----------
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeIcon.textContent = theme === 'light' ? '⋆.˚ ☀︎⭒.' : '⋆.˚ ☾⭒.';
    themeLabel.textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
  });

  // ---------- Chat ----------
  const chatWindow = document.getElementById('chat-window');
  const composer = document.getElementById('composer');
  const chatInput = document.getElementById('chat-input');
  const clearBtn = document.getElementById('clear-btn');

  function appendMessage(role, html) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;
    const avatar = document.createElement('div');
    avatar.className = `avatar ${role === 'bot' ? 'bot-avatar' : 'user-avatar'}`;
    avatar.textContent = role === 'bot' ? 'P' : 'U';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = html;
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    chatWindow.appendChild(wrap);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return bubble;
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    wrap.id = 'typing-indicator';
    wrap.innerHTML = `
      <div class="avatar bot-avatar">P</div>
      <div class="bubble"><span class="typing"><span></span><span></span><span></span></span></div>
    `;
    chatWindow.appendChild(wrap);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function saveHistoryEntry(userText, botHtml) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history.push({ userText, botHtml, ts: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-100)));
  }

  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage('user', escapeHtml(text));
    chatInput.value = '';
    showTyping();

    // Deterministic intents (plan/time/joke/math/etc.) are answered locally and instantly.
    if (PopTalkBot.isDeterministic(text)) {
      setTimeout(() => {
        removeTyping();
        const result = PopTalkBot.respond(text);
        appendMessage('bot', result.reply);
        saveHistoryEntry(text, result.reply);
      }, 400 + Math.random() * 250);
      return;
    }

    // Everything else goes to the AI backend, with a local fallback if it's unavailable.
    const recentHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').slice(-6);
    PopTalkAPI.askAI(text, recentHistory)
      .then((reply) => {
        removeTyping();
        appendMessage('bot', reply);
        saveHistoryEntry(text, reply);
      })
      .catch(() => {
        removeTyping();
        const fallback = PopTalkBot.respond(text).reply;
        appendMessage('bot', fallback);
        saveHistoryEntry(text, fallback);
      });
  });

  clearBtn.addEventListener('click', () => {
    chatWindow.innerHTML = '';
    appendMessage('bot', "Conversation cleared. What's next?");
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
