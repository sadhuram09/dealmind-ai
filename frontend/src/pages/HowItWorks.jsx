import { motion } from 'framer-motion';
import { Brain, Zap, Database, Server, ArrowRight, GitBranch, Shield } from 'lucide-react';
import ScrollReveal from '../components/ui/ScrollReveal';
import GradientText from '../components/ui/GradientText';
import { ShimmerBadge, FloatingOrbs } from '../components/ui/Effects';

const NODES = [
  { id: 'rep', icon: Brain, label: 'Sales Rep', sub: 'React Dashboard', color: '#8B5CF6', x: 0 },
  { id: 'api', icon: Server, label: 'FastAPI', sub: 'Python Backend', color: '#3B82F6', x: 1 },
  { id: 'cascade', icon: GitBranch, label: 'CascadeFlow', sub: 'Smart Routing', color: '#F59E0B', x: 2 },
  { id: 'groq', icon: Zap, label: 'Groq LLM', sub: 'llama-3.3-70b', color: '#10B981', x: 3 },
  { id: 'hindsight', icon: Database, label: 'Hindsight', sub: 'Semantic Memory', color: '#EC4899', x: 3 },
  { id: 'response', icon: Shield, label: 'AI Response', sub: 'To Sales Rep', color: '#8B5CF6', x: 4 },
];

const STEPS = [
  { num: '01', title: 'Rep Logs a Call', desc: 'Sales rep enters call notes, objections, and outcome through the React dashboard.' },
  { num: '02', title: 'Memory Written', desc: 'FastAPI pushes structured memory chunks into Hindsight\'s semantic vector store — persisted forever.' },
  { num: '03', title: 'CascadeFlow Routes', desc: 'On next query, CascadeFlow picks the cheapest model capable of handling the task — 97% savings vs GPT-4.' },
  { num: '04', title: 'LLM + Memory = Intelligence', desc: 'Groq\'s llama-3.3-70b receives the query enriched with retrieved Hindsight memory for hyper-personalized output.' },
  { num: '05', title: 'Rep Gets Guidance', desc: 'Precise call prep, objection scripts, and follow-up emails referencing real past conversations.' },
];

function FlowNode({ node, delay }) {
  return (
    <ScrollReveal delay={delay} direction="up">
      <motion.div
        whileHover={{ y: -4, boxShadow: `0 8px 32px ${node.color}30` }}
        style={{
          background: 'var(--bg-elevated)', border: `1px solid ${node.color}40`,
          borderRadius: 14, padding: '20px 16px', textAlign: 'center',
          width: 140, transition: 'box-shadow 0.2s',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${node.color}20`, border: `1px solid ${node.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <node.icon size={20} style={{ color: node.color }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{node.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{node.sub}</div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function HowItWorks() {
  const mainNodes = NODES.filter(n => !['hindsight', 'response'].includes(n.id));
  const branches = NODES.filter(n => ['groq', 'hindsight'].includes(n.id));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <FloatingOrbs />

      {/* Header */}
      <ScrollReveal>
        <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}>
          <ShimmerBadge style={{ marginBottom: 16 }}>System Architecture</ShimmerBadge>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
            How <GradientText>DealMind AI</GradientText> Works
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: 15, lineHeight: 1.7 }}>
            A persistent-memory sales agent that combines Hindsight's semantic memory with CascadeFlow's cost-intelligent routing.
          </p>
        </div>
      </ScrollReveal>

      {/* Flow Diagram */}
      <ScrollReveal direction="scale">
        <div className="card" style={{ padding: '36px 24px', marginBottom: 48, position: 'relative', overflow: 'hidden', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap', rowGap: 20 }}>
            {[NODES[0], NODES[1], NODES[2]].map((node, i) => (
              <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <FlowNode node={node} delay={i * 0.1} />
                {i < 2 && (
                  <motion.div
                    style={{ display: 'flex', alignItems: 'center', padding: '0 8px', color: 'var(--text-muted)' }}
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                )}
              </div>
            ))}

            {/* Branch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 8px' }}>
              {[NODES[3], NODES[4]].map((node, i) => (
                <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}>
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </motion.div>
                  <FlowNode node={node} delay={0.3 + i * 0.1} />
                </div>
              ))}
            </div>

            {/* Merge → Response */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}>
                <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
              </motion.div>
              <FlowNode node={NODES[5]} delay={0.5} />
            </div>
          </div>

          {/* Cost savings callout */}
          <div style={{ textAlign: 'center', marginTop: 24, padding: '12px 20px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
            <span style={{ fontSize: 13, color: 'var(--green)' }}>
              ⚡ CascadeFlow reduces inference cost by <strong>97%</strong> vs GPT-4 by routing to llama-3.3-70b via Groq
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Step by Step */}
      <div style={{ marginBottom: 48 }}>
        <ScrollReveal>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>Step-by-Step Flow</h2>
        </ScrollReveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.08}>
              <div style={{ display: 'flex', gap: 20, paddingBottom: i < STEPS.length - 1 ? 0 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--purple), var(--blue))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#fff', fontFamily: 'var(--mono)',
                  }}>{step.num}</div>
                  {i < STEPS.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 32, background: 'var(--border)', margin: '4px 0' }} />}
                </div>
                <div style={{ paddingBottom: 28, paddingTop: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Tech stack grid */}
      <ScrollReveal>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, textAlign: 'center' }}>Tech Stack</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Frontend', value: 'React 18 + Vite', color: 'var(--blue)' },
              { label: 'Backend', value: 'FastAPI (Python)', color: 'var(--green)' },
              { label: 'LLM', value: 'Groq llama-3.3-70b', color: 'var(--purple)' },
              { label: 'Memory', value: 'Hindsight Cloud', color: '#EC4899' },
              { label: 'Routing', value: 'CascadeFlow', color: 'var(--amber)' },
              { label: 'Hosting', value: 'Render.com', color: 'var(--blue)' },
            ].map(t => (
              <div key={t.label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.color, fontFamily: 'var(--mono)' }}>{t.value}</div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
