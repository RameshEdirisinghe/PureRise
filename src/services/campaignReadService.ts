import { getContractInstance } from '../utils/web3';
import { weiToEth } from '../utils/formatters';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CampaignDetails {
  /** Campaign owner address (checksummed) */
  owner:      string;
  /** Total ETH raised (formatted, e.g. "1.5") */
  raised:     string;
  /** Total ETH withdrawn by owner (formatted) */
  withdrawn:  string;
  /** ETH currently available for withdrawal (formatted) */
  available:  string;
  /** Whether the campaign is currently active */
  active:     boolean;
  /** Whether the campaign has been cancelled */
  cancelled:  boolean;
}

// ── Read Functions ─────────────────────────────────────────────────────────────

/**
 * Calls `getCampaignDetails(uint256)` and returns human-readable ETH values.
 * No signer or gas required — read-only call.
 *
 * @param campaignId - uint256 campaign ID (use mongoIdToUint256 to convert)
 */
export const fetchCampaignDetails = async (
  campaignId: bigint | string | number
): Promise<CampaignDetails> => {
  const contract = await getContractInstance(false);
  const id       = BigInt(campaignId);

  const [owner, raisedWei, withdrawnWei, availableWei, active, cancelled] =
    await contract.getCampaignDetails(id);

  return {
    owner:     owner as string,
    raised:    weiToEth(raisedWei    as bigint),
    withdrawn: weiToEth(withdrawnWei as bigint),
    available: weiToEth(availableWei as bigint),
    active:    active    as boolean,
    cancelled: cancelled as boolean,
  };
};

/**
 * Calls `getDonorTotalContribution(address)` and returns ETH as a string.
 * Returns the sum of all contributions the donor has made across all campaigns.
 *
 * @param address - Donor Ethereum address
 */
export const fetchDonorTotalContribution = async (
  address: string
): Promise<string> => {
  const contract = await getContractInstance(false);
  const raw: bigint = await contract.getDonorTotalContribution(address);
  return weiToEth(raw);
};

/**
 * Calls `getContribution(uint256, address)` and returns the donor's contribution
 * to a specific campaign in ETH.
 *
 * @param campaignId - uint256 campaign ID
 * @param address    - Donor Ethereum address
 */
export const fetchDonorContribution = async (
  campaignId: bigint | string | number,
  address:    string
): Promise<string> => {
  const contract = await getContractInstance(false);
  const id       = BigInt(campaignId);
  const raw: bigint = await contract.getContribution(id, address);
  return weiToEth(raw);
};

/**
 * Calls `getAvailableFunds(uint256)` and returns the available ETH as a string.
 *
 * @param campaignId - uint256 campaign ID
 */
export const fetchAvailableFunds = async (
  campaignId: bigint | string | number
): Promise<string> => {
  const contract = await getContractInstance(false);
  const id       = BigInt(campaignId);
  const raw: bigint = await contract.getAvailableFunds(id);
  return weiToEth(raw);
};

// ── Event History ─────────────────────────────────────────────────────────────

export interface ContributionEvent {
  contributor: string;
  amount: string;
  txHash: string;
  blockNumber: number;
}

export interface WithdrawalEvent {
  owner: string;
  amount: string;
  txHash: string;
  blockNumber: number;
}

/**
 * Fetches all ContributionMade events for a specific campaign.
 */
export const fetchCampaignContributions = async (
  campaignId: bigint | string | number
): Promise<ContributionEvent[]> => {
  try {
    const contract = await getContractInstance(false);
    const id = BigInt(campaignId);
    const filter = contract.filters.ContributionMade(id);
    const events = await contract.queryFilter(filter, 0, 'latest'); // from block 0
    
    return events.map((event: any) => {
      const args = event.args || [];
      return {
        contributor: args[1] as string,
        amount: weiToEth(args[2] as bigint),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
      };
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return [];
  }
};

/**
 * Fetches all FundsWithdrawn events for a specific campaign.
 */
export const fetchCampaignWithdrawals = async (
  campaignId: bigint | string | number
): Promise<WithdrawalEvent[]> => {
  try {
    const contract = await getContractInstance(false);
    const id = BigInt(campaignId);
    const filter = contract.filters.FundsWithdrawn(id);
    const events = await contract.queryFilter(filter, 0, 'latest');
    
    return events.map((event: any) => {
      const args = event.args || [];
      return {
        owner: args[1] as string,
        amount: weiToEth(args[2] as bigint),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
      };
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return [];
  }
};

