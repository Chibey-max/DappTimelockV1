export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_unlockTime', type: 'uint256' }],
    name: 'deposit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_vaultId', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawAll',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' },
             { internalType: 'uint256', name: '_vaultId', type: 'uint256' }],
    name: 'getVault',
    outputs: [
      { internalType: 'uint256', name: 'amount',     type: 'uint256' },
      { internalType: 'uint256', name: 'unlockTime', type: 'uint256' },
      { internalType: 'bool',    name: 'active',     type: 'bool'    },
      { internalType: 'bool',    name: 'isUnlocked', type: 'bool'    },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getActiveVaults',
    outputs: [
      { internalType: 'uint256[]', name: 'activeVaults', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'balances',     type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'unlockTimes',  type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getTotalBalance',
    outputs: [{ internalType: 'uint256', name: 'total', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getUnlockedBalance',
    outputs: [{ internalType: 'uint256', name: 'unlocked', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const NETWORKS = {
  1:        { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
  11155111: { name: 'Sepolia Testnet',  explorer: 'https://sepolia.etherscan.io' },
};
