/**
 * ScrollProgress — thin fixed bar at the top of the viewport
 * that tracks the user's scroll position on the page.
 * Color: Royal Magenta → Violet → Gold gradient
 */
import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      setScrollPct(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scaleX = useSpring(scrollPct / 100, {
    stiffness: 120,
    damping: 20,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX, width: '100%' }}
    />
  );
};

export default ScrollProgress;
