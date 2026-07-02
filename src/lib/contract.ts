import { ethers } from 'ethers';
import PureRaiseABI from '../contracts/PureRaiseABI.json';

// ── Sepolia Testnet Configuration ──────────────────────────────────────────────
export const SEPOLIA_CHAIN_ID     = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const NETWORK = {
  chainId:     SEPOLIA_CHAIN_ID,
  chainIdHex:  SEPOLIA_CHAIN_ID_HEX,
  name:        'Sepolia Testnet',
  rpcUrl:      'https://rpc.sepolia.org',
  explorerUrl: 'https://sepolia.etherscan.io',
  currency: {
    name:     'Sepolia ETH',
    symbol:   'ETH',
    decimals: 18,
  },
} as const;

/**
 * Contract address on Sepolia Testnet.
 * Sourced exclusively from VITE_CONTRACT_ADDRESS in your .env file.
 */
export const CONTRACT_ADDRESS: string =
  import.meta.env.VITE_CONTRACT_ADDRESS ?? '';

/**
 * Full ABI imported from src/contracts/PureRaiseABI.json.
 * Never inline the ABI in component or service files — import from here.
 */
export const CONTRACT_ABI: ethers.InterfaceAbi = PureRaiseABI as ethers.InterfaceAbi;

// ── Contract Factory ──────────────────────────────────────────────────────────

/** Returns a write-capable contract instance (requires a signer). */
export const getContract = (signer: ethers.JsonRpcSigner): ethers.Contract => {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'Contract address not configured. Set VITE_CONTRACT_ADDRESS in your .env file.'
    );
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/** Returns a read-only contract instance (no MetaMask / gas needed). */
export const getReadOnlyContract = (): ethers.Contract => {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'Contract address not configured. Set VITE_CONTRACT_ADDRESS in your .env file.'
    );
  }
  // Use BrowserProvider for read-only when MetaMask is available,
  // otherwise fall back to a public JSON-RPC endpoint.
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }
  const provider = new ethers.JsonRpcProvider(NETWORK.rpcUrl);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};
