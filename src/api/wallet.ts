import api from './axios';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface WalletSaveResponse {
  message: string;
  data: {
    walletAddress: string;
    isWalletConnected: boolean;
  };
}

// ── Save / link wallet address to the logged-in user ───────────────────────────
export const saveWalletAddressApi = async (address: string): Promise<WalletSaveResponse> => {
  const { data } = await api.patch<WalletSaveResponse>('/auth/wallet', { walletAddress: address });
  return data;
};

// ── Remove / unlink wallet address from the logged-in user ─────────────────────
export const removeWalletAddressApi = async (): Promise<void> => {
  await api.delete('/auth/wallet');
};
