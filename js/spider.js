// Mini neon spiders that roam randomly around the page (green in dark mode, pink in light mode)
(function () {
  const canvas = document.getElementById('spider-canvas');
  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function currentColor() {
    return document.documentElement.dataset.theme === 'light' ? '#ff2fb0' : '#39ff8a';
  }

  const SPIDER_COUNT = 6;

  class Spider {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 4 + 6;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.5 + 0.3;
      this.turnT = 0;
      this.turnEvery = Math.random() * 120 + 60;
      this.legPhase = Math.random() * Math.PI * 2;
      this.pauseTimer = 0;
      this.paused = false;
    }

    step() {
      this.turnT++;
      if (this.paused) {
        this.pauseTimer--;
        if (this.pauseTimer <= 0) this.paused = false;
        this.legPhase += 0.05;
        return;
      }

      // randomly change direction
      if (this.turnT > this.turnEvery) {
        this.turnT = 0;
        this.turnEvery = Math.random() * 140 + 60;
        this.angle += (Math.random() - 0.5) * 1.6;

        // occasionally pause like a real spider
        if (Math.random() < 0.25) {
          this.paused = true;
          this.pauseTimer = Math.random() * 40 + 20;
        }
      }

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      // bounce off edges
      if (this.x < 0 || this.x > w) this.angle = Math.PI - this.angle;
      if (this.y < 0 || this.y > h) this.angle = -this.angle;
      this.x = Math.max(0, Math.min(w, this.x));
      this.y = Math.max(0, Math.min(h, this.y));

      this.legPhase += 0.35;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      const color = currentColor();
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1;

      const s = this.size;

      // legs (4 per side, animated)
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 4; i++) {
          const spread = (i - 1.5) * 0.5;
          const wag = Math.sin(this.legPhase + i) * 0.3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const kx = Math.cos(spread + wag) * s * 1.4;
          const ky = side * Math.sin(spread + wag) * s * 1.4;
          const ex = Math.cos(spread + wag) * s * 2.2;
          const ey = side * (Math.sin(spread + wag) * s * 2.2 + s * 0.6);
          ctx.quadraticCurveTo(kx, ky, ex, ey);
          ctx.stroke();
        }
      }

      // body
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.9, s * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // head
      ctx.beginPath();
      ctx.ellipse(s * 1.1, 0, s * 0.45, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  const spiders = Array.from({ length: SPIDER_COUNT }, () => new Spider());

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (const s of spiders) {
      s.step();
      s.draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
})();
