// Programmatic confetti — no external deps needed
export function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#ffffff'];
  const particles = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 100,
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * 4 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: Math.random() * 10 + 4,
    h: Math.random() * 6 + 3,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 12,
    opacity: 1,
  }));

  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12;
      p.rot += p.rotV; p.opacity -= 0.007;
      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive) raf = requestAnimationFrame(draw);
    else { cancelAnimationFrame(raf); document.body.removeChild(canvas); }
  };
  raf = requestAnimationFrame(draw);
}
