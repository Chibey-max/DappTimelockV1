export function truncateAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}
export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
export function formatCountdown(ts) {
  const diff = ts - Date.now();
  if (diff <= 0) return 'Now';
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  if (days  > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
export function calcProgress(depositTime, unlockTime) {
  const now = Date.now();
  if (now >= unlockTime)  return 100;
  if (now <= depositTime) return 0;
  return Math.min(100, Math.max(0,
    ((now - depositTime) / (unlockTime - depositTime)) * 100));
}
export function formatEthAmount(amount) {
  const n = typeof amount === 'bigint'
    ? Number(amount) / 1e18
    : Number(amount);
  const str = n.toFixed(8).replace(/0+$/, '');
  const [whole, dec = ''] = str.split('.');
  return `${whole}.${dec.padEnd(4, '0').slice(0, Math.max(4, dec.replace(/0+$/, '').length))}`;
}
