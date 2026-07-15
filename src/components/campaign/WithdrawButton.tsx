import React, { useState } from 'react';
import { Loader2, ArrowDownToLine, Wallet, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWallet } from '../../context/WalletContext';
import { withdrawCampaignFunds } from '../../services/campaignContractService';
import { mongoIdToUint256 } from '../../utils/formatters';

interface WithdrawButtonProps {
  campaignMongoId: string;
  campaignOwner:   string;
  availableEth:    string;
  onSuccess?: (txHash: string) => void;
}

const WithdrawButton: React.FC<WithdrawButtonProps> = ({
  campaignMongoId,
  campaignOwner,
  availableEth,
  onSuccess,
}) => {
  const { walletAddress, isConnected, connectWallet, status } = useWallet();
  const [amount, setAmount]       = useState('');
  const [isPending, setIsPending] = useState(false);

  // ── Case 1: Wallet not connected ─────────────────────────────────────────────
  if (!isConnected || !walletAddress) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-medium text-amber-700">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
          Connect your wallet to withdraw funds
        </div>
        <button
          onClick={connectWallet}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all"
        >
          <Wallet size={16} />
          Connect Wallet
        </button>
      </div>
    );
  }

  // ── Case 2: Wrong network ─────────────────────────────────────────────────────
  if (status === 'wrong_network') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl border border-red-200 text-xs font-medium text-red-700">
        <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
        Please switch to the Sepolia network in MetaMask.
      </div>
    );
  }

  // ── Case 3: Wrong wallet (not the campaign owner) ─────────────────────────────
  const isOwner =
    walletAddress.toLowerCase() === campaignOwner?.toLowerCase();

  if (!isOwner) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl border border-red-200 text-xs font-medium text-red-700">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <span>
            Connected wallet does not match the campaign owner.
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono px-1">
          <span className="font-bold text-slate-500">Expected:</span> {campaignOwner?.slice(0, 10)}…{campaignOwner?.slice(-6)}
        </p>
        <p className="text-[10px] text-slate-400 font-mono px-1">
          <span className="font-bold text-slate-500">Connected:</span> {walletAddress?.slice(0, 10)}…{walletAddress?.slice(-6)}
        </p>
      </div>
    );
  }

  // ── Case 4: Owner is connected — show withdraw form ───────────────────────────
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Please enter a valid ETH amount.');
      return;
    }

    const available = parseFloat(availableEth);
    if (parsed > available) {
      toast.error(`Amount exceeds available funds (${availableEth} ETH).`);
      return;
    }

    setIsPending(true);
    const toastId = toast.loading('Confirm the withdrawal in MetaMask…');

    try {
      const campaignId = mongoIdToUint256(campaignMongoId);
      const result     = await withdrawCampaignFunds(campaignId, amount);

      if (result.success && result.txHash) {
        toast.success(`Withdrew ${amount} ETH! Tx: ${result.txHash.slice(0, 10)}…`, {
          id:       toastId,
          duration: 6000,
        });
        setAmount('');
        onSuccess?.(result.txHash);
      } else {
        toast.error(result.error ?? 'Withdrawal failed.', { id: toastId });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unexpected error.', { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  const handleSetMax = () => setAmount(availableEth);

  return (
    <form
      onSubmit={handleWithdraw}
      className="space-y-4"
      aria-label="Withdraw campaign funds"
    >
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
        <span>Available to withdraw</span>
        <span className="text-brand-600 font-black">{availableEth} ETH</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="withdraw-amount"
            type="number"
            min="0"
            step="0.0001"
            max={availableEth}
            placeholder={`0.0000`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-300 rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all pr-16"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
            ETH
          </span>
        </div>
        <button
          type="button"
          onClick={handleSetMax}
          disabled={isPending}
          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
        >
          MAX
        </button>
      </div>

      <button
        type="submit"
        disabled={isPending || !amount || parseFloat(amount) <= 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20"
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <ArrowDownToLine size={16} />
            Withdraw {amount ? `${amount} ETH` : 'Funds'}
          </>
        )}
      </button>
    </form>
  );
};

export default WithdrawButton;
