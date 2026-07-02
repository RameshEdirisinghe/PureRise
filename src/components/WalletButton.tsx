import { useState } from 'react';
import { Wallet, AlertTriangle, ExternalLink, LogOut, Copy, Check } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

// ── Helper ────────────────────────────────────────────────────────────────────
const truncateAddress = (addr: string): string =>
  `${addr.slice(0, 6)}…${addr.slice(-4)}`;

// ── Sub-components ────────────────────────────────────────────────────────────

const NotInstalledState = () => (
  <a
    href="https://metamask.io/download/"
    target="_blank"
    rel="noopener noreferrer"
    id="install-metamask-btn"
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
               bg-amber-50 border border-amber-200 text-amber-700
               hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 group"
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
      alt="MetaMask"
      className="w-4 h-4"
    />
    Install MetaMask
    <ExternalLink size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
  </a>
);

const ConnectingState = () => (
  <button
    disabled
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
               bg-brand-50 border border-brand-200 text-brand-600 cursor-not-allowed"
  >
    <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    Connecting…
  </button>
);

const WrongNetworkState = ({ onSwitch }: { onSwitch: () => void }) => (
  <button
    id="switch-network-btn"
    onClick={onSwitch}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
               bg-red-50 border border-red-200 text-red-600
               hover:bg-red-100 hover:border-red-300 transition-all duration-200 animate-pulse"
  >
    <AlertTriangle size={13} />
    Wrong Network — Switch to Sepolia
  </button>
);

const ConnectedState = ({
  address,
  onDisconnect,
}: {
  address: string;
  onDisconnect: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Connected pill — click to open dropdown */}
      <button
        id="wallet-address-btn"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold
                   bg-emerald-50 border border-emerald-200 text-emerald-700
                   hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200"
      >
        {/* Live indicator dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Wallet size={12} />
        {truncateAddress(address)}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 z-50 w-56 rounded-2xl bg-white border border-slate-100
                       shadow-xl shadow-black/10 overflow-hidden animate-in slide-in-from-top-2 duration-150"
          >
            {/* Address display */}
            <div className="px-4 py-3 border-b border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Connected Wallet
              </p>
              <p className="text-xs font-mono text-ink break-all">{address}</p>
            </div>

            {/* Actions */}
            <div className="p-1.5">
              <button
                id="copy-address-btn"
                onClick={copyAddress}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600
                           hover:bg-slate-50 transition-colors font-medium"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>

              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                id="view-on-etherscan-btn"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600
                           hover:bg-slate-50 transition-colors font-medium"
              >
                <ExternalLink size={14} />
                View on Etherscan
              </a>

              <div className="h-px bg-slate-100 my-1" />

              <button
                id="disconnect-wallet-btn"
                onClick={() => { setOpen(false); onDisconnect(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500
                           hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const DisconnectedState = ({
  onConnect,
  isConnecting,
  compact = false,
}: {
  onConnect: () => void;
  isConnecting: boolean;
  compact?: boolean;
}) => (
  <button
    id="connect-wallet-btn"
    onClick={onConnect}
    disabled={isConnecting}
    className={`inline-flex items-center gap-2 font-bold transition-all duration-200 disabled:opacity-60
      ${compact
        ? 'px-3 py-2 rounded-xl text-xs bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20'
        : 'px-5 py-2.5 rounded-xl text-sm bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98]'
      }`}
  >
    <Wallet size={compact ? 13 : 15} />
    {isConnecting ? 'Connecting…' : 'Connect Wallet'}
  </button>
);

// ── Main WalletButton ─────────────────────────────────────────────────────────
interface WalletButtonProps {
  /** Renders a smaller version for use in navbars/headers */
  compact?: boolean;
  /** Extra CSS classes */
  className?: string;
}

export const WalletButton = ({ compact = false, className = '' }: WalletButtonProps) => {
  const {
    status,
    walletAddress,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  } = useWallet();

  return (
    <div className={className}>
      {status === 'not_installed' && <NotInstalledState />}
      {status === 'connecting' && <ConnectingState />}
      {status === 'wrong_network' && <WrongNetworkState onSwitch={switchToSepolia} />}
      {status === 'connected' && walletAddress && (
        <ConnectedState address={walletAddress} onDisconnect={disconnectWallet} />
      )}
      {status === 'disconnected' && (
        <DisconnectedState
          onConnect={connectWallet}
          isConnecting={isConnecting}
          compact={compact}
        />
      )}
    </div>
  );
};

export default WalletButton;
