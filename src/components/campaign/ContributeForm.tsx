import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWallet } from '../../context/WalletContext';
import { contributeToCampaign } from '../../services/campaignContractService';
import { mongoIdToUint256 } from '../../utils/formatters';
import { recordContributionApi } from '../../api/campaign';

interface ContributeFormProps {
  campaignMongoId: string;
  onSuccess?: (txHash: string) => void;
}

const PRESET_AMOUNTS = ['0.01', '0.05', '0.1', '0.25', '0.5', '1.0'];

const ContributeForm: React.FC<ContributeFormProps> = ({ campaignMongoId, onSuccess }) => {
  const { isConnected, connectWallet, walletAddress } = useWallet();
  const [amount, setAmount]       = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first.');
      await connectWallet();
      return;
    }

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Please enter a valid ETH amount greater than 0.');
      return;
    }

    setIsPending(true);
    const toastId = toast.loading('Confirm the donation in MetaMask…');

    try {
      const campaignId = mongoIdToUint256(campaignMongoId);
      const result     = await contributeToCampaign(campaignId, amount);

      if (result.success && result.txHash) {
        toast.success(`Donated ${amount} ETH! Tx: ${result.txHash.slice(0, 10)}…`, {
          id:       toastId,
          duration: 6000,
        });

        // Record in DB for identity association (non-fatal)
        if (walletAddress) {
          await recordContributionApi(campaignMongoId, {
            walletAddress,
            amountEth: amount,
            txHash: result.txHash,
          });
        }

        setAmount('');
        onSuccess?.(result.txHash);
      } else {
        toast.error(result.error ?? 'Contribution failed.', { id: toastId });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unexpected error.', { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Contribute to campaign">
      {/* Preset buttons */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          Select Recommended Donation
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                amount === preset
                  ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                  : 'bg-white text-slate-600 border-slate-100 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {preset} ETH
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contribution-amount" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          Or Enter Custom Amount
        </label>
        <div className="relative group">
          <input
            id="contribution-amount"
            type="number"
            min="0.001"
            step="0.001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 text-lg font-bold text-ink focus:border-brand-500 focus:bg-white transition-all outline-none"
            aria-describedby="contribution-hint"
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-600">ETH</span>
        </div>
        <p id="contribution-hint" className="text-[10px] text-slate-400 font-medium ml-1" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          Minimum: 0.001 ETH · Network: Sepolia
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending || !amount}
        className="w-full py-5 bg-brand-500 text-white rounded-[24px] font-bold text-lg hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/30 uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            Back This Project
          </>
        )}
      </button>
      <p className="text-[10px] text-center text-slate-400 font-medium" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        By contributing, you agree to our Terms of Use and Risk Disclosure.
      </p>
    </form>
  );
};

export default ContributeForm;
