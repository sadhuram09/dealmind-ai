import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, TrendingDown, ArrowRight, CheckCircle, Phone, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Aurora from '../components/ui/Aurora';
import Particles from '../components/ui/Particles';
import TypeWriter from '../components/ui/TypeWriter';
import TextScramble from '../components/ui/TextScramble';
import ScrollReveal from '../components/ui/ScrollReveal';
import GradientText from '../components/ui/GradientText';
import NumberTicker from '../components/ui/NumberTicker';
import InfiniteMarquee from '../components/ui/InfiniteMarquee';
import MagneticButton from '../components/ui/MagneticButton';
import SpotlightCard from '../components/ui/SpotlightCard';
import { ShimmerBadge, FloatingOrbs, GlowBorder } from '../components/ui/Effects';
import BrainHologramEmbed from '../components/ui/BrainHologramEmbed';

const FEATURES = [
  { icon: Brain, title: 'Persistent Memory', desc: 'Hindsight stores every call, objection, and commitment forever. Your AI rep never forgets.', color: '#8B5CF6' },
  { icon: TrendingDown, title: '97% Cost Reduction', desc: 'CascadeFlow intelligently routes to llama-3.3-70b via Groq — pennies vs GPT-4 dollars.', color: '#10B981' },
  { icon: Shield, title: 'Deal Risk Scoring', desc: 'AI scores deal health 1-10 with specific, memory-referenced reasons and recommended actions.', color: '#F59E0B' },
  { icon: Phone, title: 'Smart Call Prep', desc: 'Walk into every call knowing the top 3 things to remember, objections to handle, and exact scripts.', color: '#3B82F6' },
  { icon: Zap, title: 'Auto Follow-Ups', desc: 'Personalized emails that reference specific past conversations — prospects feel remembered.', color: '#EF4444' },
  { icon: BarChart3, title: 'Cost Audit Trail', desc: 'Every inference logged with model, tokens, latency, and real USD cost. Total transparency.', color: '#6366F1' },
];

import { getProspects, getAuditTrail } from '../api';

