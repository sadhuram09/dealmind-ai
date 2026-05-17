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
            left: pos.x - 180,
            top: pos.y - 180,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'opacity 0.15s',
            filter: 'blur(2px)',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
