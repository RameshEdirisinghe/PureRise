import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Info,
  Calendar,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { getCampaignByIdApi, type CampaignResponse } from '../api/campaign';
import { toast } from 'react-hot-toast';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    fetchCampaignDetails();
    checkIfSaved();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      setIsLoading(true);
      if (!id || id === 'undefined') {
        navigate('/contributor/dashboard');
        return;
      }
      const data = await getCampaignByIdApi(id);
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
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
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((sId: string) => sId !== id);
    } else {
      newSaved = [...saved, id];
      toast.success('Project Saved!', { icon: '❤️' });
    }
    localStorage.setItem('pure_raise_watchlist', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  const calculateDaysRemaining = (dateStr: string) => {
    const end = new Date(dateStr);
    const now = new Date();
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
  const progress = 0; // Placeholder

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
            <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-ink transition-all shadow-lg shadow-slate-900/20 uppercase tracking-wider">
            Connect Wallet
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
                      <h4 className="text-lg font-bold text-ink mb-1">{m.title}</h4>
                      <p className="text-sm text-slate-500" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                      <span className="text-5xl font-black text-ink tracking-tighter">0.00</span>
                      <span className="text-xl font-bold text-brand-600 uppercase tracking-widest">ETH</span>
                    </div>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                      raised of {campaign.targetFunding} ETH goal
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-brand-500 rounded-full shadow-lg shadow-brand-500/50" style={{ width: '0%' }} />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-ink">
                      <span>0% funded</span>
                      <span className="text-brand-600">0 contributors</span>
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

                {/* Contribution Input */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="relative group">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                    <input 
                      type="number" 
                      placeholder="Enter amount in ETH"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-12 pr-4 text-lg font-bold text-ink focus:border-brand-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <button className="w-full py-5 bg-brand-500 text-white rounded-[24px] font-bold text-lg hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/30 uppercase tracking-widest">
                    Back This Project
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-medium" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    By contributing, you agree to our Terms of Use and Risk Disclosure.
                  </p>
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
