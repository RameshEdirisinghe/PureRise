import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  PlusCircle, 
  Milestone, 
  History, 
  Settings, 
  Wallet, 
  TrendingUp, 
  Users as UsersIcon, 
  Calendar,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  Bell,
  User,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyCampaignsApi, type CampaignResponse } from '../api/campaign';
import { toast } from 'react-hot-toast';
import WalletButton from '../components/WalletButton';
import { fetchCampaignDetails } from '../services/campaignReadService';
import { mongoIdToUint256 } from '../utils/formatters';

// Images returned by the backend are already signed Supabase URLs — use them directly.
const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '';
  return path; // already a signed URL from the backend
};

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
      active 
        ? 'bg-brand-50 text-brand-600 font-bold' 
        : 'text-slate-400 hover:bg-slate-50 font-medium'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </button>
);

const MetricCard = ({ title, value, icon: Icon, subValue }: any) => (
  <div className="bg-white rounded-[32px] p-6 border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all group">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-500">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-ink">{value}</span>
          {subValue && <span className="text-[10px] font-bold text-slate-400">{subValue}</span>}
        </div>
      </div>
    </div>
  </div>
);

const CampaignTableRow = ({ c, onClick }: any) => {
  const [raised, setRaised] = useState('0');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    if (c.status === 'active') {
      const uintId = mongoIdToUint256(c._id || c.id);
      fetchCampaignDetails(uintId).then(details => {
        if (mounted && details) {
          const goal = parseFloat(c.targetFunding?.toString() || '0');
          const r = parseFloat(details.raised);
          const p = goal > 0 ? (r / goal) * 100 : 0;
          setRaised(details.raised);
          setProgress(Math.min(p, 100));
        }
      }).catch(() => {});
    }
    return () => { mounted = false; };
  }, [c]);

  return (
    <tr onClick={onClick} className="group cursor-pointer">
      <td className="py-5">
        <div className="font-bold text-ink group-hover:text-brand-600 transition-colors">{c.title}</div>
        <div className="text-[10px] text-slate-400 font-medium">{c.category}</div>
      </td>
      <td className="py-5 w-40">
        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span>{raised} ETH</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </td>
      <td className="py-5 text-center">
        <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-600">
          {c.status}
        </span>
      </td>
      <td className="py-5 text-right">
        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
          <MoreVertical size={16} />
        </button>
      </td>
    </tr>
  );
};

