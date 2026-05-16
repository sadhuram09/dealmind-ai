import { useEffect, useRef, useState } from 'react';

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export default function TextScramble({ text, className, style, trigger = true, speed = 35 }) {
  const [display, setDisplay] = useState(text);
  const ref = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    let raf;
    const length = text.length;

    const animate = () => {
      frame++;
      const progress = frame / (length * 1.5);
      const chars = text.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (i < frame / 1.5) return char;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      });
      setDisplay(chars.join(''));
      if (progress < 1) raf = setTimeout(animate, speed);
      else setDisplay(text);
    };

    raf = setTimeout(animate, 50);
    return () => clearTimeout(raf);
  }, [text, trigger, speed]);

  return <span ref={ref} className={className} style={style}>{display}</span>;
}
