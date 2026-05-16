import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { toggle, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      style={{
        width: 44,
        height: 24,
        borderRadius: 99,
        background: isDark ? '#8B5CF630' : '#F59E0B30',
        border: `1px solid ${isDark ? '#8B5CF650' : '#F59E0B50'}`,
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0 3px',
        transition: 'background 0.3s, border-color 0.3s',
      }}
      aria-label="Toggle theme"
    >
      <motion.div
        layout
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: isDark
            ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
            : 'linear-gradient(135deg, #F59E0B, #EF4444)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: isDark ? 0 : 'auto',
          boxShadow: isDark ? '0 0 8px #8B5CF6' : '0 0 8px #F59E0B',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isDark ? <Moon size={10} color="#fff" /> : <Sun size={10} color="#fff" />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
