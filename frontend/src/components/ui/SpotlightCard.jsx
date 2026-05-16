import { useRef, useState } from 'react';

export default function SpotlightCard({ children, className, style }) {
  const ref = useRef();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setVisible(true);
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      onMouseMove={handleMove}
      onMouseLeave={() => setVisible(false)}
    >
      {visible && (
        <div
          style={{
            position: 'absolute',
            left: pos.x - 150,
            top: pos.y - 150,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'opacity 0.1s',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
