import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Zap, Trophy, Rocket, Target, Globe } from 'lucide-react';
import { useMouseParallax } from '../../hooks/useParallax';

export default function FloatingElements() {
  const mousePosition = useMouseParallax();

  const floatingIcons = [
    { Icon: Code2, delay: 0, x: 100, y: 100 },
    { Icon: Zap, delay: 0.2, x: -150, y: 200 },
    { Icon: Trophy, delay: 0.4, x: 200, y: -100 },
    { Icon: Rocket, delay: 0.6, x: -100, y: -150 },
    { Icon: Target, delay: 0.8, x: 300, y: 150 },
    { Icon: Globe, delay: 1, x: -200, y: -50 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute opacity-10 dark:opacity-5"
          style={{
            left: `${50 + (x / window.innerWidth) * 100}%`,
            top: `${50 + (y / window.innerHeight) * 100}%`,
          }}
          animate={{
            x: mousePosition.x * (index % 2 === 0 ? 1 : -1),
            y: mousePosition.y * (index % 2 === 0 ? 1 : -1),
            rotate: [0, 360],
          }}
          transition={{
            x: { type: "spring", stiffness: 50, damping: 20 },
            y: { type: "spring", stiffness: 50, damping: 20 },
            rotate: { duration: 20 + index * 5, repeat: Infinity, ease: "linear" },
          }}
        >
          <Icon className="h-16 w-16 text-secondary dark:text-accent" />
        </motion.div>
      ))}
    </div>
  );
}