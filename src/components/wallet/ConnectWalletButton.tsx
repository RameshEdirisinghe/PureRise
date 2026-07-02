import React from 'react';
import { Wallet, LogOut, AlertTriangle, Loader2 } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

/**
 * ConnectWalletButton
 *
 * Renders a context-aware button for MetaMask wallet management:
 * - Not installed → link to MetaMask.io
 * - Disconnected  → "Connect Wallet" button
 * - Connecting    → loading spinner
 * - Wrong network → "Switch to Sepolia" button
 * - Connected     → abbreviated address + disconnect button
 */
const ConnectWalletButton: React.FC = () => {
  const {
    walletAddress,
    status,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  } = useWallet();

  // ── Not installed ──────────────────────────────────────────────────────────
  if (status === 'not_installed') {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="connect-wallet-btn connect-wallet-btn--install"
      >
        <Wallet size={16} />
        Install MetaMask
      </a>
    );
  }

  // ── Connecting ─────────────────────────────────────────────────────────────
  if (isConnecting) {
    return (
      <button
        disabled
        className="connect-wallet-btn connect-wallet-btn--loading"
        aria-label="Connecting wallet"
      >
        <Loader2 size={16} className="spin" />
        Connecting…
      </button>
    );
  }

  // ── Wrong network ──────────────────────────────────────────────────────────
  if (status === 'wrong_network') {
    return (
      <button
        onClick={switchToSepolia}
        className="connect-wallet-btn connect-wallet-btn--wrong-network"
        aria-label="Switch to Sepolia testnet"
      >
        <AlertTriangle size={16} />
        Switch to Sepolia
      </button>
    );
  }

  // ── Connected ──────────────────────────────────────────────────────────────
  if (status === 'connected' && walletAddress) {
    const short = `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
    return (
      <div className="connect-wallet-connected">
        <span className="connect-wallet-address" title={walletAddress}>
          <Wallet size={14} />
          {short}
        </span>
        <button
          onClick={disconnectWallet}
          className="connect-wallet-btn connect-wallet-btn--disconnect"
          aria-label="Disconnect wallet"
          title="Disconnect wallet"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  // ── Disconnected (default) ─────────────────────────────────────────────────
  return (
    <button
      onClick={connectWallet}
      className="connect-wallet-btn connect-wallet-btn--connect"
      aria-label="Connect MetaMask wallet"
    >
      <Wallet size={16} />
      Connect Wallet
    </button>
  );
};

export default ConnectWalletButton;
