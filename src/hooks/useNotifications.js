'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vault-notification-ids';

function getSaved() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}
function addSaved(vaultId) {
  try {
    const s = getSaved();
    s.add(String(vaultId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]));
  } catch {}
}
function removeSaved(vaultId) {
  try {
    const s = getSaved();
    s.delete(String(vaultId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]));
  } catch {}
}

export function useNotifications() {
  const [permission, setPermission] = useState('default');
  const [scheduled,  setScheduled]  = useState(getSaved);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // Schedule a notification for when a vault unlocks
  const scheduleUnlock = useCallback(async (vault, vaultLabel) => {
    if (permission !== 'granted') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return false;
    }

    const delay = vault.unlockTime - Date.now();
    if (delay <= 0) return false; // already unlocked

    const name = vaultLabel || `Vault #${String(vault.id).padStart(3, '0')}`;

    // Use setTimeout for near-future notifications (< 24h, tab must stay open)
    // For far-future, we store the intent and check on next page load
    if (delay < 24 * 3600 * 1000) {
      setTimeout(() => {
        try {
          new Notification('Vault Unlocked', {
            body: `${name} is now unlocked. ${vault.amountNum.toFixed(4)} ETH is ready to withdraw.`,
            icon: '/favicon.ico',
            tag:  `vault-unlock-${vault.id}`,
          });
        } catch {}
      }, delay);
    }

    // Always persist the scheduled intent
    addSaved(vault.id);
    setScheduled(getSaved());
    localStorage.setItem(`vault-unlock-${vault.id}`, JSON.stringify({
      vaultId:    vault.id,
      unlockTime: vault.unlockTime,
      amountNum:  vault.amountNum,
      label:      name,
    }));
    return true;
  }, [permission]);

  const cancelUnlock = useCallback((vaultId) => {
    removeSaved(vaultId);
    localStorage.removeItem(`vault-unlock-${vaultId}`);
    setScheduled(getSaved());
  }, []);

  // On page load, fire any notifications that matured while the tab was closed
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const saved = getSaved();
    for (const id of saved) {
      try {
        const data = JSON.parse(localStorage.getItem(`vault-unlock-${id}`) || 'null');
        if (!data) { removeSaved(id); continue; }
        if (Date.now() >= data.unlockTime) {
          new Notification('Vault Unlocked', {
            body: `${data.label} unlocked while you were away. ${Number(data.amountNum).toFixed(4)} ETH is ready.`,
            icon: '/favicon.ico',
            tag:  `vault-unlock-${id}`,
          });
          removeSaved(id);
          localStorage.removeItem(`vault-unlock-${id}`);
        }
      } catch {}
    }
    setScheduled(getSaved());
  }, []);

  const isScheduled = useCallback((vaultId) => scheduled.has(String(vaultId)), [scheduled]);

  return { permission, requestPermission, scheduleUnlock, cancelUnlock, isScheduled };
}
