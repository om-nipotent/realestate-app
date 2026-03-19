/**
 * AnimatedPage — Framer Motion page-level wrapper
 * Wraps any page with smooth fade+slide entry/exit transitions.
 * Usage: wrap the return value of your page component with <AnimatedPage>
 */
import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const AnimatedPage = ({ children, className = '' }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
);

export default AnimatedPage;
