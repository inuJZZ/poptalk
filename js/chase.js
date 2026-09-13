// Fun foreground scene: a little runner being chased by spiders and a dino, wandering the whole screen.
(function () {
  const canvas = document.getElementById('chase-canvas');
  const ctx = canvas.getContext('2d');
  let w, h;

  function isLight() {
    return document.documentElement.dataset.theme === 'light';
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const runner = {
    x: 0,
    y: 0,
    angle: Math.random() * Math.PI * 2,
    speed: 2.2,
    turnT: 0,
    turnEvery: 90,
  };
  let stride = 0;
  let dust = [];

  // recent runner positions, used so chasers can follow the exact path a few steps behind
  const HISTORY_MAX = 400;
  const history = [];

  const chasers = [
    { type: 'spider', gap: 22, gapWobble: Math.random() * 10, legPhase: 0 },
  ];

  function init() {
    runner.x = Math.random() * w;
    runner.y = Math.random() * h;
  }
  init();

  function stepRunner() {
    runner.turnT++;
    if (runner.turnT > runner.turnEvery || Math.random() < 0.01) {
      runner.turnT = 0;
      runner.turnEvery = 60 + Math.random() * 90;
      runner.angle += (Math.random() - 0.5) * 1.8;
    }

    runner.x += Math.cos(runner.angle) * runner.speed;
    runner.y += Math.sin(runner.angle) * runner.speed;

    const margin = 70;
    if (runner.x < margin || runner.x > w - margin) runner.angle = Math.PI - runner.angle;
    if (runner.y < margin || runner.y > h - margin) runner.angle = -runner.angle;
    runner.x = Math.max(margin, Math.min(w - margin, runner.x));
    runner.y = Math.max(margin, Math.min(h - margin, runner.y));

    history.push({ x: runner.x, y: runner.y });
    if (history.length > HISTORY_MAX) history.shift();
  }

  function historyAt(stepsBack) {
    const idx = history.length - 1 - stepsBack;
    return history[Math.max(0, idx)] || { x: runner.x, y: runner.y };
  }

  function facingOf(stepsBack) {
    const a = historyAt(stepsBack);
    const b = historyAt(stepsBack + 4);
    return a.x - b.x >= 0 ? 1 : -1;
  }

  function drawRunner(x, y, phase, color, facing) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const legSwing = Math.sin(phase) * 14;
    const armSwing = Math.sin(phase + Math.PI) * 12;
    const bob = Math.abs(Math.sin(phase)) * 3;

    // motion lines (speed streaks)
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-26 - i * 10, -30 + i * 8 - bob);
      ctx.lineTo(-46 - i * 10, -30 + i * 8 - bob);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // legs
    ctx.beginPath();
    ctx.moveTo(0, -18 - bob);
    ctx.lineTo(legSwing, 0);
    ctx.moveTo(0, -18 - bob);
    ctx.lineTo(-legSwing, 0);
    ctx.stroke();

    // torso
    ctx.beginPath();
    ctx.moveTo(0, -18 - bob);
    ctx.lineTo(0, -38 - bob);
    ctx.stroke();

    // arms
    ctx.beginPath();
    ctx.moveTo(0, -34 - bob);
    ctx.lineTo(armSwing, -22 - bob);
    ctx.moveTo(0, -34 - bob);
    ctx.lineTo(-armSwing, -22 - bob);
    ctx.stroke();

    // head with a very worried, wide-eyed face
    ctx.beginPath();
    ctx.arc(0, -46 - bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isLight() ? '#fff8ec' : '#07090b';
    ctx.beginPath();
    ctx.arc(-3, -47 - bob, 1.6, 0, Math.PI * 2);
    ctx.arc(3, -47 - bob, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -43 - bob, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // panic mark above head
    ctx.fillStyle = color;
    ctx.font = 'bold 16px Consolas, monospace';
    ctx.fillText('!', -3, -60 - bob - Math.sin(phase * 2) * 3);

    ctx.restore();
  }

  function drawSpider(x, y, phase, color, facing) {
    ctx.save();
    ctx.translate(x, y - 8);
    ctx.scale(facing, 1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;

    const bob = Math.abs(Math.sin(phase)) * 3;
    ctx.translate(0, -bob);

    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const spread = (i - 1.5) * 0.5;
        const wag = Math.sin(phase * 2 + i) * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const kx = Math.cos(spread + wag) * 12;
        const ky = side * (Math.sin(spread + wag) * 8 + 4);
        const ex = Math.cos(spread + wag) * 20;
        const ey = side * (Math.sin(spread + wag) * 10 + 10);
        ctx.quadraticCurveTo(kx, ky, ex, ey);
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(11, 0, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawDino(x, y, phase, color, facing) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const legSwing = Math.sin(phase) * 10;
    const bob = Math.abs(Math.sin(phase)) * 4;

    ctx.translate(0, -bob);

    // legs
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-10 + legSwing, 4);
    ctx.moveTo(10, -10);
    ctx.lineTo(10 - legSwing, 4);
    ctx.stroke();

    // tail
    ctx.beginPath();
    ctx.moveTo(-16, -22);
    ctx.quadraticCurveTo(-40, -30, -52, -18);
    ctx.lineWidth = 8;
    ctx.stroke();

    // body
    ctx.beginPath();
    ctx.ellipse(0, -24, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // neck + head
    ctx.beginPath();
    ctx.moveTo(18, -34);
    ctx.quadraticCurveTo(34, -46, 46, -40);
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(50, -38, 12, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // little arms
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, -26);
    ctx.lineTo(18, -18);
    ctx.stroke();

    // toothy open jaw + eye
    ctx.fillStyle = isLight() ? '#fff8ec' : '#07090b';
    ctx.beginPath();
    ctx.moveTo(56, -34);
    ctx.lineTo(64, -30);
    ctx.lineTo(56, -28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(48, -41, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function draw() {
    const light = isLight();
    const color = light ? '#ff2fb0' : '#39ff8a';

    ctx.clearRect(0, 0, w, h);

    stepRunner();
    stride += 0.22;
    const runnerFacing = Math.cos(runner.angle) >= 0 ? 1 : -1;

    // little dust puffs at the runner's feet
    if (Math.random() < 0.3) {
      dust.push({ x: runner.x - Math.cos(runner.angle) * 10, y: runner.y + 4, r: 2 + Math.random() * 2, a: 0.5 });
    }
    dust = dust.filter((d) => d.a > 0);
    for (const d of dust) {
      ctx.globalAlpha = d.a;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      d.a -= 0.02;
      d.r += 0.05;
    }
    ctx.globalAlpha = 1;

    // chasers follow a few steps behind along the runner's actual path
    for (const c of chasers) {
      c.gapWobble += 0.01 + Math.random() * 0.002;
      const stepsBack = Math.round(c.gap + Math.sin(c.gapWobble) * 6);
      const pos = historyAt(stepsBack);
      const facing = facingOf(stepsBack);
      c.legPhase += 0.3;
      if (c.type === 'spider') drawSpider(pos.x, pos.y, c.legPhase, color, facing);
      else drawDino(pos.x, pos.y, c.legPhase, color, facing);
    }

    drawRunner(runner.x, runner.y, stride, color, runnerFacing);

    requestAnimationFrame(draw);
  }

  draw();
})();
