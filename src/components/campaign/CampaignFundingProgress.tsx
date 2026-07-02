import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchCampaignDetails, type CampaignDetails } from '../../services/campaignReadService';
import { mongoIdToUint256 } from '../../utils/formatters';

interface CampaignFundingProgressProps {
  /** MongoDB _id of the campaign (24-char hex string) */
  campaignMongoId: string;
  /**
   * Optional funding goal in ETH to render a progress bar.
   * If omitted, only raw raised/available numbers are shown.
   */
  goalEth?: string | number;
  /** Poll interval in ms (default: 0 = no polling). Set e.g. 30000 to refresh every 30s. */
  pollIntervalMs?: number;
}

/**
 * CampaignFundingProgress
 *
 * Read-only component — fetches on-chain funding state from getCampaignDetails.
 * All values displayed in ETH (never raw wei / BigInt).
 */
const CampaignFundingProgress: React.FC<CampaignFundingProgressProps> = ({
  campaignMongoId,
  goalEth,
  pollIntervalMs = 0,
}) => {
  const [details,   setDetails]   = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const id   = mongoIdToUint256(campaignMongoId);
      const data = await fetchCampaignDetails(id);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load on-chain data.');
    } finally {
      setIsLoading(false);
    }
  }, [campaignMongoId]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    load();
  }, [load]);

  // Optional polling
  useEffect(() => {
    if (pollIntervalMs <= 0) return;
    const id = setInterval(load, pollIntervalMs);
    return () => clearInterval(id);
  }, [load, pollIntervalMs]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="funding-progress funding-progress--loading" aria-live="polite">
        <Loader2 size={18} className="spin" />
        <span>Loading on-chain data…</span>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !details) {
    return (
      <div className="funding-progress funding-progress--error" role="alert">
        <AlertCircle size={18} />
        <span>{error ?? 'Could not load campaign data.'}</span>
        <button
          onClick={() => { setIsLoading(true); load(); }}
          className="funding-progress__retry"
          aria-label="Retry loading on-chain data"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  // ── Progress bar ───────────────────────────────────────────────────────────
  const raisedNum    = parseFloat(details.raised);
  const goalNum      = goalEth ? parseFloat(goalEth.toString()) : null;
  const pct          = goalNum && goalNum > 0 ? Math.min((raisedNum / goalNum) * 100, 100) : null;

  return (
    <div className="funding-progress" aria-label="Campaign funding progress">
      {/* Status badge */}
      <div className="funding-progress__badges">
        {details.active && (
          <span className="funding-progress__badge funding-progress__badge--active">
            Active
          </span>
        )}
        {details.cancelled && (
          <span className="funding-progress__badge funding-progress__badge--cancelled">
            Cancelled
          </span>
        )}
        {!details.active && !details.cancelled && (
          <span className="funding-progress__badge funding-progress__badge--closed">
            Closed
          </span>
        )}
      </div>

      {/* Progress bar (only when goal is provided) */}
      {pct !== null && (
        <div className="funding-progress__bar-wrap" aria-label={`${pct.toFixed(1)}% funded`}>
          <div
            className="funding-progress__bar"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Stats grid */}
      <div className="funding-progress__stats">
        <div className="funding-progress__stat">
          <TrendingUp size={14} />
          <span className="funding-progress__stat-label">Raised</span>
          <strong className="funding-progress__stat-value">{details.raised} ETH</strong>
        </div>

        <div className="funding-progress__stat">
          <span className="funding-progress__stat-label">Available</span>
          <strong className="funding-progress__stat-value">{details.available} ETH</strong>
        </div>

        <div className="funding-progress__stat">
          <span className="funding-progress__stat-label">Withdrawn</span>
          <strong className="funding-progress__stat-value">{details.withdrawn} ETH</strong>
        </div>

        {goalNum !== null && (
          <div className="funding-progress__stat">
            <span className="funding-progress__stat-label">Goal</span>
            <strong className="funding-progress__stat-value">{goalEth} ETH</strong>
          </div>
        )}
      </div>

      {/* Owner */}
      <p className="funding-progress__owner">
        <span>Owner: </span>
        <code title={details.owner}>
          {details.owner.slice(0, 8)}…{details.owner.slice(-6)}
        </code>
      </p>
    </div>
  );
};

export default CampaignFundingProgress;
