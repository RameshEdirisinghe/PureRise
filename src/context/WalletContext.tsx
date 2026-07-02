import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX } from '../lib/contract';
import { saveWalletAddressApi, removeWalletAddressApi } from '../api/wallet';

// ── Constants ─────────────────────────────────────────────────────────────────
const WALLET_CONNECTED_KEY = 'purerise_wallet_connected';

// ── Types ──────────────────────────────────────────────────────────────────────
export type WalletStatus =
  | 'not_installed'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'wrong_network';

export interface WalletContextValue {
  /** Current MetaMask account address (lowercase), or null */
  walletAddress: string | null;
  /** Whether a wallet is connected and on the correct network */
  isConnected: boolean;
  /** Whether MetaMask is installed */
  isMetaMaskInstalled: boolean;
  /** Whether user is on Sepolia */
  isCorrectNetwork: boolean;
  /** Overall wallet status for UI rendering */
  status: WalletStatus;
  /** ethers.js signer — use this for all contract calls */
  signer: ethers.JsonRpcSigner | null;
  /** ethers.js provider */
  provider: ethers.BrowserProvider | null;
  /** Whether a connection is in progress */
  isConnecting: boolean;
  /** Trigger MetaMask connect flow */
  connectWallet: () => Promise<void>;
  /** Disconnect wallet from the app (does NOT disconnect MetaMask itself) */
  disconnectWallet: () => Promise<void>;
  /** Switch MetaMask to Sepolia */
  switchToSepolia: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getMetaMaskProvider = (): typeof window.ethereum | null => {
  if (typeof window === 'undefined') return null;
  if (typeof window.ethereum === 'undefined') return null;
  return window.ethereum;
};

const isInstalled = (): boolean => getMetaMaskProvider() !== null;

// ── Provider ──────────────────────────────────────────────────────────────────
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>('disconnected');
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const ethereum = getMetaMaskProvider();
  const metamaskInstalled = isInstalled();

  // Derive computed state
  const isCorrectNetwork = status === 'connected';
  const isConnected = status === 'connected';

  // Use ref to avoid stale closures in event handlers
  const addressRef = useRef<string | null>(null);
  addressRef.current = walletAddress;

  // ── Internal: set up provider + signer after address is known ────────────────
  const setupProvider = useCallback(
    async (address: string): Promise<void> => {
      const eth = getMetaMaskProvider();
      if (!eth) return;

      const bp = new ethers.BrowserProvider(eth);
      const network = await bp.getNetwork();
      const chainId = Number(network.chainId);

      setProvider(bp);

      if (chainId !== SEPOLIA_CHAIN_ID) {
        setStatus('wrong_network');
        setSigner(null);
        setWalletAddress(address);
        return;
      }

      const s = await bp.getSigner();
      setSigner(s);
      setWalletAddress(address);
      setStatus('connected');
    },
    []
  );

  // ── Internal: clear all wallet state ─────────────────────────────────────────
  const clearWalletState = useCallback(() => {
    setWalletAddress(null);
    setSigner(null);
    setProvider(null);
    setStatus(metamaskInstalled ? 'disconnected' : 'not_installed');
    localStorage.removeItem(WALLET_CONNECTED_KEY);
  }, [metamaskInstalled]);

