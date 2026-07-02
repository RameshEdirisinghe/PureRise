import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  TrendingUp,
  Users,
  Zap,
  Lock,
} from 'lucide-react';
import { getCampaignByIdApi, type CampaignResponse } from '../api/campaign';
import { fetchCampaignWithdrawals, type WithdrawalEvent } from '../services/campaignReadService';
import { mongoIdToUint256 } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import ContributeForm from '../components/campaign/ContributeForm';

/* ─────────────────────────────── Helpers ─────────────────────────────── */

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? '';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active:           { label: 'Live',           color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  pending_approval: { label: 'Under Review',   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
  completed:        { label: 'Completed',       color: 'text-brand-600',   bg: 'bg-brand-50 border-brand-100' },
  rejected:         { label: 'Rejected',        color: 'text-red-600',     bg: 'bg-red-50 border-red-100' },
  paused:           { label: 'Paused',          color: 'text-slate-600',   bg: 'bg-slate-100 border-slate-200' },
  draft:            { label: 'Draft',           color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-100' },
};

const categoryIcons: Record<string, string> = {
  startup: '🚀', medical: '❤️‍🩹', education: '🎓',
  social: '🌍', technology: '⚡', personal: '🌟',
};

/* ─────────────────────────────── Media Gallery ─────────────────────────── */

const MediaGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const hasMultiple = images.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="group relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-2xl shadow-slate-900/20">
        <img
          key={activeIdx}
          src={images[activeIdx]}
          alt={`${title} — image ${activeIdx + 1}`}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Nav arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Counter */}
        {hasMultiple && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-bold">
            {activeIdx + 1} / {images.length}
          </div>
        )}

        {/* Dots */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}
                className={`transition-all rounded-full ${activeIdx === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                activeIdx === idx ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────── Stat Card ─────────────────────────────── */

const StatCard = ({ icon: Icon, label, value, accent = false }: any) => (
  <div className={`rounded-2xl p-4 border flex flex-col gap-1 ${accent ? 'bg-brand-500/10 border-brand-200' : 'bg-slate-50 border-slate-100'}`}>
    <Icon size={18} className={accent ? 'text-brand-500' : 'text-slate-400'} />
    <p className={`text-xl font-black tracking-tight ${accent ? 'text-brand-600' : 'text-slate-900'}`}>{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

/* ──────────────────────────── Main Component ──────────────────────────── */

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignResponse | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
    checkIfSaved();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (!id || id === 'undefined') { navigate('/contributor/dashboard'); return; }
      const data = await getCampaignByIdApi(id);
      setCampaign(data);
      try {
        const uintId = mongoIdToUint256(id);
        const wdraws = await fetchCampaignWithdrawals(uintId);
        setWithdrawals(wdraws);
      } catch { /* non-critical: blockchain might be unreachable */ }
    } catch {
      toast.error('Failed to load campaign details');
      navigate('/contributor/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSaved = () => {
    const saved = JSON.parse(localStorage.getItem('pure_raise_watchlist') || '[]');
    setIsSaved(saved.includes(id));
  };

  const toggleSave = () => {
    const saved = JSON.parse(localStorage.getItem('pure_raise_watchlist') || '[]');
    const newSaved = isSaved ? saved.filter((s: string) => s !== id) : [...saved, id];
    if (!isSaved) toast.success('Campaign saved! ❤️');
    localStorage.setItem('pure_raise_watchlist', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const daysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  /* ── Skeleton ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium text-sm">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const days      = daysRemaining(campaign.endDate);
  const progress  = 0; // blockchain value pending
  const allMedia  = [campaign.coverImage, ...(campaign.media || [])].filter(Boolean) as string[];
  const statusCfg = statusConfig[campaign.status] ?? statusConfig.draft;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans antialiased">
      {/* ── Google Font ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`* { font-family: 'Inter', system-ui, sans-serif; }`}</style>

      {/* ──────────── STICKY HEADER ──────────── */}
      <header className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Status badge */}
          <span className={`hidden sm:flex px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.color}`}>
            {statusCfg.label}
          </span>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
            title="Copy link"
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={toggleSave}
            className={`p-2.5 rounded-xl border transition-all ${isSaved ? 'bg-red-50 border-red-100 text-red-500' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </header>

      {/* ──────────── BODY ──────────── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">

          {/* ═══════════ LEFT / MAIN COLUMN ═══════════ */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── Media Gallery ── */}
            <MediaGallery images={allMedia} title={campaign.title} />

            {/* ── Campaign Identity ── */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-500/30">
                  <span>{categoryIcons[campaign.category] ?? '📌'}</span>
                  {campaign.category}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.color} sm:hidden`}>
                  {statusCfg.label}
                </span>
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <ShieldCheck size={14} />
                  Verified on-chain
                </div>
              </div>

              <div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-3">
                  {campaign.title}
                </h1>
                <p className="text-base md:text-lg text-slate-500 leading-relaxed font-medium">
                  {campaign.summary}
                </p>
              </div>

              {/* Quick stat chips */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                  <Calendar size={12} className="text-brand-500" />
                  Ends {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                  <Target size={12} className="text-brand-500" />
                  Goal: {campaign.targetFunding} ETH
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                  <Clock size={12} className="text-amber-500" />
                  {days > 0 ? `${days} days left` : 'Ended'}
                </span>
                {CONTRACT_ADDRESS && (
                  <a
                    href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm hover:border-brand-200 hover:text-brand-600 transition-all"
                  >
                    <ExternalLink size={12} />
                    Etherscan
                  </a>
                )}
              </div>
            </div>

            {/* ── Owner Card ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden flex items-center justify-center text-brand-600 font-bold text-2xl flex-shrink-0 border-2 border-white shadow-lg">
                {campaign.owner?.profileImage ? (
                  <img src={campaign.owner.profileImage} className="w-full h-full object-cover" alt="Founder" />
                ) : (
                  <span>{campaign.owner?.name?.charAt(0)?.toUpperCase() ?? '?'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-0.5">Project Founder</p>
                <h3 className="text-lg font-bold text-slate-900 truncate">{campaign.owner?.name ?? 'Unknown'}</h3>
                <p className="text-sm text-slate-400 truncate">{campaign.owner?.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600">Active</span>
              </div>
            </div>

            {/* ── Project Story ── */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                  <Info size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Project Story</h2>
                  <p className="text-xs text-slate-400 font-medium">Full campaign description</p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-brand-100 via-slate-100 to-transparent" />
              <p className="text-slate-600 leading-[1.9] text-[15px]">
                {campaign.goalDescription}
              </p>
            </div>

            {/* ── Milestone Timeline ── */}
            {campaign.milestones?.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Milestone Map</h2>
                      <p className="text-xs text-slate-400 font-medium">Fund release schedule</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 border border-slate-100">
                    {campaign.milestones.length} phases
                  </span>
                </div>

                <div className="space-y-4 relative">
                  {/* Vertical connector */}
                  <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-200 via-slate-100 to-transparent" />

                  {(() => {
                    let acc = 0;
                    const start = new Date(campaign.createdAt).getTime();
                    const end   = new Date(campaign.endDate).getTime();
                    const dur   = end - start;
                    const now   = Date.now();

                    return campaign.milestones.map((m: any, idx: number) => {
                      acc += m.fundPercentage ?? 0;
                      const deadline   = start + (dur * (acc / 100));
                      const isPassed   = now > deadline;
                      const isCurrent  = !isPassed && (idx === 0 || now > (start + dur * ((acc - (m.fundPercentage ?? 0)) / 100)));

                      return (
                        <div key={idx} className="relative pl-14 group">
                          {/* Icon */}
                          <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-sm font-black transition-all shadow-sm ${
                            isPassed  ? 'bg-brand-500 border-brand-500 text-white shadow-brand-500/30' :
                            isCurrent ? 'bg-amber-400 border-amber-400 text-white shadow-amber-400/30 animate-pulse' :
                            'bg-white border-slate-200 text-slate-300 group-hover:border-brand-300 group-hover:text-brand-400'
                          }`}>
                            {isPassed ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                          </div>

                          {/* Content */}
                          <div className={`p-5 rounded-2xl border transition-all ${
                            isPassed  ? 'bg-brand-50/50 border-brand-100'  :
                            isCurrent ? 'bg-amber-50/50 border-amber-100'  :
                            'bg-slate-50/50 border-transparent group-hover:border-slate-100'
                          }`}>
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                  isPassed ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {m.fundPercentage}% of funds
                                </span>
                                {isPassed   && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">✓ Unlocked</span>}
                                {isCurrent  && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">● Active</span>}
                              </div>
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

            {/* ── Withdraw History ── */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Wallet size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Owner Withdrawals</h2>
                  <p className="text-xs text-slate-400 font-medium">On-chain transparency log</p>
                </div>
              </div>
              <div className="h-px bg-slate-50" />

              {withdrawals.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <Lock size={20} />
                  </div>
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
                          <a
                            href={`https://sepolia.etherscan.io/tx/${w.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-mono text-slate-600 hover:text-brand-500 transition-colors flex items-center gap-1"
                          >
                            {w.txHash.slice(0, 18)}…
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                      <p className="text-sm font-black text-red-500">–{w.amount} ETH</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Tags / Metadata ── */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag size={14} /> Campaign Info
              </h3>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Category',   value: campaign.category },
                  { label: 'Status',     value: statusCfg.label },
                  { label: 'Created',    value: new Date(campaign.createdAt).toLocaleDateString() },
                  { label: 'End Date',   value: new Date(campaign.endDate).toLocaleDateString() },
                  { label: 'Milestones',  value: `${campaign.milestones?.length ?? 0} phases` },
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

          {/* ═══════════ RIGHT / SIDEBAR ═══════════ */}
          <div className="space-y-6 lg:sticky lg:top-24">

            {/* ── Funding Card ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-900/8 overflow-hidden">
              {/* Colorful top bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-violet-500" />

              <div className="p-6 md:p-8 space-y-6">
                {/* Raised amount */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">0.00</span>
                    <span className="text-lg font-bold text-brand-500">ETH</span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                    raised of {campaign.targetFunding} ETH goal
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full shadow-lg shadow-brand-500/30 transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">{progress}% funded</span>
                    <span className="text-brand-500 flex items-center gap-1">
                      <Users size={11} /> 0 backers
                    </span>
                  </div>
                </div>

                {/* Stat grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={Clock}    label="Days Left"  value={days > 0 ? days : 'Ended'} />
                  <StatCard icon={Target}   label="Goal"       value={`${campaign.targetFunding} ETH`} accent />
                </div>

                {/* Separator */}
                <div className="h-px bg-slate-50" />

                {/* ContributeForm  */}
                {campaign.status === 'active' ? (
                  <div className="space-y-4">
                    <ContributeForm
                      campaignMongoId={id!}
                      onSuccess={() => {
                        toast.success('Thank you for backing this project!');
                      }}
                    />
                    <p className="text-[10px] text-center text-slate-400 leading-relaxed">
                      By contributing, you agree to the Terms of Use and Risk Disclosure. Funds are held in a secure smart contract.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <AlertCircle size={18} className="text-slate-400 flex-shrink-0" />
                    <p className="text-xs font-medium text-slate-500">
                      Contributions are only accepted for <span className="font-bold">active</span> campaigns. This campaign is currently <span className="font-bold capitalize">{campaign.status.replace('_', ' ')}</span>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── On-Chain Security Card ── */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-slate-900/30">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-brand-400">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-bold text-lg">On-Chain Security</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                All contributions are secured in a tamper-proof smart contract on Sepolia. Funds are only released to the project owner at each verified milestone.
              </p>
              {CONTRACT_ADDRESS && (
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                >
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Contract Address</p>
                    <p className="text-xs font-mono text-brand-300">{CONTRACT_ADDRESS.slice(0, 20)}…</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                </a>
              )}
            </div>

            {/* ── Milestone Progress (mini) ── */}
            {campaign.milestones?.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap size={14} className="text-brand-500" /> Milestone Progress
                </h4>
                <div className="space-y-3">
                  {(() => {
                    let acc = 0;
                    const start = new Date(campaign.createdAt).getTime();
                    const end   = new Date(campaign.endDate).getTime();
                    const dur   = end - start;
                    const now   = Date.now();
                    return campaign.milestones.map((m: any, idx: number) => {
                      acc += m.fundPercentage ?? 0;
                      const isPassed = now > (start + dur * (acc / 100));
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black ${isPassed ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {isPassed ? '✓' : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-slate-700 truncate">{m.title}</p>
                              <p className="text-[10px] font-bold text-brand-500 ml-2">{m.fundPercentage}%</p>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${isPassed ? 'bg-brand-500' : 'bg-slate-200'}`} style={{ width: isPassed ? '100%' : '0%' }} />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignDetails;
