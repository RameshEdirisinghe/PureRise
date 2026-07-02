import { ethers } from 'ethers';
import { getContractInstance, ensureSepoliaNetwork } from '../utils/web3';
import { ethToWei } from '../utils/formatters';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TxResult {
  success: boolean;
  txHash:  string | null;
  error:   string | null;
}

// ── Error Parsing ─────────────────────────────────────────────────────────────

/**
 * Extracts a human-friendly error message from an ethers v6 / EVM error.
 * - User rejection (ACTION_REJECTED / code 4001) → friendly cancel message.
 * - Contract revert with reason string  → extracts the require() message.
 * - Anything else                        → falls back to err.message.
 */
const parseContractError = (err: unknown): string => {
  if (!(err instanceof Error)) return 'An unexpected error occurred.';

  const e = err as Error & { code?: string | number; reason?: string; data?: { message?: string } };

  // ethers v6 user rejection
  if (e.code === 'ACTION_REJECTED' || e.code === 4001) {
    return 'You cancelled the transaction.';
  }

  // Revert reason from ethers v6 (e.reason) or embedded in message
  if (e.reason) return e.reason;

  // "execution reverted: <reason>" pattern in message
  const revertMatch = e.message.match(/execution reverted(?:: "?([^"]+)"?)?/i);
  if (revertMatch) {
    return revertMatch[1]?.trim() ?? 'Transaction reverted by the contract.';
  }

  // reason="…" pattern from older ethers formatting
  const reasonMatch = e.message.match(/reason="([^"]+)"/);
  if (reasonMatch) return reasonMatch[1];

  return e.message;
};

// ── Write Functions ───────────────────────────────────────────────────────────

/**
 * Sends ETH to the `contribute(uint256)` function on PureRaise.
 *
 * @param campaignId  - uint256 campaign ID (use mongoIdToUint256 to convert from MongoDB _id)
 * @param amountInEth - Amount to donate expressed in ETH, e.g. "0.05" or 0.05
 */
export const contributeToCampaign = async (
  campaignId: bigint | string | number,
  amountInEth: string | number
): Promise<TxResult> => {
  try {
    await ensureSepoliaNetwork();

    const contract  = await getContractInstance(true);
    const valueWei  = ethToWei(amountInEth);
    const id        = BigInt(campaignId);

    const tx: ethers.ContractTransactionResponse = await contract.contribute(id, { value: valueWei });

    const receipt = await tx.wait();

    return {
      success: true,
      txHash:  receipt?.hash ?? tx.hash,
      error:   null,
    };
  } catch (err) {
    return {
      success: false,
      txHash:  null,
      error:   parseContractError(err),
    };
  }
};

/**
 * Withdraws funds from a campaign via `withdrawFunds(uint256, uint256)`.
 * Only the campaign owner can call this; the contract will revert otherwise.
 *
 * @param campaignId  - uint256 campaign ID
 * @param amountInEth - Amount to withdraw in ETH
 */
export const withdrawCampaignFunds = async (
  campaignId: bigint | string | number,
  amountInEth: string | number
): Promise<TxResult> => {
  try {
    await ensureSepoliaNetwork();

    const contract   = await getContractInstance(true);
    const amountWei  = ethToWei(amountInEth);
    const id         = BigInt(campaignId);

    const tx: ethers.ContractTransactionResponse = await contract.withdrawFunds(id, amountWei);

    const receipt = await tx.wait();

    return {
      success: true,
      txHash:  receipt?.hash ?? tx.hash,
      error:   null,
    };
  } catch (err) {
    return {
      success: false,
      txHash:  null,
      error:   parseContractError(err),
    };
  }
};

/**
 * Claims a refund for the connected donor via `claimRefund(uint256)`.
 * Available only when a campaign has been cancelled.
 *
 * @param campaignId - uint256 campaign ID
 */
export const claimDonorRefund = async (
  campaignId: bigint | string | number
): Promise<TxResult> => {
  try {
    await ensureSepoliaNetwork();

    const contract = await getContractInstance(true);
    const id       = BigInt(campaignId);

    const tx: ethers.ContractTransactionResponse = await contract.claimRefund(id);

    const receipt = await tx.wait();

    return {
      success: true,
      txHash:  receipt?.hash ?? tx.hash,
      error:   null,
    };
  } catch (err) {
    return {
      success: false,
      txHash:  null,
      error:   parseContractError(err),
    };
  }
};

/**
 * Opens a campaign on-chain via `openCampaign(uint256)`.
 * Can be called by anyone (typically the campaign owner).
 *
 * @param campaignId    - uint256 campaign ID
 */
export const openCampaignOnChain = async (
  campaignId:   bigint | string | number
): Promise<TxResult> => {
  try {
    await ensureSepoliaNetwork();

    const contract = await getContractInstance(true);
    const id       = BigInt(campaignId);

    const tx: ethers.ContractTransactionResponse = await contract.openCampaign(id);

    const receipt = await tx.wait();

    return {
      success: true,
      txHash:  receipt?.hash ?? tx.hash,
      error:   null,
    };
  } catch (err) {
    return {
      success: false,
      txHash:  null,
      error:   parseContractError(err),
    };
  }
};
