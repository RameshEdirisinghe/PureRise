import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Heart,
  Clock,
  ShieldCheck,
  Target,
  Info,
  Calendar,
  CheckCircle2,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  Lock,
  TrendingUp,
  Zap,
  AlertCircle,
  Loader2,
  Send,
  Users,
} from 'lucide-react';
import { getCampaignByIdApi, type CampaignResponse } from '../api/campaign';
import { fetchCampaignWithdrawals, type WithdrawalEvent } from '../services/campaignReadService';
import { contributeToCampaign } from '../services/campaignContractService';
import { mongoIdToUint256 } from '../utils/formatters';
import { useWallet } from '../context/WalletContext';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────── Media Gallery ─────────────────────────── */
const MediaGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const hasMultiple = images.length > 1;

  if (!images.length) {
    return (
      <div className="aspect-video w-full rounded-3xl bg-slate-100 flex items-center justify-center">
        <TrendingUp size={48} className="text-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl shadow-slate-900/20">
        <img
          key={activeIdx}
          src={images[activeIdx]}
          alt={`${title} ${activeIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />

        {hasMultiple && (
          <>
            <button
              onClick={() => setActiveIdx(i => i === 0 ? images.length - 1 : i - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/35 opacity-0 group-hover:opacity-100 transition-all"
            ><ChevronLeft size={20} /></button>
            <button
              onClick={() => setActiveIdx(i => i === images.length - 1 ? 0 : i + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/35 opacity-0 group-hover:opacity-100 transition-all"
            ><ChevronRight size={20} /></button>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-bold">
              {activeIdx + 1} / {images.length}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button key={idx} onClick={() => setActiveIdx(idx)}
                  className={`transition-all rounded-full ${activeIdx === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {hasMultiple && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button key={idx} onClick={() => setActiveIdx(idx)}
              className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${activeIdx === idx ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-transparent opacity-50 hover:opacity-80'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ──────────────────────── Contribution Fund Panel ──────────────────────── */
interface FundPanelProps {
  campaignId: string;    // MongoDB _id
  goalEth: number;
  isActive: boolean;
}

const PRESET_AMOUNTS = ['0.01', '0.05', '0.1', '0.25', '0.5', '1.0'];

const FundPanel: React.FC<FundPanelProps> = ({ campaignId, goalEth, isActive }) => {
  const { isConnected, walletAddress, connectWallet, isConnecting, status } = useWallet();
  const [amount, setAmount]       = useState('');
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash]       = useState<string | null>(null);

  const handleContribute = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Please enter a valid ETH amount greater than 0.');
      return;
    }
    if (parsed < 0.001) {
      toast.error('Minimum contribution is 0.001 ETH.');
      return;
    }

    setIsPending(true);
    const toastId = toast.loading(
      <div>
        <p className="font-bold">Waiting for MetaMask…</p>
        <p className="text-xs text-slate-400">Confirm the transaction in your wallet</p>
      </div>,
      { duration: Infinity }
    );

    try {
      const uintId = mongoIdToUint256(campaignId);
      const result = await contributeToCampaign(uintId, amount);

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        toast.success(
          <div>
            <p className="font-bold">🎉 Contribution successful!</p>
            <p className="text-xs text-slate-500">
              {amount} ETH sent •{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-500 underline"
              >
                View on Etherscan
              </a>
            </p>
          </div>,
          { id: toastId, duration: 8000 }
        );
        setAmount('');
      } else {
        toast.error(result.error ?? 'Contribution failed.', { id: toastId });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unexpected error.', { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  /* ── Campaign not active ── */
  if (!isActive) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-amber-700">
          This campaign is not currently accepting contributions.
        </p>
      </div>
    );
  }

  /* ── Wallet not installed ── */
  if (status === 'not_installed') {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/30"
      >
        <Wallet size={18} /> Install MetaMask to Fund
      </a>
    );
  }

  /* ── Wallet not connected ── */
  if (!isConnected) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <Lock size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Connect your MetaMask wallet to fund this campaign. Your contribution goes directly to the smart contract.
          </p>
        </div>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-lg shadow-brand-500/30 uppercase tracking-wide"
        >
          {isConnecting ? (
            <><Loader2 size={18} className="animate-spin" /> Connecting…</>
          ) : (
            <><Wallet size={18} /> Connect Wallet to Fund</>
          )}
        </button>
      </div>
    );
  }

  /* ── Wrong network ── */
  if (status === 'wrong_network') {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-600">
            Please switch MetaMask to <strong>Sepolia Testnet</strong> to contribute.
          </p>
        </div>
      </div>
    );
  }

  /* ── Success state ── */
  if (txHash) {
    return (
      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <p className="font-bold text-emerald-700">Transaction confirmed!</p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-700"
          >
            View on Etherscan <ExternalLink size={12} />
          </a>
        </div>
        <button
          onClick={() => setTxHash(null)}
          className="w-full py-3 rounded-2xl border border-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
        >
          Fund Again
        </button>
      </div>
    );
  }

  /* ── Connected + active: main contribution UI ── */
  return (
    <div className="space-y-4">
      {/* Connected account */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
        <p className="text-xs font-mono text-slate-600 truncate">{walletAddress}</p>
      </div>

      {/* Preset amount buttons */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick Select</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map(preset => (
            <button
              key={preset}
              onClick={() => setAmount(preset)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                amount === preset
                  ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                  : 'bg-white text-slate-600 border-slate-100 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {preset} ETH
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount input */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Or Enter Amount</p>
        <div className="relative">
          <Wallet
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="number"
            min="0.001"
            step="0.001"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={isPending}
            className="w-full pl-10 pr-16 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-bold text-slate-900 focus:border-brand-500 focus:bg-white outline-none transition-all disabled:opacity-60"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-500">
            ETH
          </span>
        </div>
        {amount && !isNaN(parseFloat(amount)) && (
          <p className="text-xs text-slate-400 font-medium mt-1.5 ml-1">
            ≈ ${(parseFloat(amount) * 3500).toLocaleString()} USD
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleContribute}
        disabled={isPending || !amount || parseFloat(amount) <= 0}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base transition-all shadow-xl shadow-brand-500/30 uppercase tracking-wider"
      >
        {isPending ? (
          <><Loader2 size={20} className="animate-spin" /> Processing…</>
        ) : (
          <><Send size={18} /> Fund {amount ? `${amount} ETH` : 'Campaign'}</>
        )}
      </button>

      <p className="text-[10px] text-center text-slate-400 leading-relaxed">
        Funds go directly to a secured smart contract. They are only released to the owner at each verified milestone.
      </p>
    </div>
  );
};

/* ──────────────────────────── Main Component ──────────────────────────── */
const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign]       = useState<CampaignResponse | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalEvent[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [isSaved, setIsSaved]         = useState(false);
  const [copied, setCopied]           = useState(false);

  const fetchData = useCallback(async () => {
    if (!id || id === 'undefined') { navigate('/contributor/dashboard'); return; }
    try {
      setIsLoading(true);
      const data = await getCampaignByIdApi(id);
      setCampaign(data);
      try {
        const uintId = mongoIdToUint256(id);
        setWithdrawals(await fetchCampaignWithdrawals(uintId));
      } catch { /* blockchain unreachable — non-fatal */ }
    } catch {
      toast.error('Failed to load campaign details');
      navigate('/contributor/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
    const saved = JSON.parse(localStorage.getItem('pure_raise_watchlist') || '[]');
    setIsSaved(saved.includes(id));
  }, [fetchData, id]);

  const toggleSave = () => {
    const saved = JSON.parse(localStorage.getItem('pure_raise_watchlist') || '[]');
    const newSaved = isSaved ? saved.filter((s: string) => s !== id) : [...saved, id];
    if (!isSaved) toast.success('Saved! ❤️');
    localStorage.setItem('pure_raise_watchlist', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium text-sm">Loading campaign…</p>
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? '';
  const days      = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000));
  const allMedia  = [campaign.coverImage, ...(campaign.media || [])].filter(Boolean) as string[];
  const campaignId = (campaign as any)._id || campaign.id;

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    pending_approval: 'bg-amber-50 text-amber-600 border-amber-200',
    completed: 'bg-brand-50 text-brand-600 border-brand-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
    paused: 'bg-slate-100 text-slate-600 border-slate-200',
    draft: 'bg-slate-50 text-slate-400 border-slate-100',
  };
  const categoryIcons: Record<string, string> = {
    startup: '🚀', medical: '❤️‍🩹', education: '🎓',
    social: '🌍', technology: '⚡', personal: '🌟',
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`* { font-family: 'Inter', system-ui, sans-serif; }`}</style>

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-sm group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2 md:gap-3">
          <span className={`hidden sm:flex px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[campaign.status] ?? statusColors.draft}`}>
            {campaign.status.replace('_', ' ')}
          </span>
          <button onClick={handleShare} className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all">
            <Share2 size={18} />
          </button>
          <button onClick={toggleSave} className={`p-2.5 rounded-xl border transition-all ${isSaved ? 'bg-red-50 border-red-100 text-red-500' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">

          {/* ═══ LEFT: Main Content ═══ */}
          <div className="lg:col-span-2 space-y-8">

            {/* Media Gallery */}
            <MediaGallery images={allMedia} title={campaign.title} />

            {/* Campaign Identity */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-500/30">
                  {categoryIcons[campaign.category] ?? '📌'} {campaign.category}
                </span>
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <ShieldCheck size={14} /> Verified on-chain
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">{campaign.title}</h1>
              <p className="text-base text-slate-500 leading-relaxed">{campaign.summary}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                  <Calendar size={12} className="text-brand-500" />
                  Ends {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                  <Target size={12} className="text-brand-500" /> Goal: {campaign.targetFunding} ETH
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                  <Clock size={12} className="text-amber-500" /> {days > 0 ? `${days} days left` : 'Ended'}
                </span>
                {CONTRACT_ADDRESS && (
                  <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm hover:border-brand-200 hover:text-brand-600 transition-all">
                    <ExternalLink size={12} /> View Contract
                  </a>
                )}
              </div>
            </div>

            {/* Founder */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden flex items-center justify-center text-brand-600 font-black text-2xl flex-shrink-0 border-2 border-white shadow-lg">
                {campaign.owner?.profileImage
                  ? <img src={campaign.owner.profileImage} className="w-full h-full object-cover" alt="Founder" />
                  : <span>{campaign.owner?.name?.charAt(0)?.toUpperCase() ?? '?'}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-0.5">Project Founder</p>
                <h3 className="text-lg font-bold text-slate-900 truncate">{campaign.owner?.name ?? 'Unknown'}</h3>
                <p className="text-sm text-slate-400 truncate">{campaign.owner?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600">Active</span>
              </div>
            </div>

            {/* Project Story */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500"><Info size={20} /></div>
                <h2 className="text-xl font-black text-slate-900">Project Story</h2>
              </div>
              <div className="h-px bg-gradient-to-r from-brand-100 via-slate-100 to-transparent" />
              <p className="text-slate-600 leading-[1.9] text-[15px] whitespace-pre-line">{campaign.goalDescription}</p>
            </div>

            {/* Milestone Map */}
            {campaign.milestones?.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500"><Zap size={20} /></div>
                    <h2 className="text-xl font-black text-slate-900">Milestone Map</h2>
                  </div>
                  <span className="px-3 py-1.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 border border-slate-100">{campaign.milestones.length} phases</span>
                </div>
                <div className="space-y-4 relative">
                  <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-200 via-slate-100 to-transparent" />
                  {(() => {
                    let acc = 0;
                    const start = new Date(campaign.createdAt).getTime();
                    const end   = new Date(campaign.endDate).getTime();
                    const dur   = end - start;
                    const now   = Date.now();
                    return campaign.milestones.map((m: any, idx: number) => {
                      acc += m.fundPercentage ?? 0;
                      const deadline  = start + (dur * (acc / 100));
                      const isPassed  = now > deadline;
                      return (
                        <div key={idx} className="relative pl-14 group">
                          <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-sm font-black transition-all shadow-sm ${isPassed ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-slate-200 text-slate-300 group-hover:border-brand-300'}`}>
                            {isPassed ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                          </div>
                          <div className={`p-5 rounded-2xl border transition-all ${isPassed ? 'bg-brand-50/50 border-brand-100' : 'bg-slate-50/50 border-transparent group-hover:border-slate-100'}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${isPassed ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>{m.fundPercentage}% of funds</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-3 leading-relaxed">{m.description}</p>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                              <Calendar size={11} />
                              Deadline: {new Date(deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Withdraw History */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Wallet size={20} /></div>
                <h2 className="text-xl font-black text-slate-900">Owner Withdrawals</h2>
              </div>
              <div className="h-px bg-slate-50" />
              {withdrawals.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300"><Lock size={20} /></div>
                  <p className="text-sm font-medium text-slate-400">No withdrawals yet</p>
                  <p className="text-xs text-slate-300">Funds remain locked until milestones are reached.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-400">
                          <TrendingUp size={14} className="rotate-180" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Withdrawal</p>
                          <a href={`https://sepolia.etherscan.io/tx/${w.txHash}`} target="_blank" rel="noreferrer"
                            className="text-xs font-mono text-slate-600 hover:text-brand-500 transition-colors flex items-center gap-1">
                            {w.txHash.slice(0, 18)}… <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                      <p className="text-sm font-black text-red-500">–{w.amount} ETH</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Metadata */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Tag size={14} /> Campaign Info</h3>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Category',   value: campaign.category },
                  { label: 'Status',     value: campaign.status.replace('_', ' ') },
                  { label: 'Created',    value: new Date(campaign.createdAt).toLocaleDateString() },
                  { label: 'End Date',   value: new Date(campaign.endDate).toLocaleDateString() },
                  { label: 'Milestones', value: `${campaign.milestones?.length ?? 0} phases` },
                  { label: 'Goal',       value: `${campaign.targetFunding} ETH` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <dt className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</dt>
                    <dd className="text-sm font-bold text-slate-800 capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* ═══ RIGHT: Sticky Sidebar ═══ */}
          <div className="space-y-5 lg:sticky lg:top-24">

            {/* ── FUNDING CARD ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-900/8 overflow-hidden">
              {/* Gradient top bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-violet-500" />

              <div className="p-6 md:p-8 space-y-6">
                {/* Stats */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">0.00</span>
                    <span className="text-lg font-bold text-brand-500">ETH</span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                    raised of {campaign.targetFunding} ETH goal
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full w-0 transition-all duration-1000" />
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">0% funded</span>
                    <span className="text-brand-500 flex items-center gap-1"><Users size={11} /> 0 backers</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                    <Clock size={16} className="text-slate-400 mx-auto mb-1" />
                    <p className="text-lg font-black text-slate-900">{days > 0 ? days : '—'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Days Left</p>
                  </div>
                  <div className="bg-brand-50 border border-brand-100 rounded-2xl p-3 text-center">
                    <Target size={16} className="text-brand-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-brand-600">{campaign.targetFunding}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ETH Goal</p>
                  </div>
                </div>

                <div className="h-px bg-slate-50" />

                {/* ↓ The actual contribution UI ↓ */}
                <FundPanel
                  campaignId={campaignId}
                  goalEth={campaign.targetFunding}
                  isActive={campaign.status === 'active'}
                />
              </div>
            </div>

            {/* ── Security Card ── */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-brand-400">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-bold text-base">On-Chain Security</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" /> Funds secured in a tamper-proof smart contract</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" /> Released to owner only on milestone deadlines</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" /> All transactions visible on Sepolia Etherscan</li>
              </ul>
              {CONTRACT_ADDRESS && (
                <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer"
                  className="mt-5 flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Contract</p>
                    <p className="text-xs font-mono text-brand-300">{CONTRACT_ADDRESS.slice(0, 22)}…</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                </a>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignDetails;
