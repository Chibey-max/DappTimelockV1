'use client';
import { useState, useEffect, useRef } from 'react';
import { formatDate, formatCountdown, calcProgress, formatEthAmount } from '@/lib/utils';
import {
  LockIcon, UnlockIcon, BellIcon, CalendarIcon,
  PencilIcon, TargetIcon, TrendingUpIcon, TrendingDownIcon, CheckIcon, XIcon,
} from '@/components/ui/Icons';

function generateICS(vault, label) {
  const name  = label || `Vault #${String(vault.id).padStart(3,'0')} Unlock`;
  const start = new Date(vault.unlockTime);
  const end   = new Date(vault.unlockTime + 3600000);
  const fmt   = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  const ics   = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TimelockedVault//EN','BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,`SUMMARY:${name} — Vault Unlocked`,
    `DESCRIPTION:${formatEthAmount(vault.amount)} ETH is now available to withdraw.`,
    `UID:vault-unlock-${vault.id}@timelocked`,'END:VEVENT','END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `vault-${vault.id}-unlock.ics` });
  a.click();
  URL.revokeObjectURL(url);
}

export default function VaultCard({ vault, ethPrice, onWithdraw, vaultMeta, onSetMeta, notifications, index = 0, flashId = null }) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelInput,   setLabelInput]   = useState('');
  const [flashing,     setFlashing]     = useState(false);
  const flashedRef = useRef(null);

  const isUnlocked = Date.now() >= vault.unlockTime;
  const progress   = calcProgress(vault.depositTime, vault.unlockTime);
  const meta       = vaultMeta?.getVaultMeta(vault.id) || {};
  const label      = meta.label || '';
  const goal       = meta.goal  || null;
  const goalPct    = goal ? Math.min(100, (vault.amountNum / goal) * 100) : null;

  const depositPrice = meta.depositEthPrice;
  const pnlUsd = depositPrice && ethPrice ? vault.amountNum * (ethPrice - depositPrice) : null;
  const usdNow = ethPrice ? vault.amountNum * ethPrice : null;
  const notifScheduled = notifications?.isScheduled(vault.id);

  // Withdraw success flash
  useEffect(() => {
    if (flashId === vault.id && flashedRef.current !== flashId) {
      flashedRef.current = flashId;
      setFlashing(true);
      setTimeout(() => setFlashing(false), 800);
    }
  }, [flashId, vault.id]);

  async function toggleNotification() {
    if (notifScheduled) {
      notifications.cancelUnlock(vault.id);
    } else {
      const ok = await notifications.scheduleUnlock(vault, label);
      if (!ok) alert('Enable browser notifications to receive unlock alerts.');
    }
  }

  function saveLabel() {
    onSetMeta?.(vault.id, { label: labelInput.trim() });
    setEditingLabel(false);
  }

  const enterDelay = `${index * 65}ms`;

  return (
    <div
      className={`vault-card ${isUnlocked ? 'unlocked' : 'locked'} vault-card-enter${flashing ? ' withdraw-flash' : ''}`}
      style={{ animationDelay: enterDelay }}
    >
      {/* Scanline sweep element */}
      <div className="scanline" />

      {/* Unlock ripple (only when unlocked) */}
      {isUnlocked && <div className="unlock-ripple" />}

      {/* Header */}
      <div className="vault-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span className="vault-id-badge">#{String(vault.id).padStart(3, '0')}</span>
          {label
            ? <span style={{ fontSize: 11, color: 'var(--gold)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            : <button className="quick-pick" style={{ fontSize: 10, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}
                onClick={() => { setLabelInput(''); setEditingLabel(true); }}>
                <PencilIcon size={9} /> label
              </button>
          }
        </div>
        <span className={`vault-status ${isUnlocked ? 'unlocked' : 'locked'}`}>
          <span className="vault-status-dot" />
          {isUnlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>

      {/* Label editor */}
      {editingLabel && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <input className="form-input" placeholder="e.g. Emergency Fund, House Deposit"
            value={labelInput} onChange={e => setLabelInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveLabel()}
            style={{ padding: '6px 10px', fontSize: 12, flex: 1 }} autoFocus />
          <button className="btn btn-primary btn-sm" onClick={saveLabel}><CheckIcon size={11} /></button>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditingLabel(false)}><XIcon size={11} /></button>
        </div>
      )}

      {/* Amount row */}
      <div className="vault-amount-row">
        <div>
          <div className="vault-amount">
            {formatEthAmount(vault.amount)}
            <span className="vault-amount-unit"> ETH</span>
          </div>
          {usdNow && <div className="vault-usd" style={{ marginTop: 2 }}>${usdNow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>}
        </div>
        {pnlUsd !== null && (
          <span className={`pnl-pill ${pnlUsd >= 0 ? 'up' : 'down'}`}>
            {pnlUsd >= 0 ? <TrendingUpIcon size={9} /> : <TrendingDownIcon size={9} />}
            ${Math.abs(pnlUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {/* Goal bar */}
      {goal && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.05em' }}>
            <span>GOAL: {goal} ETH</span><span>{goalPct?.toFixed(0)}%</span>
          </div>
          <div className="progress-track">
            <div style={{ height: '100%', width: `${goalPct}%`, background: 'var(--blue)', borderRadius: 2, transition: 'width 1.2s ease' }} />
          </div>
        </div>
      )}

      {/* Meta strip */}
      <div className="vault-meta-strip">
        <div className="vault-meta-cell">
          <div className="vault-meta-label">Unlock</div>
          <div className="vault-meta-value">{formatDate(vault.unlockTime)}</div>
        </div>
        <div className="vault-meta-cell">
          <div className="vault-meta-label">{isUnlocked ? 'Status' : 'Remaining'}</div>
          <div className="vault-meta-value" style={isUnlocked ? { color: 'var(--green)' } : {}}>
            {isUnlocked ? 'Ready to withdraw' : formatCountdown(vault.unlockTime)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="lock-progress">
        <div className="lock-progress-header">
          <span className="lock-progress-label">Lock Progress</span>
          <span className="lock-progress-pct">{Math.round(progress)}%</span>
        </div>
        <div className="progress-track">
          <div className={`progress-fill ${isUnlocked ? 'unlocked' : 'locked'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Actions */}
      <div className="vault-actions">
        {isUnlocked
          ? <button className="btn btn-success btn-sm" onClick={() => onWithdraw(vault)}>
              <UnlockIcon size={12} /> Withdraw
            </button>
          : <button className="btn btn-secondary btn-sm" disabled>
              <LockIcon size={12} /> Locked
            </button>
        }
        {!isUnlocked && (
          <button className="btn btn-secondary btn-sm" onClick={toggleNotification}
            style={notifScheduled ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}>
            <BellIcon size={12} filled={notifScheduled} />
            {notifScheduled ? 'Alert On' : 'Alert'}
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={() => generateICS(vault, label)}>
          <CalendarIcon size={12} /> Cal
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => { setLabelInput(label); setEditingLabel(true); }}>
          <PencilIcon size={12} />
        </button>
        {!goal
          ? <button className="btn btn-secondary btn-sm"
              onClick={() => { const g = parseFloat(prompt('Set savings goal in ETH:')); if (g > 0) onSetMeta?.(vault.id, { goal: g }); }}>
              <TargetIcon size={12} /> Goal
            </button>
          : <button className="btn btn-secondary btn-sm" onClick={() => onSetMeta?.(vault.id, { goal: null })}>
              <TargetIcon size={12} /> {goal}Ξ
            </button>
        }
      </div>
    </div>
  );
}
