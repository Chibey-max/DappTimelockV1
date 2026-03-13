'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Modal from '@/components/ui/Modal';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { ArrowUpIcon, XIcon } from '@/components/ui/Icons';

export default function WithdrawAll({ unlockedBalance, unlockedCount, onSuccess, toast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    toast.success('All Vaults Withdrawn', `${unlockedCount} vault${unlockedCount !== 1 ? 's' : ''} — ETH returned to wallet`);
    setModalOpen(false); reset(); setTimeout(onSuccess, 1500);
  }, [isSuccess]);

  useEffect(() => {
    if (!writeError) return;
    const msg = writeError.message || '';
    if (msg.includes('User rejected') || msg.includes('user rejected'))
      toast.warning('Cancelled', 'Transaction rejected');
    else
      toast.error('Withdraw Failed', msg.slice(0, 120));
    reset();
  }, [writeError]);

  const loading = isPending || isConfirming;

  return (
    <>
      <div className="withdraw-all-section">
        <div>
          <div className="withdraw-all-label">Available to Withdraw</div>
          <div className="withdraw-all-amount">{unlockedBalance.toFixed(6)} ETH</div>
        </div>
        <button className="btn btn-success" onClick={() => setModalOpen(true)}>
          <ArrowUpIcon size={13} /> Withdraw All
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => !loading && setModalOpen(false)}>
        <div className="modal-title">Withdraw All Unlocked</div>
        <div className="modal-subtitle">Withdraw all vaults whose lock period has expired</div>
        <div className="modal-detail">
          <div className="modal-detail-row">
            <span className="modal-detail-key">Total amount</span>
            <span className="modal-detail-val" style={{ color: 'var(--green)', fontFamily: 'Syne, sans-serif', fontSize: '1rem' }}>
              {unlockedBalance.toFixed(6)} ETH
            </span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-key">Vaults</span>
            <span className="modal-detail-val">{unlockedCount} vault{unlockedCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)} disabled={loading}>
            <XIcon size={13} /> Cancel
          </button>
          <button className="btn btn-success" style={{ flex: 2 }}
            onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'withdrawAll' })}
            disabled={loading}>
            {loading
              ? <><span className="spinner" /> {isConfirming ? 'Confirming…' : 'Check wallet…'}</>
              : <><ArrowUpIcon size={13} /> Withdraw All</>}
          </button>
        </div>
      </Modal>
    </>
  );
}
