import { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, var(--purple), var(--blue))',
        scaleX: scrollYProgress, transformOrigin: '0%',
        zIndex: 99999,
        boxShadow: '0 0 8px var(--purple)',
      }}
    />
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 9997,
        width: 42, height: 42, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--purple), var(--blue))',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '18px', boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
      whileHover={{ scale: 1.1, boxShadow: '0 6px 28px rgba(139,92,246,0.6)' }}
      whileTap={{ scale: 0.95 }}
    >
      ↑
    </motion.button>
  );
}

export function FloatingOrbs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {[
        { size: 400, x: '-10%', y: '10%', color: '#8B5CF6', delay: 0 },
        { size: 300, x: '60%', y: '50%', color: '#3B82F6', delay: 2 },
        { size: 250, x: '30%', y: '70%', color: '#10B981', delay: 4 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size, height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}18 0%, transparent 70%)`,
            left: orb.x, top: orb.y,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{
            duration: 12 + i * 3,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function GlowBorder({ children, style, className, color = 'var(--purple)' }) {
  return (
    <motion.div
      className={className}
      style={{
        position: 'relative',
        borderRadius: 12,
        ...style,
      }}
      whileHover={{
        boxShadow: `0 0 0 1px ${color}, 0 0 24px ${color}40`,
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function ShimmerBadge({ children, style }) {
  return (
    <motion.div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 14px',
        borderRadius: 99,
        border: '1px solid var(--border-glow)',
        background: 'var(--bg-elevated)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--purple)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.15) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </motion.div>
  );
}

export function PulseRing({ color = '#8B5CF6', size = 10 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <motion.span
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: color,
        }}
        animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
      />
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'block' }} />
    </span>
  );
}
