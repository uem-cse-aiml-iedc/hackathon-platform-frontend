import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [glitchText, setGlitchText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.05) { // Reduced from 10% to 5% chance to glitch
        setIsGlitching(true);
        let iterations = 0;
        const glitchInterval = setInterval(() => {
          setGlitchText(
            text
              .split('')
              .map((char, index) => {
                if (index < iterations) {
                  return text[index];
                }
                return glitchChars[Math.floor(Math.random() * glitchChars.length)];
              })
              .join('')
          );

          if (iterations >= text.length) {
            clearInterval(glitchInterval);
            setGlitchText(text);
            setIsGlitching(false);
          }

          iterations += 1 / 3;
        }, 30);
      }
    }, 5000); // Increased from 3000ms to 5000ms

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={`${className}`}>
      {glitchText}
    </span>
  );
}