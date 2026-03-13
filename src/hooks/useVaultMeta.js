'use client';
import { useState, useCallback } from 'react';

const KEY = 'vault-meta-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch {}
}

// Stores per-vault metadata: label, goal, depositEthPrice, depositTimestamp
export function useVaultMeta() {
  const [meta, setMeta] = useState(() => load());

  const setVaultMeta = useCallback((vaultId, updates) => {
    setMeta(prev => {
      const next = { ...prev, [vaultId]: { ...(prev[vaultId] || {}), ...updates } };
      save(next);
      return next;
    });
  }, []);

  const getVaultMeta = useCallback((vaultId) => {
    return meta[vaultId] || {};
  }, [meta]);

  // Called when a vault is created — snapshot ETH price + time
  const recordDeposit = useCallback((vaultId, ethPrice) => {
    setVaultMeta(vaultId, {
      depositEthPrice: ethPrice,
      depositTimestamp: Date.now(),
    });
  }, [setVaultMeta]);

  // Portfolio balance history — snapshots taken periodically
  const recordBalanceSnapshot = useCallback((totalEth, ethPrice) => {
    try {
      const snapshots = JSON.parse(localStorage.getItem('vault-snapshots-v1') || '[]');
      const last = snapshots[snapshots.length - 1];
      // Only snapshot if value changed or >1 hour since last
      if (!last || Math.abs(last.eth - totalEth) > 0.0001 || Date.now() - last.ts > 3600000) {
        snapshots.push({ ts: Date.now(), eth: totalEth, usd: ethPrice ? totalEth * ethPrice : null });
        // Keep last 90 snapshots
        if (snapshots.length > 90) snapshots.splice(0, snapshots.length - 90);
        localStorage.setItem('vault-snapshots-v1', JSON.stringify(snapshots));
      }
    } catch {}
  }, []);

  const getBalanceHistory = useCallback(() => {
    try { return JSON.parse(localStorage.getItem('vault-snapshots-v1') || '[]'); }
    catch { return []; }
  }, []);

  return { meta, setVaultMeta, getVaultMeta, recordDeposit, recordBalanceSnapshot, getBalanceHistory };
}
