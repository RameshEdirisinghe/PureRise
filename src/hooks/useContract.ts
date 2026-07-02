import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { getContract } from '../lib/contract';
import { toast } from 'react-hot-toast';

// ── Error Codes ───────────────────────────────────────────────────────────────
const USER_REJECTED_CODE = 'ACTION_REJECTED'; // ethers v6 error code

// ── Error Helper ──────────────────────────────────────────────────────────────
const parseContractError = (err: unknown): string => {
  if (err instanceof Error) {
    // ethers v6 user rejection
    if ((err as unknown as { code?: string }).code === USER_REJECTED_CODE) {
      return 'Transaction cancelled by user.';
    }
    // Revert reason embedded in message
    const revertMatch = err.message.match(/reason="([^"]+)"/);
    if (revertMatch) return revertMatch[1];
    // Generic ethers / RPC error
    return err.message;
  }
  return 'An unexpected error occurred.';
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useContract = () => {
  const { signer, isConnected, isCorrectNetwork, connectWallet } = useWallet();

  /** Validates that the wallet is ready before any transaction */
  const assertReady = useCallback((): ethers.JsonRpcSigner => {
    if (!isConnected) {
      throw new Error('Please connect your MetaMask wallet first.');
    }
    if (!isCorrectNetwork) {
      throw new Error('Please switch to the Sepolia Testnet before proceeding.');
    }
    if (!signer) {
      throw new Error('Wallet signer unavailable. Please reconnect.');
    }
    return signer;
  }, [isConnected, isCorrectNetwork, signer]);

  // ── Create Campaign On-Chain ──────────────────────────────────────────────────
  /**
   * Creates a new campaign on the smart contract.
   * Triggers MetaMask confirmation popup.
   *
   * @param title       - Campaign title
   * @param description - Campaign description
   * @param goalEth     - Funding goal in ETH (will be converted to wei)
   * @param deadlineTs  - Unix timestamp for campaign deadline
   * @returns Transaction receipt + campaignId from event log
   */
  const createCampaignOnChain = useCallback(
    async (
      title: string,
      description: string,
      goalEth: number,
      deadlineTs: number
    ): Promise<{ txHash: string; campaignId: bigint | null }> => {
      const s = assertReady();
      const contract = getContract(s);
      const goalWei = ethers.parseEther(goalEth.toString());

      const toastId = toast.loading('Confirm the transaction in MetaMask…');
      try {
        const tx: ethers.ContractTransactionResponse = await contract.createCampaign(
          title,
          description,
          goalWei,
          BigInt(deadlineTs)
        );

        toast.loading('Transaction submitted. Waiting for confirmation…', { id: toastId });
        const receipt = await tx.wait();

        toast.success('Campaign deployed on-chain!', { id: toastId });

        // Extract campaignId from the CampaignCreated event
        let campaignId: bigint | null = null;
        if (receipt) {
          const iface = contract.interface;
          for (const log of receipt.logs) {
            try {
              const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
              if (parsed?.name === 'CampaignCreated') {
                campaignId = parsed.args[0] as bigint;
                break;
              }
            } catch {
              // log may not match this contract's ABI
            }
          }
        }

        return { txHash: tx.hash, campaignId };
      } catch (err) {
        const message = parseContractError(err);
        toast.error(message, { id: toastId });
        throw new Error(message);
      }
    },
    [assertReady]
  );

  // ── Donate On-Chain ───────────────────────────────────────────────────────────
  /**
   * Donates ETH to a campaign.
   * Triggers MetaMask confirmation popup.
   *
   * @param campaignId - On-chain campaign ID (uint256)
   * @param amountEth  - Amount to donate in ETH
   * @returns Transaction hash
   */
  const donateOnChain = useCallback(
    async (campaignId: number | bigint, amountEth: number): Promise<string> => {
      const s = assertReady();
      const contract = getContract(s);
      const value = ethers.parseEther(amountEth.toString());

      const toastId = toast.loading('Confirm the donation in MetaMask…');
      try {
        const tx: ethers.ContractTransactionResponse = await contract.donate(
          BigInt(campaignId),
          { value }
        );

        toast.loading('Donation submitted. Waiting for confirmation…', { id: toastId });
        await tx.wait();

        toast.success(`Donated ${amountEth} ETH successfully!`, { id: toastId });
        return tx.hash;
      } catch (err) {
        const message = parseContractError(err);
        toast.error(message, { id: toastId });
        throw new Error(message);
      }
    },
    [assertReady]
  );

  // ── Withdraw On-Chain ─────────────────────────────────────────────────────────
  /**
   * Campaign owner withdraws raised funds.
   * Triggers MetaMask confirmation popup.
   *
   * @param campaignId - On-chain campaign ID (uint256)
   * @returns Transaction hash
   */
  const withdrawOnChain = useCallback(
    async (campaignId: number | bigint): Promise<string> => {
      const s = assertReady();
      const contract = getContract(s);

      const toastId = toast.loading('Confirm the withdrawal in MetaMask…');
      try {
        const tx: ethers.ContractTransactionResponse = await contract.withdraw(
          BigInt(campaignId)
        );

        toast.loading('Withdrawal submitted. Waiting for confirmation…', { id: toastId });
        await tx.wait();

        toast.success('Funds withdrawn successfully!', { id: toastId });
        return tx.hash;
      } catch (err) {
        const message = parseContractError(err);
        toast.error(message, { id: toastId });
        throw new Error(message);
      }
    },
    [assertReady]
  );

  // ── Connect helper exposed for components ─────────────────────────────────────
  const ensureConnected = useCallback(async (): Promise<boolean> => {
    if (isConnected && isCorrectNetwork) return true;
    await connectWallet();
    return false; // caller should re-check after this
  }, [isConnected, isCorrectNetwork, connectWallet]);

  return {
    createCampaignOnChain,
    donateOnChain,
    withdrawOnChain,
    ensureConnected,
    isReady: isConnected && isCorrectNetwork && signer !== null,
  };
};

export default useContract;
