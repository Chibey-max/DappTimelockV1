'use client';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { LockIcon, SunIcon, MoonIcon, WarningIcon } from '@/components/ui/Icons';

export default function Header() {
  const [theme, setTheme] = useState('dark');
  const { isConnected }   = useAccount();
  const chainId           = useChainId();
  const isWrongNet        = isConnected && chainId !== sepolia.id;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="logo" href="#">
          <div className="logo-mark">
            <LockIcon size={16} color="#0d0a00" />
          </div>
          Timelocked<span className="logo-text-dim">Vault</span>
        </a>

        <div className="header-right">
          <div className="network-pill">
            <span className="network-dot" />
            Sepolia
          </div>

          <button
            className="icon-btn"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark'
              ? <SunIcon size={15} />
              : <MoonIcon size={15} />
            }
          </button>

          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
          />
        </div>
      </div>

      {isWrongNet && (
        <div className="wrong-network-bar">
          <WarningIcon size={13} color="#f87171" />
          Wrong network — switch to Sepolia Testnet using the button above
        </div>
      )}
    </header>
  );
}
