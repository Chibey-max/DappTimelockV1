# 🔐 TimelockedVault

A non-custodial ETH time-lock dApp built on Ethereum Sepolia. Deposit ETH into secure on-chain vaults that can only be withdrawn after a chosen unlock time.

**Live demo:**https://dapp-timelockv1.vercel.app/
**Contract:** [`0xb6601a2267bD083748C404823b9Fb373BcB7d228`](https://sepolia.etherscan.io/address/0xb6601a2267bD083748C404823b9Fb373BcB7d228) on Sepolia

---

## Features

### Core
- **Time-locked vaults** — deposit any amount of ETH and lock it until a chosen date (up to 1 year)
- **Withdraw any time** after the lock expires — individually or all at once
- **One active vault** per address enforced at the contract level

### Wallet
- **RainbowKit** — supports MetaMask, Coinbase Wallet, WalletConnect, Rainbow, and 300+ others
- **Automatic network detection** — prompts to switch to Sepolia if on the wrong chain
- **wagmi v2 + viem** — type-safe contract reads/writes, automatic gas estimation, receipt watching

### Portfolio & Analytics
- **Portfolio history chart** — tracks your total locked ETH and USD value over time, stored locally
- **Vault balance chart** — bar chart of all vaults, colour-coded by lock status
- **ETH price P&L** — shows USD gain/loss since deposit date for each vault
- **Yield simulator** — compares your locked ETH against Aave (3.5% APY) and stETH (3.7% APY)

### Vault Management
- **Vault labels** — name each vault ("Emergency Fund", "House Deposit") stored in localStorage
- **Savings goals** — set a target ETH amount and track progress with a visual bar
- **Unlock notifications** — request browser push notifications that fire when a vault unlocks, even if you close the tab
- **Calendar export** — one-click `.ics` download to add the unlock date to Google Calendar, Apple Calendar, or Outlook

### Transparency
- **Transaction history** — full on-chain activity feed pulled from `eth_getLogs`, filterable by deposits and withdrawals
- **Proof-of-Lock verifier** — paste any wallet address to publicly verify their locked ETH without connecting your own wallet. Share a proof URL as on-chain evidence for deals or agreements

---

## Tech Stack

| Layer       | Library                                          |
|-------------|--------------------------------------------------|
| Framework   | [Next.js 14](https://nextjs.org) (App Router)    |
| Web3        | [wagmi v2](https://wagmi.sh) + [viem](https://viem.sh) |
| Wallet UI   | [RainbowKit v2](https://rainbowkit.com)          |
| State       | [@tanstack/react-query v5](https://tanstack.com/query) |
| Charts      | [Chart.js 4](https://chartjs.org) + [react-chartjs-2](https://react-chartjs-2.js.org) |
| Styling     | Custom CSS + [Tailwind CSS](https://tailwindcss.com) |
| Network     | Sepolia Testnet (chainId 11155111)               |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [WalletConnect Cloud](https://cloud.walletconnect.com) project ID
- Sepolia ETH from a [faucet](https://sepoliafaucet.com)

### Installation

```bash
git clone https://github.com/yourusername/timelocked-vault
cd timelocked-vault
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xb6601a2267bD083748C404823b9Fb373BcB7d228
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

> `.env.local` is gitignored. For Vercel deployment, add these in **Settings → Environment Variables**.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4. Deploy

> ⚠ Without the env vars set in Vercel, transactions will fail silently. Always add them before deploying.

---

## Contract ABI

The contract is verified on Sepolia Etherscan. Key functions:

| Function | Description |
|----------|-------------|
| `deposit(uint256 _unlockTime) payable` | Create a vault, ETH locked until `_unlockTime` |
| `withdraw(uint256 _vaultId)` | Withdraw a single unlocked vault |
| `withdrawAll()` | Withdraw all unlocked vaults in one tx |
| `getActiveVaults(address)` | Returns `(ids[], balances[], unlockTimes[])` |
| `getVault(address, uint256)` | Returns `(amount, unlockTime, active, isUnlocked)` |

---

## Project Structure

```
src/
├── app/
│   ├── layout.jsx          # Root layout with Providers
│   ├── page.jsx            # Main page — tab router
│   ├── providers.jsx       # WagmiProvider + RainbowKitProvider + QueryClient
│   └── globals.css         # All custom CSS (design tokens, components)
├── lib/
│   ├── wagmi.js            # wagmi config + chain setup
│   ├── contract.js         # Contract address + full ABI
│   └── utils.js            # Formatting helpers
├── hooks/
│   ├── useVaults.js        # useReadContract → active vaults
│   ├── useHistory.js       # eth_getLogs → on-chain event history
│   ├── useVaultMeta.js     # localStorage → labels, goals, price snapshots
│   ├── useNotifications.js # Browser Notification API → unlock alerts
│   └── useToast.js         # In-app toast notifications
└── components/
    ├── layout/             # Header (ConnectButton) + Footer
    ├── deposit/            # DepositForm (useWriteContract)
    ├── vault/              # VaultCard, VaultList, WithdrawAll
    ├── chart/              # VaultChart (bar), PortfolioChart (line + P&L)
    ├── history/            # TransactionHistory feed
    ├── stats/              # StatsGrid
    └── ui/                 # Modal, Toast, NetworkInfo, ProofOfLock
```

---

## How It Works

### Deposits
1. User enters an ETH amount and unlock date
2. A confirmation modal shows exact values before submission
3. `useWriteContract` sends `deposit(unlockTime)` with the ETH value attached
4. `useWaitForTransactionReceipt` polls until the tx is mined
5. wagmi's gas estimation uses a real Sepolia RPC — no Infura inflation

### Withdrawals
1. `getActiveVaults` returns all vaults for the connected address
2. Vaults past their `unlockTime` show a Withdraw button
3. Individual `withdraw(vaultId)` or batch `withdrawAll()` — both confirmed in-app

### History
- `useHistory` calls `eth_getLogs` with the contract address and the user's address as a topic filter
- Block timestamps are fetched in parallel for each unique block
- Events are decoded from raw hex ABI data without any indexer dependency

### Proof-of-Lock
- The Verify tab lets anyone paste a wallet address
- `useReadContract` fetches their vaults directly from the chain — no backend, no API key
- A shareable URL is generated that pre-fills the address for instant verification

---

## License

MIT
