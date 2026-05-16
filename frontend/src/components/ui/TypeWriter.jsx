import { useEffect, useState } from 'react';

export default function TypeWriter({ texts, speed = 70, pause = 2200, className, style }) {
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const current = texts[idx % texts.length];
    let timeout;

    if (!deleting && char <= current.length) {
      setDisplay(current.slice(0, char));
      timeout = setTimeout(() => setChar(c => c + 1), speed);
    } else if (!deleting && char > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && char >= 0) {
      setDisplay(current.slice(0, char));
      timeout = setTimeout(() => setChar(c => c - 1), speed / 2);
    } else if (deleting && char < 0) {
      setDeleting(false);
      setIdx(i => i + 1);
      setChar(0);
    }

    return () => clearTimeout(timeout);
  }, [char, deleting, idx, texts, speed, pause]);

  return (
    <span className={className} style={style}>
      {display}
      <span style={{
        display: 'inline-block',
        width: 2,
        height: '1em',
        background: 'var(--purple)',
        marginLeft: 2,
        verticalAlign: 'text-bottom',
        animation: 'blink 1s step-end infinite',
      }} />
    </span>
  );
}
