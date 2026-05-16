import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({ children, className, style, onClick, id, disabled }) {
  const ref = useRef();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    if (disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    setOffset({ x: dx * 0.35, y: dy * 0.35 });
  };

  const handleLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      id={id}
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      whileTap={{ scale: 0.94 }}
    >
      {children}
    </motion.button>
  );
}
