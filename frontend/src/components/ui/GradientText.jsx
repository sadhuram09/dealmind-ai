import { motion } from 'framer-motion';

export default function GradientText({ children, className, style, animate = false }) {
  return (
    <motion.span
      className={className}
      style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 40%, #10B981 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        backgroundSize: animate ? '200% 200%' : '100%',
        ...style,
      }}
      animate={animate ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}}
      transition={animate ? { duration: 5, repeat: Infinity, ease: 'linear' } : {}}
    >
      {children}
    </motion.span>
  );
}
