'use client';
import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { formatDate, formatCountdown, formatEthAmount } from '@/lib/utils';
import { ShieldIcon, SearchIcon, ExternalLinkIcon, LinkIcon, CheckIcon, LockIcon, UnlockIcon } from '@/components/ui/Icons';

function VaultProof({ vault, address, explorerBase }) {
  const isUnlocked = Date.now() >= vault.unlockTime;
  const proofUrl   = typeof window !== 'undefined'
    ? `${window.location.origin}?verify=${address}&vault=${vault.id}` : '';

  return (
    <div className={`vault-card ${isUnlocked ? 'unlocked' : 'locked'}`} style={{ marginBottom: 10 }}>
      <div className="vault-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="vault-id-badge">#{String(vault.id).padStart(3,'0')}</span>
        </div>
        <span className={`vault-status ${isUnlocked ? 'unlocked' : 'locked'}`}>
          <span className="vault-status-dot" />
          {isUnlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
        <div>
          <div className="vault-amount" style={{ fontSize: '1.4rem' }}>
            {formatEthAmount(vault.amount)}<span className="vault-amount-unit"> ETH</span>
          </div>
          <div className="vault-usd" style={{ marginTop: 4 }}>
            {isUnlocked ? 'Available to withdraw' : `Locked until ${formatDate(vault.unlockTime)}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <a href={`${explorerBase}/address/${address}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary btn-sm">
            <ExternalLinkIcon size={11} /> Chain
          </a>
          <button className="btn btn-secondary btn-sm"
            onClick={() => navigator.clipboard?.writeText(proofUrl)}>
            <LinkIcon size={11} /> Share
          </button>
        </div>
      </div>

      <div style={{
        background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: 8, padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, color: 'var(--text-muted)',
      }}>
        <CheckIcon size={12} color="var(--green)" />
        <span>Verified on-chain · Contract: {CONTRACT_ADDRESS?.slice(0,10)}…{CONTRACT_ADDRESS?.slice(-6)}</span>
      </div>
    </div>
  );
}

export default function ProofOfLock({ explorerBase = 'https://sepolia.etherscan.io' }) {
  const [input,  setInput]  = useState('');
  const [query,  setQuery]  = useState('');
  const [copied, setCopied] = useState(false);

  const isValidAddr = /^0x[0-9a-fA-F]{40}$/.test(query);

  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI,
    functionName: 'getActiveVaults',
    args:    [query],
    query:   { enabled: isValidAddr },
  });

  const vaults = data && isValidAddr
    ? data[0].map((id, i) => ({
        id:        Number(id),
        amount:    data[1][i],
        amountNum: Number(data[1][i]) / 1e18,
        unlockTime: Number(data[2][i]) * 1000,
      }))
    : [];

  const totalLocked = vaults.reduce((s, v) => s + v.amountNum, 0);

  function copyProofUrl() {
    navigator.clipboard?.writeText(`${window.location.origin}?verify=${query}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card card-accent-blue">
      <div className="card-title" style={{ marginBottom: 8 }}>
        <span className="card-title-bar" />
        Proof-of-Lock Verifier
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
        Paste any wallet address to verify their locked ETH on-chain. No wallet connection required.
        Use as proof-of-funds for deals, agreements, or public accountability.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <div className="input-wrap" style={{ flex: 1 }}>
          <input className="form-input" placeholder="0x… wallet address"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setQuery(input.trim())} />
        </div>
        <button className="btn btn-primary" onClick={() => setQuery(input.trim())}>
          <SearchIcon size={13} /> Verify
        </button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />)}
        </div>
      )}

      {error && (
        <div className="modal-warning">Could not fetch data. Is this a valid Sepolia address?</div>
      )}

      {!isLoading && isValidAddr && !error && vaults.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-wrap"><UnlockIcon size={20} color="var(--text-muted)" /></div>
          <div className="empty-title">No Active Vaults</div>
          <div className="empty-sub">This address has no time-locked ETH on this contract</div>
        </div>
      )}

      {vaults.length > 0 && (
        <>
          {/* Proof summary banner */}
          <div style={{
            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.18)',
            borderRadius: 11, padding: '14px 18px', marginBottom: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Total locked by {query.slice(0,6)}…{query.slice(-4)}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)', fontFamily: 'Syne, sans-serif', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {totalLocked.toFixed(6)} ETH
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={copyProofUrl}
              style={copied ? { borderColor: 'var(--green)', color: 'var(--green)' } : {}}>
              {copied ? <><CheckIcon size={11} /> Copied</> : <><LinkIcon size={11} /> Copy Proof URL</>}
            </button>
          </div>

          {vaults.map(v => (
            <VaultProof key={v.id} vault={v} address={query} explorerBase={explorerBase} />
          ))}
        </>
      )}
    </div>
  );
}
