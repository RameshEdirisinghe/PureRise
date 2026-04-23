import React, { useState } from 'react';
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
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 group ${
      active 
        ? 'bg-brand-600 text-white border-r-4 border-white shadow-lg' 
        : 'text-brand-100 hover:bg-brand-700/50 hover:text-white'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-brand-300 group-hover:text-white'} />
    <span className="text-sm font-bold tracking-wide uppercase">{label}</span>
  </button>
);

const MetricCard = ({ title, value, icon: Icon, subValue }: any) => (
  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-500 group">
    <div className="flex items-start justify-between mb-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-500">
        <Icon size={28} />
      </div>
      <span className="text-[0.65rem] font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded-full uppercase tracking-widest">
        Live Data
      </span>
    </div>
    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-brand-900 tracking-tight">{value}</span>
      {subValue && <span className="text-sm font-medium text-slate-400">{subValue}</span>}
    </div>
  </div>
);

const CampaignOwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [walletConnected, setWalletConnected] = useState(false);

  // Mock Data
  const campaigns = [
    { id: 1, title: 'Decentralized Solar Grid', raised: 12.5, goal: 20, status: 'Active', contributors: 145 },
    { id: 2, title: 'AI Governance DAO', raised: 45.0, goal: 50, status: 'Active', contributors: 890 },
    { id: 3, title: 'Clean Water Protocol', raised: 10, goal: 10, status: 'Completed', contributors: 320 },
  ];

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
    <div className="min-h-screen bg-[#F8FAFC] flex" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {/* Sidebar */}
      <aside className="w-72 bg-brand-900 min-h-screen sticky top-0 flex flex-col z-20 shadow-2xl shadow-brand-900/20">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-900 font-bold text-2xl shadow-inner">P</div>
            <span className="text-2xl font-bold text-white tracking-tighter uppercase italic">PureRaise</span>
          </div>
        </div>

        <nav className="flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={Megaphone} label="My Campaigns" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
          <SidebarItem icon={PlusCircle} label="Create New Campaign" active={activeTab === 'create'} onClick={() => setActiveTab('create')} />
          <SidebarItem icon={Milestone} label="Milestone Management" active={activeTab === 'milestones'} onClick={() => setActiveTab('milestones')} />
          <SidebarItem icon={History} label="Withdrawal History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <SidebarItem icon={Settings} label="Profile Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-8">
          <div className="bg-brand-800 rounded-2xl p-4 border border-brand-700/50">
            <p className="text-[0.65rem] font-bold text-brand-400 uppercase tracking-widest mb-2">Smart Contract Status</p>
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-tight">Mainnet Optimized</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-brand-900 tracking-tight">Welcome, {user?.name || 'Campaign Owner'}</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your decentralized funding and milestone progress.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-brand-600 transition-colors">
                <Bell size={22} />
              </button>
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>

            <button 
              onClick={() => setWalletConnected(!walletConnected)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                walletConnected 
                  ? 'bg-green-50 text-green-600 border border-green-100' 
                  : 'bg-brand-900 text-white hover:bg-brand-800 shadow-xl shadow-brand-900/20 active:scale-95'
              }`}
            >
              <Wallet size={18} />
              {walletConnected ? '0x71C...4f8' : 'Connect MetaMask'}
            </button>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <MetricCard title="Total Funds Raised" value="57.5" subValue="ETH" icon={TrendingUp} />
          <MetricCard title="Active Campaigns" value="2" icon={Megaphone} />
          <MetricCard title="Total Contributors" value="1,035" icon={UsersIcon} />
          <MetricCard title="Next Milestone" value="12" subValue="Days" icon={Calendar} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Active Campaigns List */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-brand-900">Active Campaigns</h2>
                <button className="text-brand-600 font-bold text-sm uppercase tracking-widest hover:underline">View All</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-50">
                      <th className="pb-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Campaign Title</th>
                      <th className="pb-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Funding Progress</th>
                      <th className="pb-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="pb-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {campaigns.map((c) => (
                      <tr key={c.id} className="group">
                        <td className="py-6 pr-4">
                          <div className="font-bold text-brand-900 group-hover:text-brand-600 transition-colors">{c.title}</div>
                          <div className="text-xs text-slate-400 font-medium">{c.contributors} Backers</div>
                        </td>
                        <td className="py-6 pr-4 w-48">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-brand-900">{c.raised} ETH</span>
                            <span className="text-[0.65rem] font-bold text-slate-400">{(c.raised / c.goal * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-600 rounded-full transition-all duration-1000" 
                              style={{ width: `${(c.raised / c.goal * 100)}%` }} 
                            />
                          </div>
                        </td>
                        <td className="py-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest ${
                            c.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-600 transition-colors">
                            <ArrowUpRight size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Milestone Tracking */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-brand-900">Milestone Tracking</h2>
                  <p className="text-sm text-slate-400 font-medium">Verify progress to unlock smart contract funds.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Locked Funds</p>
                    <p className="text-lg font-bold text-brand-900">25.0 ETH</p>
                  </div>
                  <div className="h-10 w-px bg-slate-100" />
                  <div className="text-right">
                    <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Available</p>
                    <p className="text-lg font-bold text-brand-600">5.0 ETH</p>
                  </div>
                </div>
              </div>

              <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                {milestones.map((m) => (
                  <div key={m.id} className="relative pl-16 group">
                    <div className={`absolute left-0 top-1 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      m.status === 'Verified' ? 'bg-green-100 text-green-600' : 
                      m.status === 'In Progress' ? 'bg-brand-50 text-brand-600' : 
                      'bg-slate-50 text-slate-300'
                    }`}>
                      {m.status === 'Verified' ? <CheckCircle2 size={24} /> : 
                       m.status === 'In Progress' ? <Clock size={24} className="animate-spin-slow" /> : 
                       <Milestone size={24} />}
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-brand-900 mb-1">{m.title}</h4>
                        <p className="text-xs text-slate-400 font-medium mb-4">{m.date} • Smart Contract Verified</p>
                        <div className="flex gap-4">
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <span className="text-[0.6rem] font-bold text-slate-400 uppercase block tracking-tighter">Locked</span>
                            <span className="text-sm font-bold text-brand-900">{m.locked} ETH</span>
                          </div>
                          <div className="bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                            <span className="text-[0.6rem] font-bold text-brand-400 uppercase block tracking-tighter">Release</span>
                            <span className="text-sm font-bold text-brand-600">{m.available} ETH</span>
                          </div>
                        </div>
                      </div>
                      
                      {m.status === 'In Progress' && (
                        <button className="px-6 py-3 bg-brand-900 text-white font-bold text-[0.7rem] uppercase tracking-widest rounded-xl hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/10">
                          Submit Proof
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Components */}
          <div className="space-y-12">
            {/* Wallet Info / Etherscan */}
            <div className="bg-brand-900 rounded-[40px] p-10 text-white shadow-2xl shadow-brand-900/20">
              <h3 className="text-xl font-bold mb-6 italic tracking-tight">On-Chain Verification</h3>
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[0.6rem] font-bold text-brand-400 uppercase tracking-widest">Active Contract</p>
                    <p className="text-xs font-mono mt-1 text-brand-100">0x8920...248e</p>
                  </div>
                  <ExternalLink size={18} className="text-brand-400" />
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[0.6rem] font-bold text-brand-400 uppercase tracking-widest">Verified on</p>
                    <p className="text-sm font-bold mt-1 text-white">Etherscan</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Contribution Feed */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-brand-900 mb-8">Recent Backers</h3>
              <div className="space-y-8">
                {contributions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-900">{c.wallet}</p>
                        <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">{c.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-600">+{c.amount} ETH</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 mt-10 rounded-2xl border border-slate-100 text-slate-400 font-bold text-[0.7rem] uppercase tracking-widest hover:bg-slate-50 transition-all">
                View Transaction Feed
              </button>
            </div>

            {/* Quick Support */}
            <div className="bg-brand-50 rounded-[40px] p-10 border border-brand-100">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-600 mb-6 shadow-sm">
                <Bell size={24} />
              </div>
              <h3 className="text-xl font-bold text-brand-900 mb-2">Backer Communication</h3>
              <p className="text-sm text-brand-900/60 leading-relaxed mb-6">
                Post direct updates to your backers to maintain transparency and trust.
              </p>
              <button className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-[0.7rem] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">
                Post Update
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignOwnerDashboard;
