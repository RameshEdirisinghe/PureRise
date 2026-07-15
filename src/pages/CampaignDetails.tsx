import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Heart,
  Clock,
  TrendingUp,
  ShieldCheck,
  Users,
  Target,
  Info,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getCampaignByIdApi, 
  getSavedCampaignsApi,
  toggleSavedCampaignApi,
  type CampaignResponse 
} from '../api/campaign';
import { fetchCampaignDetails } from '../services/campaignReadService';
import { mongoIdToUint256 } from '../utils/formatters';
import ContributeForm from '../components/campaign/ContributeForm';
import { useAuth } from '../context/AuthContext';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign]   = useState<CampaignResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved]     = useState(false);

  // On-chain live stats
  const [raisedEth, setRaisedEth]     = useState('0.00');
  const [progress, setProgress]       = useState(0);
  const [backerCount, setBackerCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchOnChainStats = useCallback(async (c: CampaignResponse) => {
    if (!c._id && !c.id) return;
    setStatsLoading(true);
    try {
      const campaignId = mongoIdToUint256(c._id || c.id);
      const details    = await fetchCampaignDetails(campaignId);
      const raised     = parseFloat(details.raised);
      const goal       = parseFloat(c.targetFunding?.toString() || '0');
      const pct        = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
      setRaisedEth(details.raised);
      setProgress(pct);
    } catch {
      // chain not reachable — leave defaults
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        if (!id || id === 'undefined') {
          navigate('/contributor/dashboard');
          return;
        }
        const data = await getCampaignByIdApi(id);
        setCampaign(data);
        // Count backers from DB contributions
        setBackerCount(data.contributions?.length ?? 0);
        // Fetch live on-chain raised amount
        await fetchOnChainStats(data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast.error('Failed to load campaign details');
        navigate('/contributor/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();

    if (user?.id) {
      getSavedCampaignsApi()
        .then((saved) => setIsSaved(saved.includes(id as string)))
        .catch(err => console.error('Failed to load saved campaigns', err));
    }
  }, [id, navigate, fetchOnChainStats, user?.id]);

  const handleContributionSuccess = useCallback(async (txHash: string) => {
    if (!campaign) return;
    // Refresh on-chain stats and backer count
    await fetchOnChainStats(campaign);
    // Refresh campaign data to get updated contributions list
    try {
      const updated = await getCampaignByIdApi(campaign.id || campaign._id!);
      setCampaign(updated);
      setBackerCount(updated.contributions?.length ?? 0);
    } catch {
      // non-fatal
    }
    toast.success(`Transaction confirmed! Tx: ${txHash.slice(0, 10)}…`);
  }, [campaign, fetchOnChainStats]);

  const toggleSave = async () => {
    if (!user) {
      toast.error('Please login to save campaigns');
      return;
    }

    try {
      // Optimistic update
      setIsSaved(!isSaved);
      
      if (!isSaved) {
        toast.success('Project Saved!', { icon: '❤️' });
      }

      // API call to persist
      const updatedSaved = await toggleSavedCampaignApi(id as string);
      setIsSaved(updatedSaved.includes(id as string));
    } catch (error) {
      toast.error('Failed to update saved status');
      setIsSaved(isSaved); // revert
    }
  };

  const calculateDaysRemaining = (dateStr: string) => {
    const end  = new Date(dateStr);
    const now  = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) return null;

  const daysRemaining = calculateDaysRemaining(campaign.endDate);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style>{`
        body { font-family: 'Times New Roman', Times, serif; }
        h1, h2, h3, h4, h5, h6, button, span, p.sans-serif {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
        }
      `}</style>

      {/* Sticky Top Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-ink transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex items-center gap-4">
          <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">
            <Share2 size={20} />
          </button>
          <button
            onClick={toggleSave}
            className={`p-2.5 rounded-xl border transition-all ${
              isSaved ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-400'
            }`}
          >
            <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column: Media & Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Main Media */}
            <div className="aspect-video w-full rounded-[40px] overflow-hidden bg-slate-200 shadow-2xl border-8 border-white">
              <img src={campaign.coverImage} className="w-full h-full object-cover" alt={campaign.title} />
            </div>

            {/* Campaign Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-full bg-brand-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-500/20">
                  {campaign.category}
                </span>
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-green-500" />
                  Verified Project
                </div>
              </div>
              <h1 className="text-5xl font-bold text-ink leading-tight tracking-tight">{campaign.title}</h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                {campaign.summary}
              </p>
            </div>

            {/* Campaign Owner Info */}
            <div className="flex items-center gap-6 p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm group">
              <div className="w-20 h-20 rounded-[24px] bg-brand-100 overflow-hidden shadow-inner flex items-center justify-center text-brand-600 font-bold text-2xl">
                {campaign.owner?.profileImage ? (
                  <img src={campaign.owner.profileImage} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span>{campaign.owner?.name?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Project Founder</p>
                <h3 className="text-xl font-bold text-ink">{campaign.owner?.name}</h3>
                <p className="text-sm text-slate-400 font-medium" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{campaign.owner?.email}</p>
              </div>
              <button className="px-6 py-3 rounded-2xl border border-slate-100 text-xs font-bold text-slate-400 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-all">
                Contact Founder
              </button>
            </div>

            {/* Detailed Description */}
            <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                <Info className="text-brand-500" size={24} />
                <h2 className="text-2xl font-bold text-ink">Project Story</h2>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-loose" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  {campaign.goalDescription}
                </p>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="text-brand-500" size={24} />
                  <h2 className="text-2xl font-bold text-ink">Milestone Map</h2>
                </div>
                <span className="px-4 py-2 bg-slate-50 rounded-2xl text-xs font-bold text-slate-400 border border-slate-100">
                  {campaign.milestones.length} Phases
                </span>
              </div>

              <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                {campaign.milestones.map((m: any, idx: number) => (
                  <div key={idx} className="relative pl-14 group">
                    <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-brand-500 group-hover:text-brand-500 transition-all shadow-sm">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-transparent group-hover:border-brand-100 group-hover:bg-brand-50/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-ink">{m.title}</h4>
                        <span className="text-[10px] font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded-full border border-brand-100">
                          {m.fundPercentage}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-500" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{m.description}</p>
                      {m.expectedCompletionDate && (
                        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-slate-400">
                          <Calendar size={12} />
                          Target: {new Date(m.expectedCompletionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Backers */}
            {campaign.contributions && campaign.contributions.length > 0 && (
              <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                  <Users className="text-brand-500" size={24} />
                  <h2 className="text-2xl font-bold text-ink">Recent Backers</h2>
                  <span className="ml-auto px-4 py-2 bg-slate-50 rounded-2xl text-xs font-bold text-slate-400 border border-slate-100">
                    {campaign.contributions.length} contributors
                  </span>
                </div>
                <div className="space-y-4">
                  {campaign.contributions.slice().reverse().slice(0, 8).map((contrib, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-brand-100 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-brand-100 overflow-hidden shrink-0 flex items-center justify-center text-brand-600 font-bold text-lg">
                        {contrib.profileImage ? (
                          <img src={contrib.profileImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span>{contrib.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ink">{contrib.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(contrib.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-brand-600">+{contrib.amountEth} ETH</p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${contrib.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-400 hover:text-brand-500 flex items-center gap-1 justify-end"
                        >
                          <ExternalLink size={10} />
                          Etherscan
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Funding Card */}
          <div className="space-y-8 sticky top-32 h-fit">
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-500" />

              <div className="space-y-8">
                {/* Funding Stats */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      {statsLoading ? (
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-5xl font-black text-ink tracking-tighter">{parseFloat(raisedEth).toFixed(3)}</span>
                      )}
                      <span className="text-xl font-bold text-brand-600 uppercase tracking-widest">ETH</span>
                    </div>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                      raised of {campaign.targetFunding} ETH goal
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-brand-500 rounded-full shadow-lg shadow-brand-500/50 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-ink">
                      <span>{progress.toFixed(1)}% funded</span>
                      <span className="text-brand-600 flex items-center gap-1">
                        <Users size={12} />
                        {backerCount} {backerCount === 1 ? 'backer' : 'backers'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                      <Clock className="text-brand-500 mb-2" size={20} />
                      <p className="text-xl font-bold text-ink">{daysRemaining}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Days Left</p>
                    </div>
                    <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                      <Calendar className="text-brand-500 mb-2" size={20} />
                      <p className="text-xl font-bold text-ink">{new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End Date</p>
                    </div>
                  </div>
                </div>

                {/* ContributeForm */}
                <div className="pt-6 border-t border-slate-100">
                  <ContributeForm
                    campaignMongoId={campaign._id || campaign.id}
                    onSuccess={handleContributionSuccess}
                  />
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-400">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-bold">On-Chain Security</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                All contributions are held in a secure smart contract. Funds are only released to the owner upon milestone verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
