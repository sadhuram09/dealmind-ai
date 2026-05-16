import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, DollarSign, Zap, Clock, TrendingDown, RefreshCw, Activity, Target, Brain } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getAuditTrail, getProspects } from '../api';
import NumberTicker from '../components/ui/NumberTicker';
import ScrollReveal from '../components/ui/ScrollReveal';
import { FloatingOrbs } from '../components/ui/Effects';

// ─── Tooltip ──────────────────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontFamily: 'var(--mono)', marginBottom: 2 }}>
          {p.name}: {typeof p.value === 'number' && p.value < 0.1 ? `$${p.value.toFixed(6)}` : `${p.value}${p.name?.includes('ms') || p.name?.includes('Latency') ? 'ms' : ''}`}
        </div>
      ))}
    </div>
  );
};

// ─── Animated KPI Card ────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, color, loading, prefix = '', suffix = '', decimals = 0, delay = 0 }) {
  return (
    <ScrollReveal delay={delay}>
      <motion.div
        className="stat-card"
        whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}25` }}
        style={{ borderTop: `2px solid ${color}`, position: 'relative', overflow: 'hidden' }}
      >
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${color}10`, filter: 'blur(20px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} style={{ color }} />
          </div>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 36, width: '55%', marginBottom: 8 }} />
        ) : (
          <div style={{ fontSize: 30, fontWeight: 900, color, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: 6 }}>
            {prefix}<NumberTicker value={typeof value === 'number' ? value : 0} decimals={decimals} />{suffix}
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
      </motion.div>
    </ScrollReveal>
  );
}