const CampaignGridCard = ({ c, onClick }: any) => {
  const [raised, setRaised] = useState('0');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    if (c.status === 'active') {
      const uintId = mongoIdToUint256(c._id || c.id);
      fetchCampaignDetails(uintId).then(details => {
        if (mounted && details) {
          const goal = parseFloat(c.targetFunding?.toString() || '0');
          const r = parseFloat(details.raised);
          const p = goal > 0 ? (r / goal) * 100 : 0;
          setRaised(details.raised);
          setProgress(Math.min(p, 100));
        }
      }).catch(() => {});
    }
    return () => { mounted = false; };
  }, [c]);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500"
    >
      <div className="aspect-video w-full relative overflow-hidden bg-slate-100">
        {c.coverImage ? (
          <img
            src={c.coverImage}
            alt={c.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Megaphone size={40} className="text-slate-200" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
            c.status === 'active'           ? 'bg-green-500/10 text-green-500 border-green-500/20' :
            c.status === 'pending_approval' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
            c.status === 'rejected'         ? 'bg-red-500/10 text-red-500 border-red-500/20' :
            'bg-slate-500/10 text-slate-500 border-slate-500/20'
          }`}>
            {c.status.replace('_', ' ')}
          </span>
        </div>
        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xl transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            <ArrowUpRight size={16} />
            View Details
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-2">{c.category}</p>
        <h3 className="font-bold text-ink mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">{c.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-6 min-h-[32px]">{c.summary}</p>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Raised</p>
              <p className="text-sm font-bold text-ink">{parseFloat(raised).toFixed(3)} ETH</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Goal</p>
              <p className="text-sm font-bold text-ink">{c.targetFunding} ETH</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignOwnerDashboard = () => {
  const { user, logout, updateProfile, uploadProfileImage } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Settings State
  const [newName, setNewName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // avatarPreview: shows local blob while a new file is selected; otherwise syncs from auth user
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profileImage || null);
  const [walletConnected] = useState(false); // replaced by WalletContext

  // Keep avatar in sync when user object updates (e.g. after successful profile save)
  useEffect(() => {
    if (!selectedFile) {
      // Only sync from server when no local file is pending preview
      setAvatarPreview(user?.profileImage || null);
    }
  }, [user?.profileImage]);

  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRaised, setTotalRaised] = useState('0.00');
  const [totalContributors, setTotalContributors] = useState(0);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await getMyCampaignsApi();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load your campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      let sumRaised = 0;
      let sumContributors = 0;
      for (const c of campaigns) {
        if (c.status === 'active') {
          try {
            const details = await fetchCampaignDetails(mongoIdToUint256(c.id || c._id));
            sumRaised += parseFloat(details.raised || '0');
          } catch (e) {}
        }
        sumContributors += (c.contributions?.length || 0);
      }
      if (mounted) {
        setTotalRaised(sumRaised.toString());
        setTotalContributors(sumContributors);
      }
    };
    if (campaigns.length > 0) {
      fetchStats();
    }
    return () => { mounted = false; };
  }, [campaigns]);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  // Flatten milestones
  const allMilestones = campaigns
    .flatMap(c => (c.milestones || []).map(m => ({ ...m, campaignId: c.id || c._id, campaignTitle: c.title })))
    .sort((a, b) => new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime());

  // Flatten contributions
  const allContributions = campaigns
    .flatMap(c => (c.contributions || []).map(cont => ({ ...cont, campaignTitle: c.title })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10); // top 10 recent backers

  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true);

      const updatePayload: { name?: string; profileImage?: string } = {};

      if (newName && newName !== user?.name) {
        updatePayload.name = newName;
      }

      if (selectedFile) {
        // uploadProfileImage returns the raw storage path (e.g. profiles/uuid-name.jpg)
        const rawPath = await uploadProfileImage(selectedFile);
        updatePayload.profileImage = rawPath;
      }

      await updateProfile(updatePayload);
      toast.success('Profile updated successfully!');
      setSelectedFile(null);
      // avatarPreview will auto-update via the useEffect watching user?.profileImage
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Consistent with Admin */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 p-6 z-10 hidden lg:block">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">P</div>
          <span className="font-bold text-ink tracking-tight">PureRaise Owner</span>
        </div>

        <nav className="space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={Megaphone} label="My Campaigns" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
          <SidebarItem icon={PlusCircle} label="Create Campaign" active={activeTab === 'create'} onClick={() => navigate('/campaign-owner/create')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <button
            onClick={logout}
            className="w-full py-3 px-4 rounded-xl border border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Top Header - Consistent with Admin */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-ink">Dashboard Overview</h1>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Mainnet Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <WalletButton compact />
            <div className="w-10 h-10 rounded-full bg-brand-50 border border-slate-200 flex items-center justify-center text-brand-500 overflow-hidden shadow-sm">
              {user?.profileImage ? (
                <img src={getImageUrl(user.profileImage)} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard title="Total Raised" value={parseFloat(totalRaised).toFixed(3)} subValue="ETH" icon={TrendingUp} />
            <MetricCard title="Campaigns" value={campaigns.length} icon={Megaphone} />
            <MetricCard title="Contributors" value={totalContributors} icon={UsersIcon} />
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Active Campaigns List */}
              <div className="xl:col-span-2 space-y-8">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-ink">Active Campaigns</h2>
                    <button 
                      onClick={() => setActiveTab('campaigns')}
                      className="text-xs font-bold text-brand-500 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {isLoading ? (
                      <div className="flex flex-col items-center py-12">
                        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 text-sm font-medium">Loading campaigns...</p>
                      </div>
                    ) : activeCampaigns.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Megaphone className="mx-auto text-slate-300 mb-3" size={32} />
                        <p className="text-slate-500 font-bold">No active campaigns</p>
                        <p className="text-slate-400 text-xs mt-1">Start a new campaign to reach your goal.</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b border-slate-50">
                            <th className="pb-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Campaign</th>
                            <th className="pb-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Progress</th>
                            <th className="pb-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-center">Status</th>
                            <th className="pb-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {activeCampaigns.map((c) => (
                            <CampaignTableRow key={c.id || c._id} c={c} onClick={() => navigate(`/campaign-owner/campaign/${c.id || c._id}`)} />
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              {/* Milestone Tracking */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-ink">Upcoming Milestones</h2>
                </div>

                <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-100 max-h-[380px] overflow-y-auto pr-2">
                  {allMilestones.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 ml-5">
                      <Milestone className="mx-auto text-slate-300 mb-2" size={24} />
                      <p className="text-slate-400 text-xs font-bold">No milestones tracking yet</p>
                    </div>
                  ) : (
                    allMilestones.map((m: any, idx: number) => (
                    <div key={idx} className="relative pl-12 group cursor-pointer mb-6 last:mb-0" onClick={() => navigate(`/campaign-owner/campaign/${m.campaignId}`)}>
                      <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-sm bg-slate-100 text-slate-300 group-hover:bg-brand-500 group-hover:text-white transition-colors`}>
                         <Milestone size={18} />
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-ink group-hover:text-brand-600 transition-colors">{m.title}</h4>
                          <p className="text-xs text-brand-500 font-bold mb-3">{m.campaignTitle}</p>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-400 border border-slate-100">
                              Target Date: {new Date(m.expectedCompletionDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Feed Components */}
            <div className="space-y-8">
              {/* Recent Contributors */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-100">
                <h3 className="text-sm font-bold text-ink mb-6">Recent Backers</h3>
                <div className="space-y-6">
                  {allContributions.length === 0 ? (
                    <div className="text-center py-8">
                      <UsersIcon className="mx-auto text-slate-200 mb-2" size={24} />
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">No backers yet</p>
                    </div>
                  ) : (
                    allContributions.map((c: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-50 border border-slate-200 flex items-center justify-center text-brand-500 overflow-hidden shadow-sm">
                            {c.profileImage ? (
                              <img src={c.profileImage} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold">
                                {c.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-ink">{c.name}</p>
                            <p className="text-[9px] font-medium text-brand-500 max-w-[120px] truncate">{c.campaignTitle}</p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-brand-600">+{c.amountEth} ETH</p>
                      </div>
                    ))
                  )}
                </div>
                <button className="w-full py-3 mt-8 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50">
                  Transaction Feed
                </button>
              </div>

              {/* On-Chain Verification */}
              <div className="bg-brand-900 rounded-[32px] p-8 text-white">
                <h3 className="text-sm font-bold mb-6">On-Chain Security</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-bold text-brand-400 uppercase">Contract Address</p>
                      <p className="text-[10px] font-mono text-brand-100">0x8920...248e</p>
                    </div>
                    <ExternalLink size={14} className="text-brand-400" />
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <p className="text-[10px] font-bold">Verified Etherscan</p>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  </div>
                </div>
              </div>

              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-8">
              <div className="bg-white rounded-[32px] p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-ink">My Campaigns</h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">Manage and track all your fundraising efforts</p>
                  </div>
                  <button 
                    onClick={() => navigate('/campaign-owner/create')}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
                  >
                    <PlusCircle size={18} />
                    Create New
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center py-20">
                    <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Fetching your campaigns...</p>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Megaphone className="text-slate-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">No Campaigns Yet</h3>
                    <p className="text-slate-400 max-w-sm mx-auto mb-8">
                      You haven't created any campaigns yet. Start your first fundraising journey today!
                    </p>
                    <button 
                      onClick={() => navigate('/campaign-owner/create')}
                      className="px-8 py-4 bg-ink text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all"
                    >
                      Create Your First Campaign
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((c) => {
                      return <CampaignGridCard key={c.id || c._id} c={c} onClick={() => navigate(`/campaign-owner/campaign/${c.id || c._id}`)} />;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-[40px] border border-slate-100 p-12 max-w-2xl">
              <h2 className="text-2xl font-bold text-ink mb-8">Founder Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-[28px] bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-2xl shadow-inner overflow-hidden border-2 border-white">
                      {avatarPreview ? (
                        <img src={avatarPreview} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <span>{user?.name?.charAt(0)}</span>
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[28px] cursor-pointer transition-opacity">
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      <Settings className="text-white" size={20} />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-lg">{user?.name}</h3>
                    <p className="text-slate-400 text-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{user?.email}</p>
                    <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">Project Owner Account</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-500/20 focus:bg-white transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" defaultValue={user?.email} disabled className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium outline-none opacity-60 cursor-not-allowed" />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleProfileUpdate}
                    disabled={isUpdating}
                    className="w-full bg-brand-500 text-white rounded-xl py-4 font-bold text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CampaignOwnerDashboard;
