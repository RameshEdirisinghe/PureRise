import { useState, useEffect } from 'react';
import axios from 'axios';
import type { CampaignResponse } from '../api/campaign';

interface UsePublicCampaignsResult {
  campaigns: CampaignResponse[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches active campaigns from the public API endpoint.
 * Does NOT require authentication — safe to use on the landing page.
 * Shows up to `limit` campaigns (default: 3).
 */
export const usePublicCampaigns = (limit = 3): UsePublicCampaignsResult => {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:5000/api';
        const { data } = await axios.get<{
          success: boolean;
          message: string;
          data: CampaignResponse[];
        }>(`${baseUrl}/campaigns/active`, {
          withCredentials: false,
          timeout: 8_000,
        });

        if (!cancelled) {
          setCampaigns((data.data ?? []).slice(0, limit));
        }
      } catch (err: any) {
        if (!cancelled) {
          const isOffline =
            err.code === 'ERR_NETWORK' ||
            err.message === 'Network Error' ||
            err.code === 'ECONNABORTED';
          setError(isOffline ? 'offline' : 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCampaigns();
    return () => { cancelled = true; };
  }, [limit]);

  return { campaigns, loading, error };
};
