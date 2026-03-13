'use client';
import { useBlockNumber, useGasPrice } from 'wagmi';
import { formatGwei } from 'viem';
import { sepolia } from 'wagmi/chains';
import { NetworkIcon, GasIcon, ClockIcon, TrendingUpIcon } from '@/components/ui/Icons';
import EthPriceTicker from '@/components/ui/EthPriceTicker';

export default function NetworkInfo({ ethPrice }) {
  const { data: blockNumber } = useBlockNumber({ chainId: sepolia.id, watch: true });
  const { data: gasPrice }    = useGasPrice({ chainId: sepolia.id });

  const gasPriceGwei = gasPrice ? parseFloat(formatGwei(gasPrice)).toFixed(2) : '—';

  return (
    <div className="card card-accent-blue" style={{ marginTop: 14 }}>
      <div className="card-title">
        <span className="card-title-bar blue" />
        Network
      </div>
      <div className="info-row">
        <span className="info-key"><NetworkIcon size={12} /> Chain</span>
        <span className="info-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="network-dot" style={{ width: 5, height: 5 }} />
          Sepolia Testnet
        </span>
      </div>
      <div className="info-row">
        <span className="info-key"><ClockIcon size={12} /> Block</span>
        <span className="info-val">{blockNumber ? `#${Number(blockNumber).toLocaleString()}` : '—'}</span>
      </div>
      <div className="info-row">
        <span className="info-key"><GasIcon size={12} /> Gas</span>
        <span className="info-val">{gasPriceGwei} Gwei</span>
      </div>
      {ethPrice && (
        <div className="info-row">
          <span className="info-key"><TrendingUpIcon size={12} /> ETH</span>
          <span className="info-val" style={{ color: 'var(--gold)', fontWeight: 700 }}>
            <EthPriceTicker price={ethPrice} />
          </span>
        </div>
      )}
    </div>
  );
}
