/**
 * ScrollReveal — triggers a fade+slide animation when the element enters the viewport.
 * Props:
 *   direction: 'up' | 'down' | 'left' | 'right' (default: 'up')
 *   delay:  number in seconds (default: 0)
 *   duration: number in seconds (default: 0.5)
 *   className: extra classes
 */
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const directionMap = {
  up:    { hidden: { y: 30, opacity: 0 },  visible: { y: 0, opacity: 1 } },
  down:  { hidden: { y: -30, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  left:  { hidden: { x: -30, opacity: 0 }, visible: { x: 0, opacity: 1 } },
  right: { hidden: { x: 30, opacity: 0 },  visible: { x: 0, opacity: 1 } },
  scale: { hidden: { scale: 0.9, opacity: 0 }, visible: { scale: 1, opacity: 1 } },
};

const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  threshold = 0.15,
  once = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const variants = directionMap[direction] || directionMap.up;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