// ─── Model Distribution Pie ───────────────────────────────────────────
function ModelPie({ entries }) {
  const counts = {};
  entries.forEach(e => { counts[e.model] = (counts[e.model] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  if (!data.length) return null;
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Brain size={15} style={{ color: 'var(--purple)' }} /> Model Distribution
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
          </Pie>
          <Tooltip content={<Tip />} />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────
export default function CostDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prospects, setProspects] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState('cost');

  const load = () => {
    setLoading(true);
    Promise.all([getAuditTrail(), getProspects()])
      .then(([auditRes, prosRes]) => {
        setData(auditRes.data);
        setProspects(prosRes.data.prospects || []);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setLastRefresh(new Date()); });
  };

  useEffect(() => { load(); }, []);

  const summary = data?.summary || {};
  const entries = data?.entries || [];

  const chartData = entries.map((e, i) => ({
    name: `#${i + 1}`,
    cost: e.cost_usd,
    latency: e.latency_ms,
    tokens: e.total_tokens,
    time: e.timestamp ? e.timestamp.slice(11, 19) : `Q${i + 1}`,
    model: e.model,
  }));

  const savedPct = summary.savings_percent || 0;
  const totalQueries = summary.total_queries || 0;
  const savedUSD = summary.cost_saved_usd || 0;
  const avgLatency = summary.avg_latency_ms || 0;
  const totalCost = summary.total_cost_usd || 0;

  // Objection heatmap data
  const objCounts = {};
  prospects.forEach(p => (p.all_objections || []).forEach(o => { objCounts[o] = (objCounts[o] || 0) + 1; }));
  const objData = Object.entries(objCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const TABS = ['cost', 'latency', 'tokens'];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px', position: 'relative' }}>
      <FloatingOrbs />

      {/* Header */}
      <ScrollReveal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--purple), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={20} color="#fff" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900 }}>Cost Intelligence Dashboard</h1>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Real-time CascadeFlow routing economics · <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>Live from backend</span>
            </p>
          </div>
          <motion.button className="btn-ghost" onClick={load} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </motion.button>
        </div>
      </ScrollReveal>

      {/* HERO SAVINGS BANNER */}
      <ScrollReveal direction="scale">
        <div style={{ background: 'linear-gradient(135deg, #8B5CF615, #3B82F610, #10B98108)', border: '1px solid #8B5CF630', borderRadius: 20, padding: '36px 40px', textAlign: 'center', marginBottom: 28, position: 'relative', overflow: 'hidden', zIndex: 1 }}>
          <motion.div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, #8B5CF620 0%, transparent 65%)', pointerEvents: 'none' }}
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity }} />

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>CascadeFlow Smart Routing</div>
          <motion.div
            style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 12 }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {loading ? '—' : <><NumberTicker value={savedPct} decimals={1} />% Cheaper</>}
          </motion.div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            than GPT-4 standard baseline · <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>llama-3.3-70b via Groq</span>
          </div>

          {/* Mini stat row inside banner */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Queries Logged', val: totalQueries, color: 'var(--purple)' },
              { label: 'USD Saved', val: `$${savedUSD.toFixed(4)}`, color: 'var(--green)' },
              { label: 'Avg Latency', val: `${avgLatency}ms`, color: 'var(--blue)' },
              { label: 'Total Cost', val: `$${totalCost.toFixed(6)}`, color: 'var(--amber)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: 'var(--mono)' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <KPICard icon={Activity} label="Total Queries" value={totalQueries} sub="LLM invocations logged" color="var(--purple)" loading={loading} delay={0} />
        <KPICard icon={DollarSign} label="Budget Saved" value={savedUSD} prefix="$" decimals={4} sub="vs GPT-4 baseline" color="var(--green)" loading={loading} delay={0.08} />
        <KPICard icon={Clock} label="Avg Latency" value={avgLatency} suffix="ms" sub="Mean inference time" color="var(--blue)" loading={loading} delay={0.16} />
        <KPICard icon={TrendingDown} label="Actual Spend" value={totalCost} prefix="$" decimals={6} sub="Total USD on LLM" color="var(--amber)" loading={loading} delay={0.24} />
      </div>

      {/* Charts Section with Tabs */}
      {chartData.length > 0 ? (
        <ScrollReveal>
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            {/* Tab Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} style={{ color: 'var(--purple)' }} /> Inference Analytics
              </div>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3 }}>
                {TABS.map(tab => (
                  <motion.button key={tab} onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'none',
                      background: activeTab === tab ? 'var(--purple)' : 'transparent',
                      color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                      textTransform: 'capitalize',
                    }}
                    whileTap={{ scale: 0.96 }}
                  >{tab}</motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <ResponsiveContainer width="100%" height={260}>
                  {activeTab === 'cost' ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => `$${v.toFixed(5)}`} />
                      <Tooltip content={<Tip />} />
                      <Area type="monotone" dataKey="cost" name="Cost USD" stroke="#10B981" fill="url(#gCost)" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981', stroke: 'var(--bg-surface)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  ) : activeTab === 'latency' ? (
                    <BarChart data={chartData}>
                      <defs>
                        <linearGradient id="gLat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => `${v}ms`} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="latency" name="Latency" fill="url(#gLat)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Tooltip content={<Tip />} />
                      <Line type="monotone" dataKey="tokens" name="Tokens" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B', stroke: 'var(--bg-surface)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>
      ) : !loading && (
        <div className="card" style={{ padding: 48, textAlign: 'center', marginBottom: 24 }}>
          <BarChart3 size={48} style={{ margin: '0 auto 16px', opacity: 0.15 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>No audit data yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generate call prep or draft a follow-up email to populate analytics.</div>
        </div>
      )}

      {/* Model Pie + Objection Heatmap row */}
      <div style={{ display: 'grid', gridTemplateColumns: chartData.length > 0 ? '1fr 2fr' : '1fr', gap: 20, marginBottom: 24 }}>
        {chartData.length > 0 && <ScrollReveal delay={0.05}><ModelPie entries={entries} /></ScrollReveal>}

        {objData.length > 0 && (
          <ScrollReveal delay={0.1}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={15} style={{ color: 'var(--red)' }} /> Objection Intelligence
                <span className="badge badge-red" style={{ marginLeft: 6 }}>{objData.length} types</span>
              </div>
              <ResponsiveContainer width="100%" height={objData.length * 40 + 20}>
                <BarChart data={objData} layout="vertical" margin={{ left: 10, right: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" name="Times Raised" radius={[0, 6, 6, 0]}>
                    {objData.map((_, i) => {
                      const colors = ['#EF4444','#F97316','#F59E0B','#84CC16','#10B981','#3B82F6','#8B5CF6','#EC4899'];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* Audit Table */}
      {entries.length > 0 && (
        <ScrollReveal>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={15} style={{ color: 'var(--purple)' }} /> Full Audit Trail
              <span className="badge badge-purple" style={{ marginLeft: 6 }}>{entries.length} entries</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Time', 'Model', 'Tokens', 'Latency', 'Cost', 'Savings vs GPT-4'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => {
                    const gpt4Cost = (e.total_tokens || 0) * 0.00003;
                    const saved = gpt4Cost - (e.cost_usd || 0);
                    return (
                      <motion.tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        whileHover={{ background: 'var(--bg-elevated)' }}
                      >
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>#{i + 1}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)', fontSize: 11 }}>{e.timestamp?.slice(11, 19) || '—'}</td>
                        <td style={{ padding: '10px 12px' }}><span className="badge badge-blue">{e.model}</span></td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>{e.total_tokens}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', color: 'var(--blue)' }}>{e.latency_ms}ms</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', color: 'var(--green)' }}>${e.cost_usd?.toFixed(6)}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', color: 'var(--purple)' }}>+${saved.toFixed(6)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      )}

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        Last refreshed: {lastRefresh.toLocaleTimeString()} · dealmind-ai-cdkj.onrender.com
      </div>
    </div>
  );
}
