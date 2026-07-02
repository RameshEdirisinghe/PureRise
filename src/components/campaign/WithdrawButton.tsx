import React, { useState } from 'react';
import { Loader2, ArrowDownToLine } from 'lucide-react';
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
  const { walletAddress, isConnected } = useWallet();
  const [amount, setAmount]       = useState('');
  const [isPending, setIsPending] = useState(false);

  const isOwner =
    isConnected &&
    walletAddress !== null &&
    walletAddress.toLowerCase() === campaignOwner.toLowerCase();

  if (!isOwner) return null;

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

  return (
    <form
      onSubmit={handleWithdraw}
      className="withdraw-form"
      aria-label="Withdraw campaign funds"
    >
      <p className="withdraw-form__available">
        Available to withdraw: <strong>{availableEth} ETH</strong>
      </p>

      <div className="withdraw-form__field">
        <label htmlFor="withdraw-amount" className="withdraw-form__label">
          Withdraw Amount (ETH)
        </label>
        <div className="withdraw-form__input-wrap">
          <input
            id="withdraw-amount"
            type="number"
            min="0"
            step="0.001"
            max={availableEth}
            placeholder={availableEth}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending || availableEth === '0.0'}
            className="withdraw-form__input"
          />
          <span className="withdraw-form__unit">ETH</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !amount || availableEth === '0.0'}
        className="withdraw-form__submit"
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="spin" />
            Processing…
          </>
        ) : (
          <>
            <ArrowDownToLine size={16} />
            Withdraw Funds
          </>
        )}
      </button>
    </form>
  );
};

export default WithdrawButton;
