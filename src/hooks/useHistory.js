'use client';
import { useState, useEffect, useCallback } from 'react';
import { CONTRACT_ADDRESS } from '@/lib/contract';

// Sepolia public RPCs for direct log fetching
const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

// Keccak256 topic hashes for our events
// These are the standard event signatures
const TOPICS = {
  Deposited:  '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15',
  Withdrawn:  '0x7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5',
  WithdrawnAll: '0x3b8d91e47ba2a0db61f1ef1a5fb41e7498e6d6f7d37765f2e6b91ca2e9ec7c3a',
};

async function rpc(method, params) {
  const res  = await fetch(RPC, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function hexToNum(h) { return h ? parseInt(h, 16) : 0; }
function hexToEth(h) { return h ? Number(BigInt(h)) / 1e18 : 0; }

export function useHistory(address) {
  const [history,   setHistory]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address || !CONTRACT_ADDRESS) return;
    setIsLoading(true);
    try {
      // Pad address to 32 bytes for topic filter
      const paddedAddr = '0x' + address.toLowerCase().replace('0x', '').padStart(64, '0');

      // Fetch all logs from contract involving this address (from genesis of contract)
      const logs = await rpc('eth_getLogs', [{
        address:   CONTRACT_ADDRESS,
        fromBlock: '0x0',
        toBlock:   'latest',
        topics:    [null, paddedAddr], // topic[1] = indexed user address
      }]);

      if (!logs || !Array.isArray(logs)) { setHistory([]); return; }

      // Get block timestamps for all unique blocks
      const blockNums = [...new Set(logs.map(l => l.blockNumber))];
      const timestamps = {};
      await Promise.all(blockNums.map(async bn => {
        try {
          const block = await rpc('eth_getBlockByNumber', [bn, false]);
          timestamps[bn] = hexToNum(block?.timestamp) * 1000;
        } catch { timestamps[bn] = Date.now(); }
      }));

      const events = logs.map(log => {
        const ts     = timestamps[log.blockNumber] || Date.now();
        const topics = log.topics || [];
        const data   = log.data || '0x';

        // Determine event type from topic[0]
        let type   = 'unknown';
        let amount = 0;
        let vaultId = null;
        let unlockTime = null;

        // Parse data field (non-indexed params are ABI-encoded in data)
        const dataHex = data.replace('0x', '');

        if (topics[0] === TOPICS.Deposited) {
          type       = 'deposit';
          // data: vaultId (uint256), amount (uint256), unlockTime (uint256)
          vaultId    = dataHex.length >= 64  ? hexToNum('0x' + dataHex.slice(0, 64))   : null;
          amount     = dataHex.length >= 128 ? hexToEth('0x' + dataHex.slice(64, 128)) : 0;
          unlockTime = dataHex.length >= 192 ? hexToNum('0x' + dataHex.slice(128, 192)) * 1000 : null;
        } else if (topics[0] === TOPICS.Withdrawn) {
          type    = 'withdraw';
          vaultId = dataHex.length >= 64  ? hexToNum('0x' + dataHex.slice(0, 64))   : null;
          amount  = dataHex.length >= 128 ? hexToEth('0x' + dataHex.slice(64, 128)) : 0;
        } else if (topics[0] === TOPICS.WithdrawnAll) {
          type   = 'withdrawAll';
          amount = dataHex.length >= 64 ? hexToEth('0x' + dataHex.slice(0, 64)) : 0;
        } else {
          // Unknown event — still show it
          type = 'event';
          amount = dataHex.length >= 128 ? hexToEth('0x' + dataHex.slice(64, 128)) : 0;
        }

        return {
          id:        log.transactionHash + log.logIndex,
          txHash:    log.transactionHash,
          blockNum:  hexToNum(log.blockNumber),
          type,
          amount,
          vaultId,
          unlockTime,
          timestamp: ts,
        };
      }).filter(e => e.amount > 0 || e.type === 'withdrawAll');

      // Sort newest first
      events.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(events);
    } catch (err) {
      console.warn('useHistory error:', err.message);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => { load(); }, [load]);

  return { history, isLoading, refetch: load };
}
