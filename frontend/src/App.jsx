import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Brain, Phone, Lightbulb, BarChart3, Zap, Home, Network, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import CustomCursor from './components/ui/CustomCursor';
import ThemeToggle from './components/ui/ThemeToggle';
import NotificationBell from './components/ui/NotificationBell';
import { ScrollProgress, BackToTop, PulseRing } from './components/ui/Effects';
import Landing from './pages/Landing';
import DealRoom from './pages/DealRoom';
import CallLogger from './pages/CallLogger';
import AISuggestions from './pages/AISuggestions';
import CostDashboard from './pages/CostDashboard';
import HowItWorks from './pages/HowItWorks';
import './index.css';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/deals', label: 'Deal Room', icon: Brain },
  { to: '/log', label: 'Call Logger', icon: Phone },
  { to: '/suggestions', label: 'AI Suggestions', icon: Lightbulb },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/how-it-works', label: 'How It Works', icon: Network },
];

function PageWrapper({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function NavShell({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <motion.header
        style={{
          background: scrolled || !isLanding ? 'var(--nav-bg)' : 'transparent',
          borderBottom: scrolled || !isLanding ? '1px solid var(--border)' : '1px solid transparent',
          padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          height: 60,
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: scrolled || !isLanding ? 'blur(16px)' : 'none',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <motion.div whileHover={{ scale: 1.08, rotate: 5 }} style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--purple), var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(139,92,246,0.45)',
          }}>
            <Brain size={16} color="#fff" />
          </motion.div>
          <div style={{ display: 'none', flexDirection: 'column' }} className="logo-text">
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--text-primary)' }}>DealMind</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--purple)', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1.2 }}>AI · v2.0</div>
          </div>
        </NavLink>

        {/* Desktop nav — horizontal scroll on mid-size screens */}
        <nav className="nav-scroll desktop-nav" style={{ flex: 1, display: 'flex', gap: 2 }}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
              <Icon size={13} /> <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexShrink: 0 }}>
          <div className="live-badge" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
            <PulseRing color="var(--green)" size={7} />
            <span className="mono" style={{ fontSize: 10 }}>LIVE</span>
          </div>
          <div className="model-badge" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--purple)' }}>
            <Zap size={11} />
            <span className="mono" style={{ fontSize: 10 }}>llama-3.3</span>
          </div>
          <span className="clock mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{time.toLocaleTimeString()}</span>
          <NotificationBell />
          <ThemeToggle />

          {/* Hamburger — mobile only */}
          <motion.button
            className="hamburger"
            onClick={() => setMenuOpen(o => !o)}
            whileTap={{ scale: 0.9 }}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, width: 34, height: 34, display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            {menuOpen ? <X size={16} style={{ color: 'var(--text-primary)' }} /> : <Menu size={16} style={{ color: 'var(--text-primary)' }} />}
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 60, left: 0, right: 0,
              background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border)',
              zIndex: 99, padding: '12px 16px 16px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
                style={{ justifyContent: 'flex-start' }}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CustomCursor />
        <ScrollProgress />
        <BackToTop />
        <NavShell>
          <Routes>
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/deals" element={<PageWrapper><DealRoom /></PageWrapper>} />
            <Route path="/log" element={<PageWrapper><CallLogger /></PageWrapper>} />
            <Route path="/suggestions" element={<PageWrapper><AISuggestions /></PageWrapper>} />
            <Route path="/dashboard" element={<PageWrapper><CostDashboard /></PageWrapper>} />
            <Route path="/how-it-works" element={<PageWrapper><HowItWorks /></PageWrapper>} />
          </Routes>
        </NavShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}
