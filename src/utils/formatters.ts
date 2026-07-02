import { ethers } from 'ethers';

// ── ETH / Wei Conversions ─────────────────────────────────────────────────────

/**
 * Converts a wei value (bigint from the contract) to a human-readable ETH string.
 * Uses ethers v6 formatEther.
 *
 * @example weiToEth(1000000000000000000n) // "1.0"
 */
export const weiToEth = (wei: bigint): string => ethers.formatEther(wei);

/**
 * Converts an ETH amount (string | number) to wei (bigint).
 * Uses ethers v6 parseEther.
 *
 * @example ethToWei("0.05") // 50000000000000000n
 */
export const ethToWei = (eth: string | number): bigint =>
  ethers.parseEther(eth.toString());

// ── MongoDB ObjectId ↔ uint256 ────────────────────────────────────────────────

/**
 * Converts a MongoDB ObjectId (24-char lowercase hex string) to a uint256 BigInt
 * that can be passed as `campaignId` to the PureRaise contract.
 *
 * ### How it works
 * A MongoDB ObjectId is a 12-byte (96-bit) value expressed as a 24-character
 * hex string. We simply prepend "0x" and parse it as a JavaScript BigInt:
 *
 *   BigInt("0x" + "507f1f77bcf86cd799439011")
 *   // → 97368452373261641260736017n
 *
 * ### Size & collision notes
 * - 12 bytes = 96 bits, which fits comfortably in uint256 (256 bits). No truncation.
 * - MongoDB ObjectIds are globally unique by construction (timestamp + machineId +
 *   process + counter), so collision risk at the contract level is negligible.
 * - The mapping is deterministic and reversible: the same ObjectId always produces
 *   the same uint256, and you can recover the hex with .toString(16).padStart(24, '0').
 *
 * @param mongoObjectId - 24-character lowercase hex string (_id from MongoDB)
 * @returns BigInt suitable for uint256 contract parameter
 */
export const mongoIdToUint256 = (mongoObjectId: string): bigint => {
  if (!/^[0-9a-f]{24}$/i.test(mongoObjectId)) {
    throw new Error(
      `Invalid MongoDB ObjectId: expected 24-char hex string, got "${mongoObjectId}"`
    );
  }
  return BigInt('0x' + mongoObjectId);
};

/**
 * Reverse of mongoIdToUint256 — converts a uint256 BigInt back to a 24-char hex string.
 *
 * @param campaignId - uint256 BigInt from the contract
 * @returns 24-character lowercase hex string (MongoDB ObjectId)
 */
export const uint256ToMongoId = (campaignId: bigint): string =>
  campaignId.toString(16).padStart(24, '0');
