'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import Modal from '@/components/ui/Modal';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { formatDate } from '@/lib/utils';
import { LockIcon, WarningIcon } from '@/components/ui/Icons';

const QUICK_AMOUNTS   = [0.001, 0.01, 0.05, 0.1, 0.5];
const QUICK_DURATIONS = [
  { label: '7d',   days: 7   },
  { label: '30d',  days: 30  },
  { label: '90d',  days: 90  },
  { label: '180d', days: 180 },
  { label: '1yr',  days: 365 },
];

function daysFromNow(days) {
  const d = new Date(Date.now() + days * 86400000);
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function DepositForm({ address, isConnected, ethPrice, onSuccess, toast }) {
  const chainId        = useChainId();
  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  const [amount,      setAmount]      = useState('');
  const [unlockVal,   setUnlockVal]   = useState(daysFromNow(30));
  const [confirmOpen, setConfirmOpen] = useState(false);

  const unlockMs  = unlockVal ? new Date(unlockVal).getTime() : 0;
  const diffDays  = unlockMs  ? Math.round((unlockMs - Date.now()) / 86400000) : 0;
  const unlockSec = BigInt(Math.floor(unlockMs / 1000));

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    toast.success('Vault Created', `${amount} ETH locked for ${diffDays} day${diffDays !== 1 ? 's' : ''}`);
    setAmount(''); setUnlockVal(daysFromNow(30)); setConfirmOpen(false); reset();
    setTimeout(onSuccess, 1500);
  }, [isSuccess]);

  useEffect(() => {
    if (!writeError) return;
    const msg = writeError.message || '';
    if (msg.includes('User rejected') || msg.includes('user rejected'))
      toast.warning('Cancelled', 'Transaction rejected');
    else if (msg.includes('Vault already active'))
      toast.error('Vault Exists', 'You already have an active vault. Withdraw it first.');
    else if (msg.includes('Invalid unlock time'))
      toast.error('Invalid Time', 'Unlock time must be between now and 1 year.');
    else if (msg.includes('Must send ETH'))
      toast.error('Invalid Amount', 'Amount must be greater than 0.');
    else
      toast.error('Deposit Failed', msg.slice(0, 120));
    reset();
  }, [writeError]);

  function openConfirm() {
    if (!amount || parseFloat(amount) <= 0)      return toast.error('Invalid Amount', 'Enter a valid ETH amount');
    if (!unlockVal)                               return toast.error('No Unlock Time', 'Select an unlock date');
    if (unlockMs <= Date.now())                   return toast.error('Invalid Date', 'Unlock time must be in the future');
    if (unlockMs > Date.now() + 366 * 86400000)  return toast.error('Too Far', 'Max lock duration is 1 year');
    setConfirmOpen(true);
  }

  function execute() {
    writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'deposit', args: [unlockSec], value: parseEther(amount) });
  }

  const loading   = isPending || isConfirming;
  const usdPreview = ethPrice && amount ? (parseFloat(amount) * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) : null;

  if (!isConnected) {
    return (
      <div className="card">
        <div className="card-title"><span className="card-title-accent" />New Deposit</div>
        <div className="connect-prompt">
          <div className="connect-icon-wrap"><LockIcon size={22} color="var(--gold)" /></div>
          <div className="connect-title">Wallet Required</div>
          <div className="connect-sub">Connect your wallet to create time-locked vaults on Sepolia</div>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="card">
        <div className="card-title"><span className="card-title-accent" />New Deposit</div>
        <div className="connect-prompt">
          <div className="connect-icon-wrap" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
            <WarningIcon size={22} color="var(--red)" />
          </div>
          <div className="connect-title">Wrong Network</div>
          <div className="connect-sub">Switch to Sepolia Testnet to create vaults</div>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card card-accent-gold">
        <div className="card-title">
          <span className="card-title-bar" />
          New Deposit
        </div>

        <div className="form-group">
          <label className="form-label">Amount</label>
          <div className="input-wrap">
            <input type="number" className="form-input" placeholder="0.000" step="any" min="0.001"
              value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingRight: 48 }} />
            <span className="input-suffix">ETH</span>
          </div>
          <div className="quick-picks">
            {QUICK_AMOUNTS.map(v => (
              <button key={v} className="quick-pick" onClick={() => setAmount(String(v))}>{v}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Unlock Date</label>
          <input type="datetime-local" className="form-input"
            value={unlockVal} onChange={e => setUnlockVal(e.target.value)} />
          <div className="quick-picks">
            {QUICK_DURATIONS.map(({ label, days }) => (
              <button key={label} className="quick-pick" onClick={() => setUnlockVal(daysFromNow(days))}>{label}</button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        {amount && parseFloat(amount) > 0 && (
          <div className="amount-preview">
            <div>
              <div className="amount-preview-label">Locking</div>
              {diffDays > 0 && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{diffDays}d lock</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="amount-preview-value">{parseFloat(amount).toFixed(4)} ETH</div>
              {usdPreview && <div className="amount-preview-usd">≈ ${usdPreview}</div>}
            </div>
          </div>
        )}

        <button
          className={`btn btn-primary btn-full${loading ? ' charging' : ''}`}
          style={{ marginTop: 14 }}
          onClick={openConfirm}
          disabled={loading}
        >
          {loading && <span className="btn-charge-fill" />}
          {loading
            ? <><span className="spinner" /> {isConfirming ? 'Confirming…' : 'Waiting for wallet…'}</>
            : <><LockIcon size={13} color="#0a0700" /> Lock ETH</>
          }
        </button>
        <div className="form-hint" style={{ justifyContent: 'center', marginTop: 7 }}>
          One active vault per address
        </div>
      </div>

      <Modal isOpen={confirmOpen} onClose={() => !loading && setConfirmOpen(false)}>
        <div className="modal-title">Confirm Deposit</div>
        <div className="modal-subtitle">Review before locking — this action cannot be undone</div>
        <div className="modal-detail">
          <div className="modal-detail-row">
            <span className="modal-detail-key">Amount</span>
            <div style={{ textAlign: 'right' }}>
              <span className="modal-detail-val" style={{ color: 'var(--gold)', fontSize: '1.05rem', fontFamily: 'Syne, sans-serif' }}>
                {amount} ETH
              </span>
              {usdPreview && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>≈ ${usdPreview}</div>}
            </div>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-key">Unlock Time</span>
            <span className="modal-detail-val">{unlockMs ? formatDate(unlockMs) : '—'}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-key">Duration</span>
            <span className="modal-detail-val">{diffDays} day{diffDays !== 1 ? 's' : ''}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-key">Network</span>
            <span className="modal-detail-val" style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="network-dot" style={{ width: 5, height: 5 }} /> Sepolia
            </span>
          </div>
        </div>
        <div className="modal-warning">
          <WarningIcon size={13} color="var(--gold)" style={{ flexShrink: 0, marginTop: 1 }} />
          ETH will be locked until the unlock time and cannot be retrieved early.
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmOpen(false)} disabled={loading}>
            Cancel
          </button>
          <button className={`btn btn-primary${loading ? ' charging' : ''}`} style={{ flex: 2 }} onClick={execute} disabled={loading}>
            {loading && <span className="btn-charge-fill" />}
            {loading
              ? <><span className="spinner" /> {isConfirming ? 'Confirming on-chain…' : 'Check wallet…'}</>
              : <><LockIcon size={13} color="#0d0a00" /> Confirm &amp; Lock</>
            }
          </button>
        </div>
      </Modal>
    </>
  );
}
