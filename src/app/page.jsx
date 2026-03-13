'use client';
import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useVaults }        from '@/hooks/useVaults';
import { useToast }         from '@/hooks/useToast';
import { useHistory }       from '@/hooks/useHistory';
import { useVaultMeta }     from '@/hooks/useVaultMeta';
import { useNotifications } from '@/hooks/useNotifications';
import Header               from '@/components/layout/Header';
import Footer               from '@/components/layout/Footer';
import StatsGrid            from '@/components/stats/StatsGrid';
import DepositForm          from '@/components/deposit/DepositForm';
import VaultList            from '@/components/vault/VaultList';
import VaultChart           from '@/components/chart/VaultChart';
import PortfolioChart       from '@/components/chart/PortfolioChart';
import NetworkInfo          from '@/components/ui/NetworkInfo';
import ProofOfLock          from '@/components/ui/ProofOfLock';
import TransactionHistory   from '@/components/history/TransactionHistory';
import { ToastContainer }   from '@/components/ui/Toast';
import AnimatedTitle         from '@/components/ui/AnimatedTitle';
import HeroParticles         from '@/components/ui/HeroParticles';
import EthPriceTicker        from '@/components/ui/EthPriceTicker';
import { LayersIcon, ActivityIcon, ShieldIcon, LockIcon } from '@/components/ui/Icons';

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId       = useChainId();
  const vaults        = useVaults(address);
  const toast         = useToast();
  const history       = useHistory(address);
  const vaultMeta     = useVaultMeta();
  const notifications = useNotifications();
  const [ethPrice,   setEthPrice]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('vaults');

  useEffect(() => {
    async function fetchPrice() {
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
        const j = await r.json();
        if (j?.price) { setEthPrice(parseFloat(j.price)); return; }
      } catch {}
      try {
        const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const j = await r.json();
        if (j?.ethereum?.usd) setEthPrice(j.ethereum.usd);
      } catch {}
    }
    fetchPrice();
    const iv = setInterval(fetchPrice, 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (isConnected && vaults.totalBalance >= 0)
      vaultMeta.recordBalanceSnapshot(vaults.totalBalance, ethPrice);
  }, [vaults.totalBalance, ethPrice, isConnected]);

  const balanceHistory = vaultMeta.getBalanceHistory();

  function handleDepositSuccess(vaultId) {
    vaultMeta.recordDeposit(vaultId, ethPrice);
    setTimeout(vaults.refetch, 1500);
    setTimeout(history.refetch, 3000);
  }

  const TABS = [
    { id: 'vaults',  Icon: LayersIcon,   label: 'Vaults'  },
    { id: 'history', Icon: ActivityIcon, label: 'History' },
    { id: 'verify',  Icon: ShieldIcon,   label: 'Verify'  },
  ];

  return (
    <div className="app-shell">
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      <Header />

      {/* Hero */}
      <div className="hero">
        <HeroParticles />
        <div>
          <div className="hero-eyebrow">Non-custodial time-locks on Ethereum</div>
          <AnimatedTitle lines={['Lock ETH.', '[Unlock] discipline.']} />
          <p className="hero-desc" style={{ opacity: 0, animation: 'word-rise 0.55s 600ms cubic-bezier(0.22,1,0.36,1) forwards' }}>
            Deposit ETH into on-chain vaults with programmable unlock dates.
            Your keys, your terms, immutable on Sepolia.
          </p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">
              {vaults.totalBalance > 0 ? vaults.totalBalance.toFixed(4) : '—'}
            </div>
            <div className="hero-stat-label">ETH Locked</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{vaults.vaults.length}</div>
            <div className="hero-stat-label">Vaults</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value" style={{ fontSize: '1rem' }}>
              <EthPriceTicker price={ethPrice} style={{ color: 'var(--gold)', fontWeight: 800 }} />
            </div>
            <div className="hero-stat-label">ETH Price</div>
          </div>
        </div>
      </div>

      <main className="main-grid">
        {/* Left sidebar */}
        <aside>
          <StatsGrid
            totalBalance={vaults.totalBalance}
            unlockedBalance={vaults.unlockedBalance}
            vaultCount={vaults.vaults.length}
            ethPrice={ethPrice}
          />
          <DepositForm
            address={address}
            isConnected={isConnected}
            chainId={chainId}
            ethPrice={ethPrice}
            onSuccess={handleDepositSuccess}
            toast={toast}
          />
          <NetworkInfo ethPrice={ethPrice} />
        </aside>

        {/* Right main */}
        <section>
          <div className="tab-group">
            {TABS.map(({ id, Icon, label }) => (
              <button
                key={id}
                className={`tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'vaults' && (
            <>
              {balanceHistory.length >= 2 && (
                <PortfolioChart
                  history={balanceHistory}
                  ethPrice={ethPrice}
                  currentBalance={vaults.totalBalance}
                />
              )}
              <VaultChart vaults={vaults.vaults} ethPrice={ethPrice} />
              <VaultList
                vaults={vaults.vaults}
                isLoading={vaults.isLoading}
                isConnected={isConnected}
                address={address}
                chainId={chainId}
                ethPrice={ethPrice}
                onSuccess={() => { setTimeout(vaults.refetch, 2000); setTimeout(history.refetch, 3000); }}
                toast={toast}
                vaultMeta={vaultMeta}
                notifications={notifications}
              />
            </>
          )}

          {activeTab === 'history' && (
            <TransactionHistory
              history={history.history}
              isLoading={history.isLoading}
              explorerBase="https://sepolia.etherscan.io"
            />
          )}

          {activeTab === 'verify' && (
            <ProofOfLock explorerBase="https://sepolia.etherscan.io" />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
