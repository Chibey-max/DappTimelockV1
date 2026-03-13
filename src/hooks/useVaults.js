'use client';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { formatEthAmount } from '@/lib/utils';

export function useVaults(address) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi:     ABI,
    functionName: 'getActiveVaults',
    args:    [address],
    query:   { enabled: !!address, refetchInterval: 15000 },
  });

  const vaults = data
    ? data[0].map((id, i) => ({
        id:          Number(id),
        amount:      data[1][i],     // keep as bigint — viem native
        amountNum:   Number(data[1][i]) / 1e18,
        unlockTime:  Number(data[2][i]) * 1000,
        depositTime: Number(data[2][i]) * 1000 - 30 * 86400000,
        active:      true,
      }))
    : [];

  const now             = Date.now();
  const totalBalance    = vaults.reduce((s, v) => s + v.amountNum, 0);
  const unlockedBalance = vaults.filter(v => now >= v.unlockTime).reduce((s, v) => s + v.amountNum, 0);
  const unlockedVaults  = vaults.filter(v => now >= v.unlockTime);

  return {
    vaults, isLoading,
    error:  error?.message || null,
    refetch,
    totalBalance,
    unlockedBalance,
    unlockedVaults,
  };
}
