import { ethers } from 'ethers';
import { getContractInstance, ensureSepoliaNetwork } from '../utils/web3';
import { ethToWei } from '../utils/formatters';

// Types

export interface TxResult {
  success: boolean;
  txHash:  string | null;
  error:   string | null;
}

// Error Parsing
const parseContractError = (err: unknown): string => {
  if (!(err instanceof Error)) return 'An unexpected error occurred.';

  const e = err as Error & { code?: string | number; reason?: string; data?: { message?: string } };

  if (e.code === 'ACTION_REJECTED' || e.code === 4001) {
    return 'You cancelled the transaction.';
  }

  if (e.reason) return e.reason;

  const revertMatch = e.message.match(/execution reverted(?:: "?([^"]+)"?)?/i);
  if (revertMatch) {
    return revertMatch[1]?.trim() ?? 'Transaction reverted by the contract.';
  }

  const reasonMatch = e.message.match(/reason="([^"]+)"/);
  if (reasonMatch) return reasonMatch[1];

  return e.message;
};

// Write Functions
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

//not use yet
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
