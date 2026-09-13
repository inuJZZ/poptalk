// PopTalk chatbot brain: lightweight rule-based NLP for conversation + day planning
const PopTalkBot = (function () {
  const GREETINGS = ['hello', 'hi', 'hey', 'yo', 'sup', 'good morning', 'good evening', 'good afternoon'];
  const THANKS = ['thanks', 'thank you', 'thx', 'appreciate it'];
  const BYE = ['bye', 'goodbye', 'see ya', 'later', 'cya'];

  function includesAny(text, list) {
    return list.some((w) => text.includes(w));
  }

  // safe arithmetic: only digits, spaces, and + - * / ( ) . allowed
  function tryMath(text) {
    const cleaned = text.replace(/what is|what's|calculate|=|\?/gi, '').trim();
    if (!/^[0-9+\-*/().\s]+$/.test(cleaned) || !/\d/.test(cleaned)) return null;
    try {
      const tokens = cleaned.match(/\d+(\.\d+)?|[+\-*/()]/g);
      if (!tokens) return null;
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${tokens.join(' ')});`)();
      if (typeof result === 'number' && isFinite(result)) return result;
    } catch {
      return null;
    }
    return null;
  }

  function timeAnswer() {
    const now = new Date();
    return `It's currently <strong>${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> on <strong>${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</strong>.`;
  }

  const JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "I told my computer I needed a break, and it said 'no problem, I'll go to sleep too.'",
    "Why did the spider go to the computer? To check its web-site.",
    "There are 10 kinds of people: those who understand binary, and those who don't.",
  ];

  const FACTS = {
    "poptalk": "PopTalk is your personal AI-style companion for conversation and day planning — built to feel fast, focused, and a little bit alive (hi, spiders 🕷️).",
    "you": "I'm PopTalk — I chat, answer questions, crack the occasional joke, and help you plan your day so nothing slips through the cracks.",
    "spider": "The little neon spiders roaming the page are just for fun — a signature PopTalk touch, harmless and fully decorative.",
  };

  function detectPlanRequest(text) {
    return /plan (my|the|out) day|help me plan|build (me )?a schedule|organi[sz]e my day|make (me )?a plan/.test(text);
  }

  function suggestedPlan() {
    return [
      { time: '7:00 AM', name: 'Wake up & morning routine', priority: 'medium' },
      { time: '7:30 AM', name: 'Light exercise / stretch', priority: 'low' },
      { time: '8:30 AM', name: 'Deep work block #1 (top priority task)', priority: 'high' },
      { time: '11:00 AM', name: 'Short break / walk', priority: 'low' },
      { time: '11:15 AM', name: 'Deep work block #2', priority: 'high' },
      { time: '1:00 PM', name: 'Lunch', priority: 'medium' },
      { time: '2:00 PM', name: 'Meetings / collaboration', priority: 'medium' },
      { time: '4:00 PM', name: 'Admin & quick tasks', priority: 'low' },
      { time: '6:00 PM', name: 'Wind down / personal time', priority: 'low' },
      { time: '9:30 PM', name: 'Reflect on the day & prep tomorrow', priority: 'medium' },
    ];
  }

  // Things PopTalk can answer instantly, without calling the AI API.
  function isDeterministic(rawText) {
    const text = rawText.trim().toLowerCase();
    if (!text) return true;
    return (
      includesAny(text, BYE) ||
      includesAny(text, THANKS) ||
      includesAny(text, GREETINGS) ||
      detectPlanRequest(text) ||
      /what time|current time/.test(text) ||
      /what.?s the date|today.?s date|what day is it/.test(text) ||
      /joke|make me laugh|funny/.test(text) ||
      /who are you|what are you|about poptalk|what is poptalk/.test(text) ||
      /spider/.test(text) ||
      /help|what can you do/.test(text) ||
      tryMath(text) !== null
    );
  }

  function respond(rawText) {
    const text = rawText.trim().toLowerCase();

    if (!text) return { reply: "I didn't quite catch that — try asking me something." };

    if (includesAny(text, BYE)) {
      return { reply: 'Talk soon! I\'ll keep the neon lights on for you. 👋' };
    }

    if (includesAny(text, THANKS)) {
      return { reply: "You're welcome! Let me know if there's anything else on your mind." };
    }

    if (includesAny(text, GREETINGS)) {
      return { reply: 'Hey there! How are you doing today, and what can I help you with?' };
    }

    if (detectPlanRequest(text)) {
      const items = suggestedPlan()
        .map((t) => `<li><strong>${t.time}</strong> — ${t.name}</li>`)
        .join('');
      return { reply: `Here's a balanced day plan I put together for you:<ul>${items}</ul>Want me to adjust anything?` };
    }

    if (/what time|current time/.test(text)) return { reply: timeAnswer() };
    if (/what.?s the date|today.?s date|what day is it/.test(text)) return { reply: timeAnswer() };

    if (/joke|make me laugh|funny/.test(text)) {
      return { reply: JOKES[Math.floor(Math.random() * JOKES.length)] };
    }

    if (/who are you|what are you|about poptalk|what is poptalk/.test(text)) {
      return { reply: FACTS.poptalk };
    }

    if (/spider/.test(text)) {
      return { reply: FACTS.spider };
    }

    const mathResult = tryMath(text);
    if (mathResult !== null) {
      return { reply: `That comes out to <strong>${mathResult}</strong>.` };
    }

    if (/help|what can you do/.test(text)) {
      return {
        reply:
          "I can chat about pretty much anything, answer quick questions, do simple math, tell a joke, and sketch out a day plan. Try:" +
          "<ul><li>\"plan my day\"</li><li>\"what time is it\"</li><li>\"tell me a joke\"</li><li>\"what's 24 * 8\"</li></ul>",
      };
    }

    if (text.endsWith('?')) {
      return {
        reply:
          "Good question. I don't have live internet access, but based on what you're asking, here's my take: " +
          reflect(text) +
          " Want me to help you turn this into an action item on your day plan instead?",
      };
    }

    return { reply: reflect(text) };
  }

  function reflect(text) {
    const clean = text.replace(/[?.!]+$/, '');
    const openers = [
      `Interesting — tell me more about "${clean}".`,
      `Got it. From what you're describing, it sounds like this matters to you — want to break it into a task?`,
      `I hear you. Let's dig into that a bit more — what's the outcome you're hoping for?`,
      `Noted. If it'd help, I can turn "${clean}" into a scheduled task for today.`,
    ];
    return openers[Math.floor(Math.random() * openers.length)];
  }

  return { respond, isDeterministic, reflect };
})();
