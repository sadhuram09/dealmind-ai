import { useEffect, useRef, useState } from 'react';

export default function NumberTicker({ value, duration = 1800, prefix = '', suffix = '', decimals = 0 }) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    const start = 0;
    const end = Number(value);

    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setCurrent(start + (end - start) * ease(progress));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}{current.toFixed(decimals)}{suffix}
    </span>
  );
}
