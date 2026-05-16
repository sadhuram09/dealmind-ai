import { useState, useEffect } from 'react';
import { Phone, CheckCircle, Plus, X, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProspects, logCall } from '../api';
import { triggerConfetti } from '../components/ui/Confetti';
import { addNotification } from '../components/ui/NotificationBell';

const OUTCOMES = ['Meeting Scheduled', 'Follow-up Required', 'Closed Won', 'Blocked', 'No Answer', 'Negotiating'];

const DEMO_DATA = {
  prospect_id: 'demo-acme',
  prospect_name: 'Sarah Johnson',
  company: 'Acme Enterprises',
  deal_size: '$120,000 ARR',
  call_number: 3,
  notes: "Sarah mentioned they are evaluating 3 vendors. Budget is approved for Q2. Main concern is implementation timeline — she needs it live before June 15th. She loved our AI memory feature and said 'this is exactly what we've been missing'. Decision maker is also her VP of Sales, Mark. Competitor mentioned: HubSpot.",
  objections: ['Implementation timeline', 'Data migration complexity'],
  outcome: 'Meeting Scheduled',
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4200); return () => clearTimeout(t); }, [onClose]);
  const isSuccess = type !== 'error';
  return (
    <motion.div
      className="toast"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      style={{ borderColor: isSuccess ? 'var(--green)' : 'var(--red)', color: isSuccess ? 'var(--green)' : 'var(--red)' }}
    >
      <CheckCircle size={18} />
      {msg}
    </motion.div>
  );
}

export default function CallLogger() {
  const [prospects, setProspects] = useState([]);
  const [form, setForm] = useState({ prospect_id: '', prospect_name: '', company: '', deal_size: '', call_number: 1, notes: '', objections: [], outcome: '' });
  const [objInput, setObjInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).get('demo') === 'true';
    if (demo) { setForm(DEMO_DATA); setIsDemo(true); }
    getProspects().then(r => setProspects(r.data.prospects || [])).catch(() => {});
  }, []);

  const handleProspectChange = (e) => {
    const pid = e.target.value;
    const p = prospects.find(x => x.prospect_id === pid);
    if (p) setForm(f => ({ ...f, prospect_id: pid, prospect_name: p.prospect_name, company: p.company, deal_size: p.deal_size, call_number: (p.total_calls || 0) + 1 }));
    else setForm(f => ({ ...f, prospect_id: '', prospect_name: '', company: '', deal_size: '', call_number: 1 }));
  };

  const addObjection = () => {
    if (objInput.trim() && !form.objections.includes(objInput.trim())) {
      setForm(f => ({ ...f, objections: [...f.objections, objInput.trim()] }));
      setObjInput('');
    }
  };

  const validate = () => {
    const e = {};
    if (!form.prospect_name.trim()) e.prospect_name = 'Required';
    if (!form.company.trim()) e.company = 'Required';
    if (!form.notes.trim()) e.notes = 'Required';
    if (!form.outcome) e.outcome = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await logCall({
        prospect_id: form.prospect_id || form.prospect_name.toLowerCase().replace(/\s+/g, '-'),
        prospect_name: form.prospect_name, company: form.company,
        deal_size: form.deal_size || 'Unknown', call_number: Number(form.call_number),
        notes: form.notes, objections: form.objections, outcome: form.outcome,
      });
      setToast({ msg: 'Memory securely written to Hindsight semantic store ✓', type: 'success' });
      addNotification(`Call logged for ${form.prospect_name} — ${form.outcome}`, 'call');
      if (form.outcome === 'Closed Won') triggerConfetti();
      setForm({ prospect_id: '', prospect_name: '', company: '', deal_size: '', call_number: 1, notes: '', objections: [], outcome: '' });
      setErrors({});
    } catch {
      setToast({ msg: 'Error writing memory — check backend connection', type: 'error' });
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '36px 24px' }}>
      <AnimatePresence>{toast && <Toast key="toast" msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

      {/* Demo Mode Banner */}
      {isDemo && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <Sparkles size={15} style={{ color: 'var(--amber)' }} />
          <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Demo Mode</span>
          <span style={{ color: 'var(--text-secondary)' }}>— Form pre-filled with a realistic prospect. Hit submit to see the full flow.</span>
        </motion.div>
      )}

      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--purple), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Phone size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Call Logger</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Write call memory to Hindsight semantic store</p>
        </div>
        {!isDemo && (
          <button className="btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={() => { setForm(DEMO_DATA); setIsDemo(true); }}>
            <Sparkles size={13}/> Load Demo
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Existing Prospect (optional)</label>
            <div style={{ position: 'relative' }}>
              <select id="prospect-select" className="select" value={form.prospect_id} onChange={handleProspectChange}>
                <option value="">— Select existing or fill manually —</option>
                {prospects.map(p => <option key={p.prospect_id} value={p.prospect_id}>{p.prospect_name} · {p.company}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="label">Prospect Name *</label>
              <input id="prospect-name" className="input" placeholder="Jane Smith" value={form.prospect_name} onChange={e => setForm(f => ({ ...f, prospect_name: e.target.value }))} />
              {errors.prospect_name && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.prospect_name}</div>}
            </div>
            <div>
              <label className="label">Company *</label>
              <input id="company" className="input" placeholder="Acme Corp" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              {errors.company && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.company}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="label">Deal Size</label>
              <input id="deal-size" className="input" placeholder="$50,000 ARR" value={form.deal_size} onChange={e => setForm(f => ({ ...f, deal_size: e.target.value }))} />
            </div>
            <div>
              <label className="label">Call Number</label>
              <input id="call-number" className="input" type="number" min={1} value={form.call_number} onChange={e => setForm(f => ({ ...f, call_number: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Call Notes *</label>
            <textarea id="call-notes" className="textarea" style={{ minHeight: 130 }} placeholder="Detail the conversation, verbal commitments, or changed requirements..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            {errors.notes && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.notes}</div>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Objections</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input id="objection-input" className="input" placeholder="e.g. pricing, integration, timeline..." value={objInput} onChange={e => setObjInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addObjection())} />
              <button type="button" className="btn-ghost" onClick={addObjection} style={{ flexShrink: 0 }}><Plus size={14}/> Add</button>
            </div>
            {form.objections.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.objections.map(o => (
                  <span key={o} className="badge badge-red" style={{ cursor: 'pointer', paddingRight: 6 }} onClick={() => setForm(f => ({ ...f, objections: f.objections.filter(x => x !== o) }))}>
                    {o} <X size={10} style={{ marginLeft: 2 }} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="label">Call Outcome *</label>
            <div style={{ position: 'relative' }}>
              <select id="outcome-select" className="select" value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}>
                <option value="">— Select outcome —</option>
                {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
            {errors.outcome && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.outcome}</div>}
            {form.outcome === 'Closed Won' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ marginTop: 10, padding: '8px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🎉 Closed Won selected — confetti will fire on submit!
              </motion.div>
            )}
          </div>

          <motion.button id="log-call-submit" type="submit" className="btn-primary" disabled={submitting} whileHover={{ scale: submitting ? 1 : 1.01 }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
            {submitting
              ? <><span className="spin" style={{ display:'inline-block', width:16, height:16, border:'2px solid #fff4', borderTopColor:'#fff', borderRadius:'50%' }}/> Writing to Hindsight...</>
              : <><Phone size={16}/> Log Call to Memory</>}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