  // ── Connect Wallet ────────────────────────────────────────────────────────────
  const connectWallet = useCallback(async (): Promise<void> => {
    const eth = getMetaMaskProvider();
    if (!eth) {
      toast.error('MetaMask is not installed. Please install it to continue.');
      return;
    }

    setIsConnecting(true);
    setStatus('connecting');

    try {
      // Request account access — triggers MetaMask popup
      const accounts: string[] = await eth.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MetaMask.');
      }

      const address = accounts[0].toLowerCase();
      await setupProvider(address);

      // Persist intent to auto-reconnect on refresh
      localStorage.setItem(WALLET_CONNECTED_KEY, 'true');

      // Save address to backend — link to logged-in user
      try {
        await saveWalletAddressApi(address);
      } catch (backendErr: unknown) {
        // Non-fatal: wallet is still usable even if backend save fails
        const msg =
          backendErr instanceof Error ? backendErr.message : 'Failed to save wallet on server.';
        toast.error(`Wallet connected but: ${msg}`);
      }

      toast.success('Wallet connected successfully!');
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };

      if (error?.code === 4001) {
        // User rejected the connection request
        toast.error('Connection rejected. Please approve MetaMask to continue.');
      } else if (error?.code === -32002) {
        // MetaMask is already showing a pending request
        toast.error('MetaMask is already open. Please check the extension.');
      } else {
        toast.error(error?.message ?? 'Failed to connect wallet.');
      }

      clearWalletState();
    } finally {
      setIsConnecting(false);
    }
  }, [setupProvider, clearWalletState]);

  // ── Disconnect Wallet ─────────────────────────────────────────────────────────
  const disconnectWallet = useCallback(async (): Promise<void> => {
    try {
      // Remove from backend
      await removeWalletAddressApi();
    } catch {
      // Non-fatal
    }
    clearWalletState();
    toast.success('Wallet disconnected.');
  }, [clearWalletState]);

  // ── Switch to Sepolia ─────────────────────────────────────────────────────────
  const switchToSepolia = useCallback(async (): Promise<void> => {
    const eth = getMetaMaskProvider();
    if (!eth) return;

    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (err: unknown) {
      const error = err as { code?: number };
      if (error?.code === 4902) {
        // Chain not in MetaMask — add it
        try {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID_HEX,
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch {
          toast.error('Failed to add Sepolia network to MetaMask.');
        }
      } else if (error?.code === 4001) {
        toast.error('Network switch rejected. Please switch to Sepolia manually.');
      } else {
        toast.error('Failed to switch network.');
      }
    }
  }, []);

  // ── Auto-reconnect on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!metamaskInstalled) {
      setStatus('not_installed');
      return;
    }

    const shouldReconnect = localStorage.getItem(WALLET_CONNECTED_KEY) === 'true';
    if (!shouldReconnect) {
      setStatus('disconnected');
      return;
    }

    // Silently reconnect using already-authorized accounts (no popup)
    const autoReconnect = async () => {
      const eth = getMetaMaskProvider();
      if (!eth) return;

      try {
        const accounts: string[] = (await eth.request({ method: 'eth_accounts' })) as string[];
        if (accounts && accounts.length > 0) {
          await setupProvider(accounts[0].toLowerCase());
        } else {
          // User disconnected MetaMask externally
          clearWalletState();
        }
      } catch {
        clearWalletState();
      }
    };

    autoReconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — runs only on mount

  // ── MetaMask Event Listeners ──────────────────────────────────────────────────
  useEffect(() => {
    const eth = getMetaMaskProvider();
    if (!eth) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        // User disconnected all accounts
        await disconnectWallet();
      } else {
        const newAddress = accounts[0].toLowerCase();
        if (newAddress !== addressRef.current) {
          // Account switched — update state
          await setupProvider(newAddress);
          try {
            await saveWalletAddressApi(newAddress);
          } catch {
            // Non-fatal
          }
          toast.success(`Switched to ${newAddress.slice(0, 6)}…${newAddress.slice(-4)}`);
        }
      }
    };

    const handleChainChanged = async () => {
      // Chain changed — re-evaluate network
      const addr = addressRef.current;
      if (addr) {
        await setupProvider(addr);
      }
    };

    eth.on('accountsChanged', handleAccountsChanged);
    eth.on('chainChanged', handleChainChanged);

    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged);
      eth.removeListener('chainChanged', handleChainChanged);
    };
  }, [setupProvider, disconnectWallet]);

  // ── Derived status when MetaMask not installed ────────────────────────────────
  useEffect(() => {
    if (!metamaskInstalled && status !== 'not_installed') {
      setStatus('not_installed');
    }
  }, [metamaskInstalled, status]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        isMetaMaskInstalled: metamaskInstalled,
        isCorrectNetwork,
        status,
        signer,
        provider,
        isConnecting,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useWallet = (): WalletContextValue => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
};

export default WalletContext;
