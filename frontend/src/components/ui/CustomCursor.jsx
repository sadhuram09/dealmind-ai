import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const rafRef = useRef();
  const trailRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    const checkHover = (e) => {
      const el = e.target;
      const isInteractive = el.closest('button, a, [role="button"], input, select, textarea, .cursor-pointer, .prospect-item, .nav-tab');
      setHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousemove', checkHover);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    const animate = () => {
      trailRef.current.x += (targetRef.current.x - trailRef.current.x) * 0.12;
      trailRef.current.y += (targetRef.current.y - trailRef.current.y) * 0.12;
      setTrail({ x: trailRef.current.x, y: trailRef.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousemove', checkHover);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Trail dot (lags behind) */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 99998,
          pointerEvents: 'none', mixBlendMode: 'difference',
          x: trail.x - 20, y: trail.y - 20,
        }}
        animate={{ scale: hovering ? 2.2 : clicking ? 0.7 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '1.5px solid var(--cursor-color, #8B5CF6)',
          opacity: 0.6,
        }} />
      </motion.div>

      {/* Sharp cursor dot */}
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99999,
        pointerEvents: 'none',
        transform: `translate(${pos.x - 4}px, ${pos.y - 4}px)`,
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--cursor-color, #8B5CF6)',
        boxShadow: '0 0 10px var(--cursor-color, #8B5CF6)',
        transition: 'width 0.1s, height 0.1s',
      }} />

      {/* Click ripple */}
      {clicking && (
        <motion.div
          style={{
            position: 'fixed', top: pos.y - 25, left: pos.x - 25,
            width: 50, height: 50, borderRadius: '50%',
            border: '2px solid var(--purple)',
            zIndex: 99997, pointerEvents: 'none',
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </>
  );
}
