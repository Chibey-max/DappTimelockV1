'use client';
import { useEffect, useRef, useState } from 'react';

export default function CountUp({ to, decimals = 4, duration = 1200, color }) {
  const [display, setDisplay] = useState('0');
  const rafRef   = useRef(null);
  const startRef = useRef(null);
  const prevTo   = useRef(null);

  useEffect(() => {
    const target = parseFloat(to) || 0;
    if (prevTo.current === target) return;
    const from = parseFloat(prevTo.current) || 0;
    prevTo.current = target;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (target - from) * eased;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [to, decimals, duration]);

  return <span style={color ? { color } : {}}>{display}</span>;
}
