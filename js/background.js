// Dynamic background: a shower of white popcorn falling fast with a matrix-style fading trail.
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h;

  const KERNEL_COUNT = 60;

  function isLight() {
    return document.documentElement.dataset.theme === 'light';
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makePopcorn() {
    return {
      x: Math.random() * w,
      y: Math.random() * -h,
      scale: 0.6 + Math.random() * 0.8,
      speed: 3 + Math.random() * 4,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.08,
      sway: Math.random() * Math.PI * 2,
    };
  }

  let kernels = Array.from({ length: KERNEL_COUNT }, makePopcorn);

  // a puffy white popcorn kernel made of overlapping lobes
  function drawPopcorn(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.spin);
    ctx.scale(p.scale, p.scale);

    ctx.fillStyle = '#fdfdfb';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 10;

    const lobes = [
      [0, 0, 11],
      [-9, -6, 8],
      [9, -6, 8],
      [-6, 8, 8],
      [6, 8, 8],
      [0, -11, 7],
    ];
    for (const [lx, ly, lr] of lobes) {
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function draw() {
    const light = isLight();

    // matrix-style fading trail instead of a hard clear
    ctx.fillStyle = light ? 'rgba(255, 248, 236, 0.2)' : 'rgba(7, 9, 11, 0.2)';
    ctx.fillRect(0, 0, w, h);

    for (const kernel of kernels) {
      kernel.x += Math.sin(kernel.sway) * 0.6;
      kernel.sway += 0.015;
      kernel.spin += kernel.spinSpeed;
      kernel.y += kernel.speed;

      drawPopcorn(kernel);

      if (kernel.y - 60 > h) Object.assign(kernel, makePopcorn(), { y: -60 });
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

