'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import VaultCard   from './VaultCard';
import WithdrawAll from './WithdrawAll';
import Modal       from '@/components/ui/Modal';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { formatEthAmount } from '@/lib/utils';
import { WalletIcon, UnlockIcon, LockIcon, XIcon } from '@/components/ui/Icons';

function WithdrawModal({ vault, onClose, onSuccess, onFlash, toast }) {
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    toast.success('Vault Withdrawn', `${formatEthAmount(vault.amount)} ETH returned to your wallet`);
    reset(); onClose(); onFlash(vault.id); setTimeout(onSuccess, 1500);
  }, [isSuccess]);

  useEffect(() => {
    if (!writeError) return;
    const msg = writeError.message || '';
    if (msg.includes('User rejected') || msg.includes('user rejected'))
      toast.warning('Cancelled', 'Transaction rejected');
    else if (msg.includes('Funds are locked'))
      toast.error('Still Locked', 'This vault has not reached its unlock time yet.');
    else
      toast.error('Withdraw Failed', msg.slice(0, 120));
    reset();
  }, [writeError]);

  const loading = isPending || isConfirming;

  return (
    <Modal isOpen onClose={() => !loading && onClose()}>
      <div className="modal-title">Withdraw Vault #{String(vault.id).padStart(3, '0')}</div>
      <div className="modal-subtitle">Return your locked ETH to your wallet</div>
      <div className="modal-detail">
        <div className="modal-detail-row">
          <span className="modal-detail-key">Amount to receive</span>
          <span className="modal-detail-val" style={{ color: 'var(--green)', fontSize: '1rem', fontFamily: 'Syne, sans-serif' }}>
            {formatEthAmount(vault.amount)} ETH
          </span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-key">Vault ID</span>
          <span className="modal-detail-val">#{vault.id}</span>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
          <XIcon size={13} /> Cancel
        </button>
        <button className="btn btn-success" style={{ flex: 2 }}
          onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'withdraw', args: [BigInt(vault.id)] })}
          disabled={loading}>
          {loading
            ? <><span className="spinner" /> {isConfirming ? 'Confirming…' : 'Check wallet…'}</>
            : <><UnlockIcon size={13} /> Confirm Withdraw</>}
        </button>
      </div>
    </Modal>
  );
}

export default function VaultList({ vaults, isLoading, isConnected, ethPrice, onSuccess, toast, vaultMeta, notifications }) {
  const [withdrawVault, setWithdrawVault] = useState(null);
  const [flashId,       setFlashId]       = useState(null);
  const now             = Date.now();
  const unlockedVaults  = vaults.filter(v => now >= v.unlockTime);
  const unlockedBalance = unlockedVaults.reduce((s, v) => s + v.amountNum, 0);

  if (!isConnected) {
    return (
      <div className="card card-accent-green">
        <div className="card-title"><span className="card-title-bar green" />Your Vaults</div>
        <div className="connect-prompt">
          <div className="connect-icon-wrap"><WalletIcon size={22} color="var(--gold)" /></div>
          <div className="connect-title">No Wallet Connected</div>
          <div className="connect-sub">Connect your wallet to view and manage your time-locked vaults</div>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card card-accent-green">
        <div className="card-title"><span className="card-title-bar green" />Your Vaults</div>
        {[1, 2].map(i => <div key={i} style={{ marginBottom: 12 }}><div className="skeleton" style={{ height: 220, borderRadius: 13 }} /></div>)}
      </div>
    );
  }

  return (
    <div className="card card-accent-green">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="card-title-bar green" />
          Your Vaults
        </div>
        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.05em' }}>
          {vaults.length} active
        </span>
      </div>

      {vaults.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap"><LockIcon size={20} color="var(--text-muted)" /></div>
          <div className="empty-title">No Active Vaults</div>
          <div className="empty-sub">Use the deposit form to create your first time-locked vault</div>
        </div>
      ) : (
        <div className="vault-list">
          {vaults.map((v, i) => (
            <VaultCard key={v.id} vault={v} ethPrice={ethPrice}
              index={i}
              flashId={flashId}
              onWithdraw={setWithdrawVault} vaultMeta={vaultMeta}
              onSetMeta={vaultMeta?.setVaultMeta} notifications={notifications} />
          ))}
        </div>
      )}

      {unlockedVaults.length > 0 && (
        <WithdrawAll unlockedBalance={unlockedBalance} unlockedCount={unlockedVaults.length}
          onSuccess={onSuccess} toast={toast} />
      )}

      {withdrawVault && (
        <WithdrawModal vault={withdrawVault}
          onClose={() => setWithdrawVault(null)}
          onSuccess={onSuccess}
          onFlash={id => { setFlashId(id); setTimeout(() => setFlashId(null), 900); }}
          toast={toast} />
      )}
    </div>
  );
}
