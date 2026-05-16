import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function RippleButton({ children, className, style, onClick, id, disabled, type = 'button' }) {
  const [ripples, setRipples] = useState([]);
  const ref = useRef();

  const handleClick = (e) => {
    if (disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { x, y, id }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      id={id}
      type={type}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
    >
      {children}
      {ripples.map(rp => (
        <motion.span
          key={rp.id}
          style={{
            position: 'absolute',
            left: rp.x - 5, top: rp.y - 5,
            width: 10, height: 10,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.35)',
            pointerEvents: 'none',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 25, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  );
}
