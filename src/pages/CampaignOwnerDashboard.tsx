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
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyCampaignsApi, type CampaignResponse } from '../api/campaign';
import { toast } from 'react-hot-toast';

// --- Components ---

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

const CampaignOwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [walletConnected, setWalletConnected] = useState(false);

  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  const milestones = [
    { id: 1, title: 'MVP Development', status: 'Verified', date: 'Oct 12, 2024', locked: 0, available: 5 },
    { id: 2, title: 'Beta Testing', status: 'In Progress', date: 'Nov 20, 2024', locked: 10, available: 0 },
    { id: 3, title: 'Mainnet Launch', status: 'Locked', date: 'Dec 15, 2024', locked: 15, available: 0 },
  ];

  const contributions = [
    { id: 1, wallet: '0x71C...4f8', amount: 0.5, time: '2 mins ago' },
    { id: 2, wallet: '0x3a2...9d1', amount: 2.1, time: '15 mins ago' },
    { id: 3, wallet: '0x9e5...b2c', amount: 0.15, time: '1 hour ago' },
  ];

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
          <SidebarItem icon={Milestone} label="Milestones" active={activeTab === 'milestones'} onClick={() => setActiveTab('milestones')} />
          <SidebarItem icon={History} label="Withdrawals" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
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
            <button 
              onClick={() => setWalletConnected(!walletConnected)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                walletConnected 
                  ? 'bg-green-50 text-green-600 border border-green-100' 
                  : 'bg-slate-900 text-white hover:bg-ink'
              }`}
            >
              <Wallet size={14} />
              {walletConnected ? '0x71C...4f8' : 'Connect Wallet'}
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <User size={20} />
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Total Raised" value="0.00" subValue="ETH" icon={TrendingUp} />
            <MetricCard title="Campaigns" value={campaigns.length} icon={Megaphone} />
            <MetricCard title="Contributors" value="0" icon={UsersIcon} />
            <MetricCard title="Next Milestone" value="--" subValue="Days" icon={Calendar} />
          </div>

          {activeTab === 'overview' &&
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
                            <tr key={c.id} className="group">
                              <td className="py-5">
                                <div className="font-bold text-ink group-hover:text-brand-600 transition-colors">{c.title}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{c.category}</div>
                              </td>
                              <td className="py-5 w-40">
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden mb-1">
                                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `0%` }} />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                  <span>0 ETH</span>
                                  <span>0%</span>
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
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              {/* Milestone Tracking */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-ink">Milestone Progress</h2>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Locked</p>
                      <p className="text-sm font-bold text-ink">25.0 ETH</p>
                    </div>
                    <div className="text-right border-l border-slate-100 pl-4">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Available</p>
                      <p className="text-sm font-bold text-brand-600">5.0 ETH</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                  {milestones.map((m) => (
                    <div key={m.id} className="relative pl-12 group">
                      <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-sm ${
                        m.status === 'Verified' ? 'bg-green-500 text-white' : 
                        m.status === 'In Progress' ? 'bg-brand-500 text-white' : 
                        'bg-slate-100 text-slate-300'
                      }`}>
                        {m.status === 'Verified' ? <CheckCircle2 size={18} /> : 
                         m.status === 'In Progress' ? <Clock size={18} className="animate-spin-slow" /> : 
                         <Milestone size={18} />}
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-ink">{m.title}</h4>
                          <p className="text-xs text-slate-400 font-medium mb-3">{m.date} • Verified On-Chain</p>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-400 border border-slate-100">
                              LOCKED: {m.locked} ETH
                            </span>
                            <span className="px-2 py-1 bg-brand-50 rounded-lg text-[9px] font-bold text-brand-600 border border-brand-100">
                              RELEASE: {m.available} ETH
                            </span>
                          </div>
                        </div>
                        {m.status === 'In Progress' && (
                          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-ink">
                            Submit Proof
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Feed Components */}
            <div className="space-y-8">
              {/* Recent Contributors */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-100">
                <h3 className="text-sm font-bold text-ink mb-6">Recent Backers</h3>
                <div className="space-y-6">
                  {contributions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-ink">{c.wallet}</p>
                          <p className="text-[9px] font-medium text-slate-400">{c.time}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-brand-600">+{c.amount} ETH</p>
                    </div>
                  ))}
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

              {/* Support / Quick Update */}
              <div className="bg-brand-50 rounded-[32px] p-8 border border-brand-100">
                <h3 className="text-sm font-bold text-brand-900 mb-2">Backer Engagement</h3>
                <p className="text-xs text-brand-900/60 leading-relaxed mb-6">
                  Transparency builds trust. Post a project update to your backers.
                </p>
                <button className="w-full py-3 rounded-xl bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-700 shadow-lg shadow-brand-600/20">
                  Post Update
                </button>
                </div>
              </div>
            </div>
          }

          {activeTab === 'campaigns' &&
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
                    {campaigns.map((c) => (
                      <div key={c.id} className="group bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500">
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
                              c.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              c.status === 'pending_approval' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              c.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }`}>
                              {c.status.replace('_', ' ')}
                            </span>
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
                                <span>0%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: '0%' }} />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Goal</p>
                                <p className="text-sm font-bold text-ink">{c.targetFunding} ETH</p>
                              </div>
                              <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-brand-50 hover:text-brand-500 transition-colors">
                                <ArrowUpRight size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            }
        </div>
      </main>
    </div>
  );
};

export default CampaignOwnerDashboard;
