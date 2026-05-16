import { useState, useEffect } from 'react';
import { Search, Building2, Phone, ChevronRight, Brain, Zap, Clock, MessageSquare, Target, Shield, RefreshCw, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProspects, recallProspect, prepareForCall, getDealRisk } from '../api';
import { addNotification } from '../components/ui/NotificationBell';

const COMPETITORS = ['Salesforce','HubSpot','Pipedrive','Zoho','Gong','Outreach','SalesLoft','Clari','Monday','Notion','Freshsales'];

function getRiskLevel(outcome) {
  if (!outcome) return 'medium';
  const o = outcome.toLowerCase();
  if (o.includes('won') || o.includes('scheduled')) return 'low';
  if (o.includes('blocked') || o.includes('lost')) return 'high';
  return 'medium';
}

function RiskGauge({ score }) {
  const r = 48, cx = 65, cy = 68;
  const color = score <= 3 ? '#10B981' : score <= 6 ? '#F59E0B' : '#EF4444';
  const label = score <= 3 ? 'Low Risk' : score <= 6 ? 'Medium Risk' : 'High Risk';
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="130" height="80" viewBox="0 0 130 80">
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="var(--border)" strokeWidth="9" strokeLinecap="round" />
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          pathLength="1" strokeDasharray="1" strokeDashoffset={1 - score/10}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }} />
        <text x={cx} y={cy-8} textAnchor="middle" fill={color} fontSize="22" fontWeight="900" fontFamily="JetBrains Mono,monospace">{score}</text>
        <text x={cx} y={cy+5} textAnchor="middle" fill="var(--text-muted)" fontSize="9">/10</text>
      </svg>
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: -4 }}>{label}</div>
    </div>
  );
}

function ProspectCard({ p, active, onClick }) {
  const risk = getRiskLevel(p.last_outcome);
  const ring = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };
  const badge = { low: 'badge-green', medium: 'badge-amber', high: 'badge-red' };
  return (
    <motion.div className={`prospect-item ${active ? 'active' : ''}`} onClick={onClick} layout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: ring[risk], flexShrink: 0, boxShadow: `0 0 0 3px ${ring[risk]}30, 0 0 10px ${ring[risk]}50` }} className="pulse-dot" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.prospect_name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={11}/>{p.company}</div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className={`badge ${badge[risk]}`}>{risk}</span>
        <span className="badge badge-blue" style={{ fontSize: 10 }}>{p.total_calls} calls</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{p.deal_size}</span>
      </div>
    </motion.div>
  );
}

function SkeletonLine({ w='100%', h=14, mb=8 }) {
  return <div className="skeleton" style={{ width: w, height: h, marginBottom: mb }} />;
}

