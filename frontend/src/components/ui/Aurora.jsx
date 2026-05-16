import { useEffect, useRef } from 'react';

export default function Aurora() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.004;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Create multiple aurora waves
      const waves = [
        { color: 'rgba(139,92,246,', y: 0.35, amp: 70, freq: 0.003, speed: 1 },
        { color: 'rgba(59,130,246,', y: 0.50, amp: 55, freq: 0.0025, speed: -0.7 },
        { color: 'rgba(16,185,129,', y: 0.45, amp: 45, freq: 0.004, speed: 0.5 },
        { color: 'rgba(139,92,246,', y: 0.60, amp: 40, freq: 0.0035, speed: -1.2 },
      ];

      waves.forEach(({ color, y, amp, freq, speed }) => {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, `${color}0)`);
        grad.addColorStop(0.3, `${color}0.08)`);
        grad.addColorStop(0.7, `${color}0.04)`);
        grad.addColorStop(1, `${color}0)`);

        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const yw = height * y + Math.sin(x * freq + t * speed) * amp + Math.cos(x * freq * 2 + t * speed * 0.5) * (amp * 0.4);
          ctx.lineTo(x, yw);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}
