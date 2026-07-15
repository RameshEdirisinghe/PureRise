import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Wallet,
  Users,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  BarChart3,
  Info,
} from 'lucide-react';
import { getCampaignByIdApi, type CampaignResponse, type CampaignWithdrawal } from '../api/campaign';
import {
  fetchCampaignDetails,
  type CampaignDetails,
} from '../services/campaignReadService';
import WithdrawButton from '../components/campaign/WithdrawButton';
import { toast } from 'react-hot-toast';
import { mongoIdToUint256 } from '../utils/formatters';
import { openCampaignOnChain } from '../services/campaignContractService';
import { useWallet } from '../context/WalletContext';

/* ─────────────────────────────── Media Gallery ─────────────────────────── */
const MediaGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const hasMultiple = images.length > 1;

  if (!images.length) {
    return (
      <div className="aspect-video w-full rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center text-slate-300">
          <BarChart3 size={48} className="mx-auto mb-2" />
          <p className="text-sm font-medium">No media uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 shadow-xl shadow-slate-900/20">
        <img
          key={activeIdx}
          src={images[activeIdx]}
          alt={`${title} — ${activeIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />

        {hasMultiple && (
          <>
            <button
              onClick={() => setActiveIdx(i => i === 0 ? images.length - 1 : i - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/35 transition-all opacity-0 group-hover:opacity-100"
            ><ChevronLeft size={20} /></button>
            <button
              onClick={() => setActiveIdx(i => i === images.length - 1 ? 0 : i + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/35 transition-all opacity-0 group-hover:opacity-100"
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

/* ─────────────────────────── On-Chain Stats Bar ────────────────────────── */
const OnChainStatsBar = ({ details, goalEth }: { details: CampaignDetails | null; goalEth: number }) => {
  if (!details) return null;
  const raised = parseFloat(details.raised);
  const pct = goalEth > 0 ? Math.min((raised / goalEth) * 100, 100) : 0;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base flex items-center gap-2"><TrendingUp size={16} className="text-brand-400" /> Live On-Chain Stats</h3>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${details.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {details.active ? '● Live' : details.cancelled ? 'Cancelled' : 'Closed'}
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black tracking-tight">{details.raised}</span>
          <span className="text-brand-400 font-bold">ETH raised</span>
        </div>
        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-medium mt-1.5">
          <span>{pct.toFixed(1)}% of {goalEth} ETH goal</span>
          <span>{details.withdrawn} ETH withdrawn</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Raised', value: `${details.raised} ETH`, color: 'text-emerald-400' },
          { label: 'Available', value: `${details.available} ETH`, color: 'text-brand-400' },
          { label: 'Withdrawn', value: `${details.withdrawn} ETH`, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
            <p className={`text-sm font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ──────────────────────────── Main Component ──────────────────────────── */
const CampaignOwnerDetailedView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign]             = useState<CampaignResponse | null>(null);
  const [onChainDetails, setOnChainDetails] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [isLaunching, setIsLaunching]       = useState(false);
  const [activeTab, setActiveTab]           = useState<'milestones' | 'backers' | 'withdrawals'>('milestones');
  const { isConnected, connectWallet }      = useWallet();

  const loadData = useCallback(async (campaignId: string) => {
    try {
      setIsLoading(true);
      const data = await getCampaignByIdApi(campaignId);
      setCampaign(data);

      // Fetch on-chain stats (read-only, non-blocking)
      const uintId = mongoIdToUint256(campaignId);
      const chainResult = await Promise.allSettled([
        fetchCampaignDetails(uintId),
      ]);
      if (chainResult[0].status === 'fulfilled') setOnChainDetails(chainResult[0].value);
    } catch {
      toast.error('Failed to load campaign details');
      navigate('/campaign-owner/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => { if (id) loadData(id); }, [id, loadData]);

  const handleLaunchOnChain = async () => {
    if (!campaign) return;
    if (!isConnected) {
      toast('Please connect your wallet first.', { icon: '👛' });
      connectWallet();
      return;
    }

    try {
      setIsLaunching(true);
      toast.loading('Please confirm the transaction in MetaMask...', { id: 'launch' });
      
      const uintId = mongoIdToUint256(campaign._id);
      const txResult = await openCampaignOnChain(uintId);

      if (txResult.success) {
        toast.success('Campaign successfully launched on the blockchain!', { id: 'launch' });
        // Refresh blockchain data
        if (id) loadData(id);
      } else {
        toast.error(`Launch failed: ${txResult.error}`, { id: 'launch' });
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while launching.', { id: 'launch' });
    } finally {
      setIsLaunching(false);
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium text-sm">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  /* ── Derived values ── */
  const now           = Date.now();
  const startTs       = new Date(campaign.createdAt).getTime();
  const endTs         = new Date(campaign.endDate).getTime();
  const totalDuration = endTs - startTs;
  const daysLeft      = Math.max(0, Math.ceil((endTs - now) / (1000 * 60 * 60 * 24)));
  const allMedia      = [campaign.coverImage, ...(campaign.media || [])].filter(Boolean) as string[];

  const statusColors: Record<string, string> = {
    active:           'bg-emerald-50 text-emerald-600 border-emerald-200',
    pending_approval: 'bg-amber-50 text-amber-600 border-amber-200',
    completed:        'bg-brand-50 text-brand-600 border-brand-200',
    rejected:         'bg-red-50 text-red-600 border-red-200',
    paused:           'bg-slate-100 text-slate-600 border-slate-200',
    draft:            'bg-slate-50 text-slate-400 border-slate-100',
  };

  // Use DB withdrawals (reliable) — recorded by recordWithdrawalApi after each tx
  const dbWithdrawals: CampaignWithdrawal[] = campaign?.withdrawals || [];

  const TABS = [
    { key: 'milestones',  label: 'Milestones',  count: campaign.milestones?.length ?? 0 },
    { key: 'backers',     label: 'Who Funded',   count: campaign.contributions?.length ?? 0 },
    { key: 'withdrawals', label: 'Withdrawals',  count: dbWithdrawals.length },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans antialiased pb-20">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`* { font-family: 'Inter', system-ui, sans-serif; }`}</style>

      {/* ──────────── HEADER ──────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 md:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/campaign-owner/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">My Campaigns</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => id && loadData(id)}
            className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[campaign.status] ?? statusColors.draft}`}>
            {campaign.status.replace('_', ' ')}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* ──────────── LAUNCH ON BLOCKCHAIN BANNER ──────────── */}
        {campaign.status === 'active' && onChainDetails && !onChainDetails.active && (
          <div className="bg-brand-50 border border-brand-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-brand-900 mb-2">Your campaign is approved! 🎉</h2>
              <p className="text-brand-700 text-sm md:text-base leading-relaxed max-w-2xl">
                The PureRaise platform admins have approved your campaign. To officially start accepting contributions, you must launch it on the Ethereum blockchain.
              </p>
            </div>
            <button
              onClick={handleLaunchOnChain}
              disabled={isLaunching}
              className="whitespace-nowrap px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLaunching ? 'Launching...' : 'Launch on Blockchain 🚀'}
            </button>
          </div>
        )}

        {/* ──────────── HERO: Media + Title ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">

          {/* Media */}
          <div className="lg:col-span-3">
            <MediaGallery images={allMedia} title={campaign.title} />
          </div>

          {/* Campaign Meta */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-500/30 mb-3">
                {campaign.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                {campaign.title}
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">{campaign.summary}</p>
            </div>

            {/* Key chips */}
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                <Target size={12} className="text-brand-500" /> Goal: {campaign.targetFunding} ETH
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                <Clock size={12} className="text-amber-500" /> {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                <Calendar size={12} className="text-slate-400" />
                Ends {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {/* On-chain stats */}
            <OnChainStatsBar details={onChainDetails} goalEth={campaign.targetFunding} />
          </div>
        </div>

        {/* ──────────── DESCRIPTION ──────────── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
              <Info size={18} />
            </div>
            <h2 className="text-lg font-black text-slate-900">Project Description</h2>
          </div>
          <div className="h-px bg-slate-50 mb-5" />
          <p className="text-slate-600 leading-[1.9] text-[15px] whitespace-pre-line">{campaign.goalDescription}</p>
        </div>

        {/* ──────────── PROPOSAL PDF ──────────── */}
        {campaign.proposalPdf && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-[20px] bg-brand-50 border border-brand-100 flex items-center justify-center text-3xl shrink-0">
              📄
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Project Proposal</p>
              <h3 className="text-lg font-bold text-ink">View the official project proposal document</h3>
              <p className="text-sm text-slate-400 mt-0.5">
                The document you attached during campaign creation.
              </p>
            </div>
            <a
              href={campaign.proposalPdf}
              target="_blank"
              rel="noopener noreferrer"
              download="Project-Proposal.pdf"
              className="flex items-center gap-2 px-6 py-3 bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white text-sm font-bold rounded-2xl transition-all shrink-0"
            >
              Download PDF
            </a>
          </div>
        )}

        {/* ──────────── TABS ──────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.key ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">

            {/* ── MILESTONES TAB ── */}
            {activeTab === 'milestones' && (
              <div className="space-y-4">
                {campaign.milestones?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Zap size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No milestones defined</p>
                  </div>
                ) : (() => {
                  let acc = 0;
                  return campaign.milestones.map((m: any, idx: number) => {
                    acc += m.fundPercentage ?? 0;
                    const deadlineTime = startTs + (totalDuration * (acc / 100));
                    const isPassed     = now > deadlineTime;
                    const isCurrent    = !isPassed && (idx === 0 || now > startTs + totalDuration * ((acc - (m.fundPercentage ?? 0)) / 100));

                    // Max withdrawable for this milestone (capped to what's available)
                    const milestoneAllocationEth = (campaign.targetFunding * (m.fundPercentage ?? 0)) / 100;
                    const availableForMilestone  = onChainDetails
                      ? Math.min(parseFloat(onChainDetails.available), milestoneAllocationEth).toFixed(4)
                      : '0';

                    return (
                      <div key={idx} className={`rounded-2xl border-2 p-5 transition-all ${
                        isPassed  ? 'border-brand-200 bg-brand-50/50'  :
                        isCurrent ? 'border-amber-200 bg-amber-50/50'  :
                        'border-slate-100 bg-slate-50/50'
                      }`}>
                        {/* Milestone Header */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                              isPassed  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' :
                              isCurrent ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30 animate-pulse' :
                              'bg-slate-200 text-slate-400'
                            }`}>
                              {isPassed ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{m.title}</h4>
                              <p className="text-xs text-slate-400 font-medium">{m.description}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${isPassed ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                              {m.fundPercentage}% of funds
                            </span>
                            {isPassed   && <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-100 text-emerald-600">✓ Unlocked</span>}
                            {isCurrent  && <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-100 text-amber-600">● Current</span>}
                            {!isPassed && !isCurrent && <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-400">Upcoming</span>}
                          </div>
                        </div>

                        {/* Deadline + Allocation */}
                        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-semibold text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={11} />
                            Deadline: {new Date(deadlineTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Target size={11} className="text-brand-400" />
                            Allocation: {milestoneAllocationEth.toFixed(4)} ETH
                          </div>
                        </div>

                        {/* Withdraw section */}
                        {isPassed ? (
                          <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                <Unlock size={13} /> Milestone deadline passed — withdrawal enabled
                              </div>
                              <p className="text-xs font-bold text-slate-500">
                                Available: <span className="text-brand-600">{availableForMilestone} ETH</span>
                              </p>
                            </div>
                            {onChainDetails ? (
                              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                                <WithdrawButton
                                  campaignMongoId={campaign._id ?? id!}
                                  campaignOwner={onChainDetails.owner}
                                  availableEth={availableForMilestone}
                                  onSuccess={() => id && loadData(id)}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-medium text-slate-500">
                                <AlertCircle size={14} className="text-slate-400" />
                                Loading on-chain data… please wait.
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 text-xs font-semibold text-amber-600">
                            <Lock size={13} />
                            Funds locked until deadline — {new Date(deadlineTime).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {activeTab === 'backers' && (
              <div>
                {!campaign.contributions || campaign.contributions.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                      <Users size={28} />
                    </div>
                    <p className="font-bold text-slate-500">No backers yet</p>
                    <p className="text-sm text-slate-400">Contributions will appear here once people fund your campaign.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Summary row */}
                    <div className="flex items-center justify-between p-4 bg-brand-50 rounded-2xl border border-brand-100 mb-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
                        <Users size={16} /> {campaign.contributions.length} backers
                      </div>
                      <p className="text-sm font-black text-brand-600">
                        {campaign.contributions.reduce((s, c) => s + parseFloat(c.amountEth), 0).toFixed(4)} ETH total
                      </p>
                    </div>

                    {campaign.contributions.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-100 hover:bg-brand-50/30 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-50 border border-slate-200 flex items-center justify-center text-brand-500 overflow-hidden shadow-sm flex-shrink-0">
                            {c.profileImage ? (
                              <img src={c.profileImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold">
                                {c.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink">{c.name}</p>
                            <a
                              href={`https://sepolia.etherscan.io/address/${c.walletAddress}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-mono text-slate-400 hover:text-brand-500 transition-colors flex items-center gap-1"
                            >
                              {c.walletAddress.slice(0, 8)}…{c.walletAddress.slice(-6)}
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-emerald-600">+{c.amountEth} ETH</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(c.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WITHDRAWALS TAB ── */}
            {activeTab === 'withdrawals' && (
              <div>
                {dbWithdrawals.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                      <Wallet size={28} />
                    </div>
                    <p className="font-bold text-slate-500">No withdrawals yet</p>
                    <p className="text-sm text-slate-400">Funds remain locked in the smart contract until milestones are reached.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Summary */}
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 mb-5">
                      <p className="text-sm font-bold text-red-700">{dbWithdrawals.length} withdrawal{dbWithdrawals.length > 1 ? 's' : ''}</p>
                      <p className="text-sm font-black text-red-600">
                        −{dbWithdrawals.reduce((s, w) => s + parseFloat(w.amountEth), 0).toFixed(4)} ETH total
                      </p>
                    </div>

                    {dbWithdrawals.slice().reverse().map((w, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-100 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 flex-shrink-0">
                            <TrendingUp size={16} className="rotate-180" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Transaction</p>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${w.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-mono text-slate-700 hover:text-brand-500 transition-colors flex items-center gap-1"
                            >
                              {w.txHash.slice(0, 18)}…
                              <ExternalLink size={10} />
                            </a>
                            <p className="text-[10px] text-slate-400 font-medium">{new Date(w.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-red-500">−{w.amountEth} ETH</p>
                          {w.blockNumber && <p className="text-[10px] text-slate-400 font-medium">Block #{w.blockNumber}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ──────────── SECURITY FOOTER ──────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-brand-400 flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">On-Chain Security</p>
            <p className="text-xs text-slate-400 font-medium">All funds are held in a tamper-proof smart contract on Sepolia. Withdrawals are validated on-chain.</p>
          </div>
          {import.meta.env.VITE_CONTRACT_ADDRESS && (
            <a
              href={`https://sepolia.etherscan.io/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-700 transition-colors flex-shrink-0"
            >
              View Contract <ExternalLink size={12} />
            </a>
          )}
        </div>

      </main>
    </div>
  );
};

export default CampaignOwnerDetailedView;
