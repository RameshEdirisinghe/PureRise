import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK, SEPOLIA_CHAIN_ID_HEX } from '../lib/contract';

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Returns an ethers v6 BrowserProvider wrapping window.ethereum.
 * Throws if MetaMask (or compatible wallet) is not installed.
 */
export const getProvider = (): ethers.BrowserProvider => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed. Please install it to continue.');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

// ── Signer ────────────────────────────────────────────────────────────────────

/**
 * Returns the active MetaMask signer.
 * Will prompt MetaMask to connect if not already connected.
 */
export const getSigner = async (): Promise<ethers.JsonRpcSigner> => {
  const provider = getProvider();
  return provider.getSigner();
};

// ── Contract ──────────────────────────────────────────────────────────────────

/**
 * Returns an ethers Contract instance.
 *
 * @param withSigner - if true, attaches a signer for write operations;
 *                     if false, uses a read-only BrowserProvider.
 */
export const getContractInstance = async (
  withSigner = false
): Promise<ethers.Contract> => {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'Contract address not configured. Set VITE_CONTRACT_ADDRESS in your .env file.'
    );
  }

  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// ── Network Helper ────────────────────────────────────────────────────────────

/**
 * Checks the current chainId and:
 *  1. If already on Sepolia → returns immediately.
 *  2. If Sepolia exists in MetaMask → prompts wallet_switchEthereumChain.
 *  3. If Sepolia is not added → calls wallet_addEthereumChain first.
 *
 * Always call this before any write transaction.
 */
export const ensureSepoliaNetwork = async (): Promise<void> => {
  const eth = window.ethereum;
  if (!eth) throw new Error('MetaMask is not installed.');

  const provider = getProvider();
  const network  = await provider.getNetwork();
  const current  = Number(network.chainId);

  if (current === Number(BigInt(SEPOLIA_CHAIN_ID_HEX))) return; // already on Sepolia

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (switchErr: unknown) {
    const err = switchErr as { code?: number };

    if (err?.code === 4902) {
      // Sepolia not added to MetaMask yet — add it
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId:            NETWORK.chainIdHex,
            chainName:          NETWORK.name,
            nativeCurrency:     NETWORK.currency,
            rpcUrls:            [NETWORK.rpcUrl],
            blockExplorerUrls:  [NETWORK.explorerUrl],
          },
        ],
      });
    } else if (err?.code === 4001) {
      throw new Error('Network switch rejected. Please switch to Sepolia manually.');
    } else {
      throw new Error('Failed to switch to Sepolia network.');
    }
  }
};
