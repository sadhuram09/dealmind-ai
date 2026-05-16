import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Brain, Phone, Mail, X, CheckCircle } from 'lucide-react';

const KEY = 'dm-notifications';

export function addNotification(msg, type = 'success') {
  const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
  const next = [{ id: Date.now(), msg, type, time: new Date().toLocaleTimeString() }, ...existing].slice(0, 12);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('dm-notify'));
}

const ICONS = { success: CheckCircle, call: Phone, brain: Brain, mail: Mail };
const COLORS = { success: 'var(--green)', call: 'var(--blue)', brain: 'var(--purple)', mail: 'var(--amber)' };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem(KEY) || '[]'));
  const [unread, setUnread] = useState(0);
  const ref = useRef();

  const reload = () => {
    const n = JSON.parse(localStorage.getItem(KEY) || '[]');
    setNotes(n);
    setUnread(n.length);
  };

  useEffect(() => {
    window.addEventListener('dm-notify', reload);
    return () => window.removeEventListener('dm-notify', reload);
  }, []);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const clear = () => { localStorage.setItem(KEY, '[]'); setNotes([]); setUnread(0); };
  const markRead = () => setUnread(0);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        onClick={() => { setOpen(o => !o); markRead(); }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, width: 36, height: 36, display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'none',
          position: 'relative',
        }}
      >
        <Bell size={15} style={{ color: 'var(--text-secondary)' }} />
        {unread > 0 && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: -4, right: -4,
              background: 'var(--red)', borderRadius: '50%',
              width: 16, height: 16, fontSize: 9, fontWeight: 700,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {unread > 9 ? '9+' : unread}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', top: 44, right: 0, width: 320,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
              zIndex: 1000, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Activity Log</span>
              <button onClick={clear} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', fontSize: 11 }}>Clear all</button>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No activity yet</div>
              ) : notes.map((n) => {
                const Icon = ICONS[n.type] || CheckCircle;
                const color = COLORS[n.type] || 'var(--green)';
                return (
                  <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Icon size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.msg}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--mono)' }}>{n.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
