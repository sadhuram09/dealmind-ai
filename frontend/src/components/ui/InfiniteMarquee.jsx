import { motion } from 'framer-motion';

const ITEMS = [
  '⚡ Groq LLaMA-3.3-70B', '🧠 Hindsight Memory', '🔀 CascadeFlow Routing',
  '🛡️ FastAPI Backend', '⚛️ React 18', '📊 Recharts', '🔮 Three.js 3D',
  '🤖 AI Sales Intel', '💰 97% Cost Savings', '🚀 Sub-second Latency',
  '🌐 Render Cloud', '📝 Semantic Memory', '🎯 Deal Intelligence', '✉️ AI Emails',
];

export default function InfiniteMarquee({ speed = 30, reverse = false }) {
  const items = [...ITEMS, ...ITEMS];

  return (
    <div style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
      {/* Fade edges */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: 'linear-gradient(to right, var(--bg-base), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: 'linear-gradient(to left, var(--bg-base), transparent)',
        pointerEvents: 'none',
      }} />

      <motion.div
        style={{ display: 'flex', gap: '32px', width: 'max-content' }}
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              padding: '7px 18px',
              borderRadius: 99,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
