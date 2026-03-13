'use client';
import { useEffect, useRef, useState } from 'react';
import { LockIcon, UnlockIcon } from '@/components/ui/Icons';

function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const rafRef  = useRef(null);
  const prevRef = useRef(null);

  useEffect(() => {
    const t = parseFloat(target);
    if (isNaN(t)) return;
    if (prevRef.current === t) return;
    const start    = prevRef.current ?? 0;
    prevRef.current = t;
    const startMs  = performance.now();

    function tick(now) {
      const pct = Math.min((now - startMs) / duration, 1);
      // ease-out-quart
      const ease = 1 - Math.pow(1 - pct, 4);
      setDisplay(start + (t - start) * ease);
      if (pct < 1) rafRef.current = requestAnimationFrame(tick);
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function StatCard({ label, rawValue, unit, sub, color, glowColor, Icon }) {
  const animated = useCountUp(rawValue);
  const display  = animated.toFixed(4);

  return (
    <div className="stat-card">
      <div className="stat-bg-glow" style={{ background: glowColor }} />
      <div className="stat-label">
        <Icon size={10} color="var(--text-muted)" />
        {label}
      </div>
      <div className="stat-value-animated" style={color ? { color } : {}}>
        {display}<span className="stat-unit">{unit}</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

export default function StatsGrid({ totalBalance, unlockedBalance, vaultCount, ethPrice }) {
  return (
    <div className="stats-grid">
      <StatCard
        label="Total Locked"
        rawValue={totalBalance}
        unit="E"
        sub={ethPrice
          ? `$${(totalBalance * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD`
          : `${vaultCount} vault${vaultCount !== 1 ? 's' : ''}`}
        glowColor="rgba(245,166,35,0.08)"
        Icon={LockIcon}
      />
      <StatCard
        label="Unlocked"
        rawValue={unlockedBalance}
        unit="E"
        sub={`${vaultCount} active vault${vaultCount !== 1 ? 's' : ''}`}
        color="var(--green)"
        glowColor="rgba(16,185,129,0.08)"
        Icon={UnlockIcon}
      />
    </div>
  );
}
