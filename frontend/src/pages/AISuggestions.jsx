import { useState, useEffect } from 'react';
import { Lightbulb, ChevronDown, Phone, Mail, Copy, Check, Zap, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProspects, prepareForCall, draftFollowup } from '../api';
import { addNotification } from '../components/ui/NotificationBell';

function SkeletonLine({ w='100%', h=13, mb=8 }) {
  return <div className="skeleton" style={{ width: w, height: h, marginBottom: mb }} />;
}

function EmailModal({ email, onClose }) {
  const [copied, setCopied] = useState(false);
  const lines = email?.split('\n') || [];
  const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:')) || '';
  const body = lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim();

  const copy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 620, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
      >
        {/* Email client header */}
        <div style={{ background: 'var(--bg-surface)', padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--red)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--amber)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--green)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 8 }}>AI-Generated Follow-up Email</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Subject */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subject</span>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, color: 'var(--text-primary)' }}>
            {subjectLine.replace(/^subject:\s*/i, '') || 'AI-Drafted Follow-up'}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20, maxHeight: 380, overflowY: 'auto' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.9 }}>{body || email}</pre>
        </div>

        {/* Actions */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={copy} style={{ fontSize: 13 }}>
            {copied ? <><Check size={14}/> Copied!</> : <><Copy size={14}/> Copy Email</>}
          </button>
          <button className="btn-primary" onClick={onClose} style={{ fontSize: 13 }}>Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AISuggestions() {
  const [prospects, setProspects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [prep, setPrep] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [emailProspect, setEmailProspect] = useState('');
  const [emailContext, setEmailContext] = useState('');
  const [email, setEmail] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailModal, setEmailModal] = useState(false);

  useEffect(() => {
    getProspects().then(r => setProspects(r.data.prospects || [])).catch(() => {});
  }, []);

  const handlePrep = async () => {
    if (!selectedId) return;
    setPrepLoading(true); setPrep(null);
    try {
      const r = await prepareForCall(selectedId);
      setPrep(r.data);
      addNotification(`Call prep ready for ${prospects.find(p=>p.prospect_id===selectedId)?.prospect_name}`, 'brain');
    } catch { setPrep({ text: 'Failed to generate call prep. Check backend.' }); }
    finally { setPrepLoading(false); }
  };

  const handleEmail = async () => {
    if (!emailProspect) return;
    setEmailLoading(true); setEmail(null);
    try {
      const r = await draftFollowup({ prospect_id: emailProspect, call_summary: emailContext });
      setEmail(r.data.text || r.data.email);
      setEmailModal(true);
      addNotification(`Follow-up email drafted for ${prospects.find(p=>p.prospect_id===emailProspect)?.prospect_name}`, 'mail');
    } catch { setEmail('Failed to draft email. Check backend connection.'); }
    finally { setEmailLoading(false); }
  };

  const prepSections = prep?.text ? (() => {
    const text = prep.text;
    const sections = [];
    const lines = text.split('\n');
    let cur = null;
    lines.forEach(line => {
      if (line.match(/^#+\s/) || line.match(/^\d+\.\s+[A-Z]/) || line.match(/^[A-Z][^a-z]*:/)) {
        if (cur) sections.push(cur);
        cur = { title: line.replace(/^#+\s*/, '').replace(/:$/, ''), content: [] };
      } else if (cur && line.trim()) { cur.content.push(line); }
      else if (!cur && line.trim()) { sections.push({ title: '', content: [line] }); }
    });
    if (cur) sections.push(cur);
    return sections.length > 1 ? sections : null;
  })() : null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
      <AnimatePresence>{emailModal && email && <EmailModal email={email} onClose={() => setEmailModal(false)} />}</AnimatePresence>

      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--purple), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lightbulb size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>AI Suggestions</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Memory-powered call prep and email drafts</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Call Prep */}
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Phone size={15} style={{ color: 'var(--purple)' }} /> Call Intelligence
            </div>
            <label className="label">Select Prospect</label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <select className="select" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                <option value="">— Choose prospect —</option>
                {prospects.map(p => <option key={p.prospect_id} value={p.prospect_id}>{p.prospect_name} · {p.company}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
            <motion.button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePrep} disabled={!selectedId || prepLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              {prepLoading ? <><RefreshCw size={14} className="spin" /> Generating…</> : <><Zap size={14} /> Generate Call Prep</>}
            </motion.button>
          </div>

          <AnimatePresence>
            {prepLoading && (
              <motion.div className="card" style={{ padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--purple)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={12} className="spin" /> CascadeFlow routing query to Groq…
                </div>
                {Array(4).fill(0).map((_, i) => <SkeletonLine key={i} w={`${85-i*10}%`} h={12} mb={8} />)}
              </motion.div>
            )}
            {prep && !prepLoading && (
              <motion.div className="card card-glow" style={{ padding: 20, borderColor: '#8B5CF640' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {prepSections ? (
                  prepSections.map((s, i) => (
                    <div key={i} style={{ marginBottom: 18 }}>
                      {s.title && <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.title}</div>}
                      {s.content.map((line, j) => (
                        <div key={j} style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 4, paddingLeft: 8 }}>{line}</div>
                      ))}
                    </div>
                  ))
                ) : (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.8 }}>{prep.text}</pre>
                )}
                {prep.cost_usd !== undefined && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 11, fontFamily: 'var(--mono)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cost: <span style={{ color: 'var(--green)' }}>${prep.cost_usd}</span></span>
                    <span style={{ color: 'var(--text-muted)' }}>Latency: <span style={{ color: 'var(--blue)' }}>{prep.latency_ms}ms</span></span>
                    {prep.model && <span style={{ color: 'var(--text-muted)' }}>Model: <span style={{ color: 'var(--purple)' }}>{prep.model}</span></span>}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Email Draft */}
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Mail size={15} style={{ color: 'var(--blue)' }} /> Follow-up Email Drafter
            </div>
            <label className="label">Select Prospect</label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <select className="select" value={emailProspect} onChange={e => setEmailProspect(e.target.value)}>
                <option value="">— Choose prospect —</option>
                {prospects.map(p => <option key={p.prospect_id} value={p.prospect_id}>{p.prospect_name} · {p.company}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
            <label className="label">Additional Context (optional)</label>
            <textarea className="textarea" style={{ minHeight: 80, marginBottom: 14 }} placeholder="e.g. Mention the Q2 deadline, reference their HubSpot concern..." value={emailContext} onChange={e => setEmailContext(e.target.value)} />
            <motion.button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--blue), var(--purple))' }} onClick={handleEmail} disabled={!emailProspect || emailLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              {emailLoading ? <><RefreshCw size={14} className="spin" /> Drafting…</> : <><Mail size={14} /> Draft Email</>}
            </motion.button>
          </div>

          {email && !emailLoading && (
            <motion.div className="card" style={{ padding: 20, borderColor: 'rgba(59,130,246,0.3)' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>✉️ Email Ready</span>
                <button className="btn-primary" onClick={() => setEmailModal(true)} style={{ fontSize: 12, padding: '6px 14px', background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
                  <Mail size={12} /> View & Copy
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {email.slice(0, 160)}… <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => setEmailModal(true)}>read more</span>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