function TimelineEntry({ entry, idx }) {
  const icons = [Brain, MessageSquare, Target, Shield, Clock, Users];
  const Icon = icons[idx % icons.length];
  const colors = ['var(--purple)','var(--blue)','var(--green)','var(--amber)','var(--text-secondary)','#EC4899'];
  const c = colors[idx % colors.length];
  return (
    <motion.div className="timeline-item" style={{ marginBottom: 20 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
      <div style={{ position: 'absolute', left: 0, top: 3, width: 20, height: 20, borderRadius: '50%', background: `${c}20`, border: `1px solid ${c}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={10} style={{ color: c }} />
      </div>
      <div className="card" style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontFamily: 'var(--mono)' }}>Memory chunk #{idx+1}</div>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7 }}>{entry}</p>
      </div>
    </motion.div>
  );
}

export default function DealRoom() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [memory, setMemory] = useState(null);
  const [memLoading, setMemLoading] = useState(false);
  const [prep, setPrep] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [risk, setRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getProspects().then(r => setProspects(r.data.prospects || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const selectProspect = (p) => {
    setSelected(p); setMemory(null); setPrep(null); setRisk(null);
    setMemLoading(true);
    recallProspect(p.prospect_id)
      .then(r => setMemory(r.data))
      .catch(() => setMemory({ memory: 'Could not load memory.', total_calls: 0 }))
      .finally(() => setMemLoading(false));
    setRiskLoading(true);
    getDealRisk(p.prospect_id)
      .then(r => setRisk(r.data))
      .catch(() => {})
      .finally(() => setRiskLoading(false));
  };

  const handlePrep = () => {
    if (!selected) return;
    setPrepLoading(true); setPrep(null);
    prepareForCall(selected.prospect_id)
      .then(r => { setPrep(r.data); addNotification(`Call prep generated for ${selected.prospect_name}`, 'brain'); })
      .catch(() => setPrep({ text: 'Failed to generate prep. Check backend connection.' }))
      .finally(() => setPrepLoading(false));
  };

  const filtered = prospects.filter(p =>
    p.prospect_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.company?.toLowerCase().includes(search.toLowerCase())
  );

  const memChunks = memory?.memory ? memory.memory.split('\n').filter(l => l.trim().length > 10) : [];
  const competitors = COMPETITORS.filter(c => memory?.memory?.toLowerCase().includes(c.toLowerCase()));

  return (
    <div className="deal-layout" style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      {/* Sidebar */}
      <aside className="deal-sidebar" style={{ width: '30%', minWidth: 260, maxWidth: 360, borderRight: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Prospect Pipeline</div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: 36, fontSize: 13 }} placeholder="Search prospects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="scroll-y" style={{ flex: 1, padding: '0 8px 16px' }}>
          {loading ? Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ padding: '14px 8px' }}>
              <SkeletonLine w="60%" h={13} mb={8}/><SkeletonLine w="40%" h={10} mb={6}/><SkeletonLine w="80%" h={10} mb={0}/>
            </div>
          )) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Brain size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontSize: 13 }}>{prospects.length === 0 ? 'No prospects yet. Log a call first.' : 'No results found.'}</div>
            </div>
          ) : filtered.map(p => (
            <ProspectCard key={p.prospect_id} p={p} active={selected?.prospect_id === p.prospect_id} onClick={() => selectProspect(p)} />
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>{prospects.length} prospects in memory</div>
      </aside>

      {/* Main */}
      <div className="deal-main scroll-y" style={{ flex: 1, padding: '28px 32px' }}>
        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #8B5CF620, #3B82F620)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Brain size={36} style={{ color: 'var(--purple)', opacity: 0.7 }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Select a Prospect</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 320, fontSize: 14, lineHeight: 1.7 }}>Pick a prospect from the left panel to view their memory timeline, risk score, and call prep.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selected.prospect_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{selected.prospect_name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
                    <Building2 size={14}/>{selected.company}
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span className="mono" style={{ color: 'var(--purple)', fontSize: 13 }}>{selected.deal_size}</span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span>{selected.total_calls} calls</span>
                  </div>
                </div>
                <motion.button className="btn-primary" onClick={handlePrep} disabled={prepLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ fontSize: 14, padding: '12px 22px' }}>
                  {prepLoading ? <RefreshCw size={15} className="spin" /> : <Zap size={15} />}
                  {prepLoading ? 'Generating...' : 'Prep for Call'}
                </motion.button>
              </div>

              {/* Risk + Competitor row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Risk Gauge Card */}
                <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Deal Risk Score</div>
                    {riskLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                        <RefreshCw size={12} className="spin" /> Analyzing…
                      </div>
                    ) : risk ? (
                      <RiskGauge score={risk.risk_score || 5} />
                    ) : <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</div>}
                  </div>
                  {risk && !riskLoading && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{risk.risk_reason}</div>
                      {risk.recommended_action && (
                        <div style={{ fontSize: 11, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 6, padding: '6px 10px', color: 'var(--purple)' }}>
                          → {risk.recommended_action}
                        </div>
                      )}
                      {risk.deal_stage && <span className="badge badge-blue" style={{ marginTop: 8, display: 'inline-flex' }}>{risk.deal_stage}</span>}
                    </div>
                  )}
                </div>

                {/* Competitor Intelligence */}
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={11}/> Competitor Intelligence
                  </div>
                  {memLoading ? (
                    <><SkeletonLine w="60%" h={11} mb={6}/><SkeletonLine w="40%" h={11} mb={0}/></>
                  ) : competitors.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {competitors.map(c => (
                        <span key={c} className="badge badge-red">{c}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TrendingUp size={14} style={{ color: 'var(--green)' }} /> No competitors mentioned
                    </div>
                  )}
                </div>
              </div>

              {/* Prep Output */}
              {prepLoading && (
                <div className="card" style={{ padding: 20, marginBottom: 24, borderColor: 'var(--purple)', boxShadow: '0 0 32px #8B5CF620' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--purple)' }}>
                    <RefreshCw size={17} className="spin" />
                    <span style={{ fontWeight: 600 }}>CascadeFlow routing to llama-3.3-70b…</span>
                  </div>
                  <div style={{ marginTop: 14 }}><SkeletonLine w="90%" h={12} mb={8}/><SkeletonLine w="75%" h={12} mb={8}/><SkeletonLine w="60%" h={12} mb={0}/></div>
                </div>
              )}
              {prep && (
                <motion.div className="card card-glow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 20, marginBottom: 24, borderColor: '#8B5CF640' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Zap size={14} style={{ color: 'var(--purple)' }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--purple)' }}>AI Call Intelligence</span>
                    {prep.model && <span className="mono badge badge-purple" style={{ fontSize: 10, marginLeft: 'auto' }}>{prep.model}</span>}
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8 }}>{prep.text}</pre>
                  {prep.cost_usd !== undefined && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 20, fontSize: 12 }}>
                      <span className="mono" style={{ color: 'var(--text-muted)' }}>Cost: <span style={{ color: 'var(--green)' }}>${prep.cost_usd}</span></span>
                      <span className="mono" style={{ color: 'var(--text-muted)' }}>Latency: <span style={{ color: 'var(--blue)' }}>{prep.latency_ms}ms</span></span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Memory Timeline */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <Brain size={15} style={{ color: 'var(--purple)' }}/> Hindsight Memory Timeline
                  <span className="badge badge-purple" style={{ marginLeft: 4 }}>{memory?.source || 'Hindsight'}</span>
                </div>
                {memLoading ? Array(3).fill(0).map((_, i) => (
                  <div key={i} style={{ paddingLeft: 32, marginBottom: 20 }}><SkeletonLine w="100%" h={60} mb={0}/></div>
                )) : memChunks.length > 0 ? (
                  memChunks.map((chunk, i) => <TimelineEntry key={i} entry={chunk} idx={i} />)
                ) : (
                  <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Clock size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <div style={{ fontSize: 13 }}>No memory yet. Log a call to build history.</div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
