'use client';
import { useMemo } from 'react';

export default function HeroParticles() {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size:  Math.random() * 3 + 1.2,
    left:  Math.random() * 100,
    delay: Math.random() * 8,
    dur:   Math.random() * 6 + 7,
    opacity: Math.random() * 0.25 + 0.08,
    bottom: Math.random() * 30,
  })), []);

  return (
    <div className="hero-particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width:  p.size,
            height: p.size,
            left:   `${p.left}%`,
            bottom: `${p.bottom}%`,
            animationDuration:  `${p.dur}s`,
            animationDelay:     `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