export default function Landing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { value: 0, suffix: '%', label: 'Cheaper than GPT-4' },
    { value: 0, suffix: 'ms', label: 'Avg Inference Time' },
    { value: 100, suffix: '%', label: 'Memory Retention' },
    { value: 0, suffix: '', label: 'Deals Tracked' },
  ]);

  useEffect(() => {
    Promise.all([getProspects(), getAuditTrail()])
      .then(([prospectsRes, auditRes]) => {
        const pCount = prospectsRes.data.total || 0;
        const audit = auditRes.data.summary || {};
        
        setStats([
          { value: audit.savings_percent || 0, suffix: '%', label: 'Cheaper than GPT-4' },
          { value: audit.avg_latency_ms || 0, suffix: 'ms', label: 'Avg Inference Time' },
          { value: 100, suffix: '%', label: 'Memory Retention' },
          { value: pCount, suffix: '', label: 'Deals Tracked' },
        ]);
      })
      .catch(err => console.error("Failed to fetch landing stats", err));
  }, []);

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Aurora />
        <Particles count={50} color="#8B5CF6" />
        <FloatingOrbs />

        <div className="hero-grid-inner" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px', display: 'grid', gridTemplateColumns: 'clamp(280px, 50%, 560px) 1fr', gap: 40, alignItems: 'center' }}>

          {/* Left: Text */}
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={item} style={{ marginBottom: 24 }}>
              <ShimmerBadge>
                🏆 Hindsight × CascadeFlow Hackathon · Team India 🇮🇳
              </ShimmerBadge>
            </motion.div>

            <motion.h1 variants={item} style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 16, letterSpacing: '-0.03em' }}>
              <TextScramble text="Never Lose" style={{ display: 'block', color: 'var(--text-primary)' }} />
              <GradientText animate style={{ display: 'block', fontSize: 'inherit', fontWeight: 'inherit' }}>
                Another Deal
              </GradientText>
            </motion.h1>

            <motion.div variants={item} style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6, minHeight: 60 }}>
              <TypeWriter
                texts={[
                  'AI that remembers every word your prospect said.',
                  '97% cheaper than GPT-4 — powered by Groq.',
                  'Persistent memory. Zero deal slippage.',
                  'CascadeFlow routes to the best model, always.',
                ]}
                speed={55}
              />
            </motion.div>

            <motion.div variants={item} className="hero-cta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <MagneticButton
                className="btn-primary"
                onClick={() => navigate('/deals')}
                style={{ fontSize: 15, padding: '14px 28px' }}
              >
                <Brain size={18} /> Open Deal Room <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton
                className="btn-ghost"
                onClick={() => navigate('/log')}
                style={{ fontSize: 15, padding: '13px 24px' }}
              >
                <Phone size={16} /> Log a Call
              </MagneticButton>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={item} style={{ marginTop: 36, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['No GPT-4 required', 'Groq-powered', 'Hindsight memory'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  <CheckCircle size={14} style={{ color: 'var(--green)' }} /> {t}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Brain Hologram */}
          <motion.div className="hero-3d"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', height: 500 }}
          >
            {/* Outer ambient glow */}
            <motion.div
              style={{
                position: 'absolute', inset: -40,
                background: 'radial-gradient(ellipse at center, #8B5CF622 0%, #3B82F610 50%, transparent 75%)',
                borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Hologram embed */}
            <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
              <BrainHologramEmbed />
            </div>

            {/* Floating label */}
            <motion.div
              style={{
                position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-glow)',
                borderRadius: 99, padding: '7px 18px', fontSize: 12, fontWeight: 600,
                color: 'var(--purple)', backdropFilter: 'blur(12px)', whiteSpace: 'nowrap',
                boxShadow: '0 0 20px rgba(139,92,246,0.25)', zIndex: 2,
              }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              🧠 AI Brain Hologram · Powered by Hindsight
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</div>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, var(--purple), transparent)' }} />
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.1}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'var(--purple)', lineHeight: 1, marginBottom: 8 }}>
                <NumberTicker value={s.value} suffix={s.suffix} duration={1800} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <section style={{ padding: '28px 0', overflow: 'hidden' }}>
        <InfiniteMarquee speed={25} />
        <div style={{ marginTop: 16 }}>
          <InfiniteMarquee speed={35} reverse />
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <ShimmerBadge style={{ marginBottom: 16 }}>Platform Features</ShimmerBadge>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Built for <GradientText>Serious Sellers</GradientText>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
              Every feature is powered by persistent AI memory — your reps walk in knowing exactly what to say.
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.08} direction="up">
              <GlowBorder style={{ height: '100%' }}>
                <SpotlightCard
                  className="card"
                  style={{ padding: 24, height: '100%', borderRadius: 12, transition: 'transform 0.2s' }}
                >
                  <motion.div whileHover={{ scale: 1.015 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: `${f.color}20`, border: `1px solid ${f.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                    }}>
                      <f.icon size={20} style={{ color: f.color }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</div>
                  </motion.div>
                </SpotlightCard>
              </GlowBorder>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <FloatingOrbs />
        <ScrollReveal direction="scale">
          <div style={{
            maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 24, padding: '56px 40px',
            boxShadow: '0 0 80px rgba(139,92,246,0.1)',
          }}>
            <ShimmerBadge style={{ marginBottom: 20 }}>Ready to Close More Deals?</ShimmerBadge>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>
              Start with <GradientText>DealMind AI</GradientText>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15, lineHeight: 1.7 }}>
              Log your first call in 60 seconds. Your AI companion starts building prospect memory immediately.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <MagneticButton className="btn-primary" onClick={() => navigate('/deals')} style={{ fontSize: 15, padding: '14px 28px' }}>
                <Brain size={17} /> Open Deal Room
              </MagneticButton>
              <MagneticButton className="btn-ghost" onClick={() => navigate('/log')} style={{ fontSize: 15, padding: '13px 24px' }}>
                Log First Call →
              </MagneticButton>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Brain size={16} style={{ color: 'var(--purple)' }} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>DealMind AI</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>— Built for the Hindsight × CascadeFlow Hackathon</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Team India 🇮🇳 · Sadhuram · Aman · Satyam · Sattvik
        </div>
      </footer>
    </div>
  );
}
