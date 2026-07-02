import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWallet } from '../../context/WalletContext';
import { contributeToCampaign } from '../../services/campaignContractService';
import { mongoIdToUint256 } from '../../utils/formatters';

interface ContributeFormProps {
  /** MongoDB _id of the campaign (24-char hex string) */
  campaignMongoId: string;
  /** Optional callback invoked after a successful contribution */
  onSuccess?: (txHash: string) => void;
}

/**
 * ContributeForm
 *
 * Lets a connected donor enter an ETH amount and donate to a campaign.
 * - Validates input (positive number, reasonable precision).
 * - Converts the MongoDB _id to a uint256 campaignId internally.
 * - Shows MetaMask-confirmation feedback via react-hot-toast.
 * - Returns { success, txHash, error } and delegates UI feedback to toasts.
 */
const ContributeForm: React.FC<ContributeFormProps> = ({ campaignMongoId, onSuccess }) => {
  const { isConnected, connectWallet } = useWallet();
  const [amount, setAmount]     = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Wallet guard ────────────────────────────────────────────────────────
    if (!isConnected) {
      toast.error('Please connect your wallet first.');
      await connectWallet();
      return;
    }

    // ── Input validation ────────────────────────────────────────────────────
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
    <form onSubmit={handleSubmit} className="contribute-form" aria-label="Contribute to campaign">
      <div className="contribute-form__field">
        <label htmlFor="contribution-amount" className="contribute-form__label">
          Contribution Amount (ETH)
        </label>
        <div className="contribute-form__input-wrap">
          <input
            id="contribution-amount"
            type="number"
            min="0"
            step="0.001"
            placeholder="0.05"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            className="contribute-form__input"
            aria-describedby="contribution-hint"
          />
          <span className="contribute-form__unit">ETH</span>
        </div>
        <p id="contribution-hint" className="contribute-form__hint">
          Minimum: 0.001 ETH · Network: Sepolia
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending || !amount}
        className="contribute-form__submit"
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="spin" />
            Processing…
          </>
        ) : (
          <>
            <Send size={16} />
            Contribute
          </>
        )}
      </button>
    </form>
  );
};

export default ContributeForm;
