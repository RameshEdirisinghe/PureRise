import { ethers } from 'ethers';

// ── Sepolia Testnet Configuration ─────────────────────────────────────────────
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'; // hex for wallet_switchEthereumChain

/**
 * Contract address on Sepolia Testnet.
 * Set VITE_CONTRACT_ADDRESS in your .env file.
 */
export const CONTRACT_ADDRESS: string =
  import.meta.env.VITE_CONTRACT_ADDRESS ?? '';

// ── Minimal ABI ───────────────────────────────────────────────────────────────
// Replace / extend with your actual contract ABI.
// These are the expected function signatures for PureRaise campaigns.
export const CONTRACT_ABI: ethers.InterfaceAbi = [
  // Create a new campaign
  {
    name: 'createCampaign',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'title',       type: 'string'  },
      { name: 'description', type: 'string'  },
      { name: 'goal',        type: 'uint256' }, // in wei
      { name: 'deadline',    type: 'uint256' }, // unix timestamp
    ],
    outputs: [{ name: 'campaignId', type: 'uint256' }],
  },

  // Donate ETH to a campaign
  {
    name: 'donate',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'campaignId', type: 'uint256' }],
    outputs: [],
  },

  // Campaign owner withdraws raised funds
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'campaignId', type: 'uint256' }],
    outputs: [],
  },

  // Read campaign details
  {
    name: 'getCampaign',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'campaignId', type: 'uint256' }],
    outputs: [
      { name: 'owner',       type: 'address' },
      { name: 'title',       type: 'string'  },
      { name: 'description', type: 'string'  },
      { name: 'goal',        type: 'uint256' },
      { name: 'raised',      type: 'uint256' },
      { name: 'deadline',    type: 'uint256' },
      { name: 'withdrawn',   type: 'bool'    },
    ],
  },

  // Read total number of campaigns
  {
    name: 'campaignCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },

  // Events
  {
    name: 'CampaignCreated',
    type: 'event',
    inputs: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'owner',      type: 'address', indexed: true },
      { name: 'goal',       type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'DonationReceived',
    type: 'event',
    inputs: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'donor',      type: 'address', indexed: true },
      { name: 'amount',     type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'FundsWithdrawn',
    type: 'event',
    inputs: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'amount',     type: 'uint256', indexed: false },
    ],
  },
];

// ── Contract Factory ──────────────────────────────────────────────────────────
/**
 * Returns an ethers.js v6 Contract instance connected to the given signer.
 * Every method call will automatically require MetaMask confirmation.
 *
 * @param signer - ethers.JsonRpcSigner obtained from WalletContext
 */
export const getContract = (signer: ethers.JsonRpcSigner): ethers.Contract => {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'Contract address not configured. Set VITE_CONTRACT_ADDRESS in your .env file.'
    );
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Returns a read-only contract instance (no signer needed — useful for public data).
 */
export const getReadOnlyContract = (): ethers.Contract => {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'Contract address not configured. Set VITE_CONTRACT_ADDRESS in your .env file.'
    );
  }
  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY ?? ''}`
  );
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};
