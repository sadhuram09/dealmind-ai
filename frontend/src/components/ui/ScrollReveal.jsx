import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScrollReveal({ children, delay = 0, direction = 'up', className, style }) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
      scale: direction === 'scale' ? 0.92 : 1,
    },
    visible: { opacity: 1, y: 0, x: 0, scale: 1 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={visible ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
