import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  Wallet, 
  LayoutDashboard, 
  HandHeart, 
  Bookmark, 
  Settings,
  ChevronRight,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getActiveCampaignsApi, type CampaignResponse } from '../api/campaign';
import { toast } from 'react-hot-toast';

// --- Styled Components & Sub-components ---

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
      active 
        ? 'bg-brand-50 text-brand-600 font-bold' 
        : 'text-slate-400 hover:bg-slate-50 font-medium'
    }`}
    style={{ fontFamily: active ? 'inherit' : '"Times New Roman", Times, serif' }}
  >
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </button>
);

const CategoryPill = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${
      active 
        ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20' 
        : 'bg-white text-slate-500 border-slate-100 hover:border-brand-200 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

const CampaignCard = ({ campaign, isSaved, onToggleSave, onViewDetails }: any) => {
  const progress = Math.min(Math.round((0 / campaign.targetFunding) * 100), 100); 

  const calculateDaysRemaining = (dateStr: string) => {
    const end = new Date(dateStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemaining = calculateDaysRemaining(campaign.endDate);

  return (
    <div className="group bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500 relative">
      {/* Cover Image */}
      <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-100">
        {campaign.coverImage ? (
          <img 
            src={campaign.coverImage} 
            alt={campaign.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <TrendingUp size={40} className="text-slate-200" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/90 text-brand-600 border border-white/20 shadow-sm">
            {campaign.category}
          </span>
        </div>

        {/* Heart Icon */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(campaign.id);
          }}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isSaved 
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
              : 'bg-white/90 text-slate-400 hover:text-red-500 backdrop-blur-md'
          }`}
        >
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={() => onViewDetails(campaign.id)}
            className="px-6 py-3 bg-white text-ink rounded-2xl font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-ink mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors tracking-tight">
          {campaign.title}
        </h3>
        
        <div className="space-y-4 mt-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">
              <span style={{ fontFamily: '"Times New Roman", Times, serif' }}>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
              <div 
                className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Raised</p>
              <p className="text-sm font-bold text-ink">0.00 <span className="text-[10px] text-brand-500">ETH</span></p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Remaining</p>
              <div className="flex items-center gap-1 text-sm font-bold text-ink">
                <Clock size={12} className="text-brand-500" />
                <span>{daysRemaining}d</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContributorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [walletConnected, setWalletConnected] = useState(false);
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);

  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveCampaigns();
    // Load saved campaigns from local storage
    const saved = localStorage.getItem('pure_raise_watchlist');
    if (saved) setSavedCampaigns(JSON.parse(saved));
  }, []);

  const fetchActiveCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await getActiveCampaignsApi();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveCampaign = (id: string) => {
    const isSaved = savedCampaigns.includes(id);
    let newSaved;
    if (isSaved) {
      newSaved = savedCampaigns.filter(sId => sId !== id);
    } else {
      newSaved = [...savedCampaigns, id];
      toast.success('Project Saved!', {
        icon: '❤️',
        style: {
          borderRadius: '16px',
          background: '#333',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px'
        },
      });
    }
    setSavedCampaigns(newSaved);
    localStorage.setItem('pure_raise_watchlist', JSON.stringify(newSaved));
  };

  const categories = ['All', 'Education', 'Healthcare', 'Environment', 'Community', 'Startup', 'Technology'];

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const watchlistItems = campaigns.filter(c => c && c.id && savedCampaigns.includes(c.id));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style>{`
        body {
          font-family: 'Times New Roman', Times, serif;
        }
        h1, h2, h3, h4, h5, h6, button, span, .sans-serif {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-weight: 700;
        }
      `}</style>

      {/* Sidebar - Matches CampaignOwnerDashboard */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 p-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">P</div>
          <span className="font-bold text-ink tracking-tight">PureRaise Contributor</span>
        </div>

        <nav className="space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Discovery" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={HandHeart} label="My Donations" active={activeTab === 'donations'} onClick={() => setActiveTab('donations')} />
          <SidebarItem icon={Bookmark} label="Saved Campaigns" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <button 
            onClick={logout}
            className="w-full py-3 px-4 rounded-xl border border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-64 min-h-screen">
        
        {/* Sticky Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-4 ml-8">
            <button 
              onClick={() => setShowWatchlist(!showWatchlist)}
              className={`relative p-2.5 rounded-xl border transition-all ${
                showWatchlist ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-white border-slate-100 text-slate-400 hover:border-brand-200'
              }`}
            >
              <Bookmark size={20} />
              {savedCampaigns.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                  {savedCampaigns.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setWalletConnected(!walletConnected)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                walletConnected 
                  ? 'bg-green-50 text-green-600 border border-green-100 shadow-green-500/10' 
                  : 'bg-slate-900 text-white hover:bg-ink shadow-slate-900/20'
              }`}
            >
              <Wallet size={14} />
              {walletConnected ? '0x71C...4f8' : 'Connect Wallet'}
            </button>
          </div>
        </header>

        {/* Content Section */}
        <div className="p-8">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Category Filter */}
              <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400">
                  <Filter size={18} />
                </div>
                {categories.map(cat => (
                  <CategoryPill 
                    key={cat} 
                    label={cat} 
                    active={activeCategory === cat} 
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </div>

              {/* Title Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-ink tracking-tight">Discover Campaigns</h1>
                  <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Support innovative projects and meaningful causes.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span>Sort by:</span>
                  <select className="bg-transparent border-none focus:ring-0 text-ink font-bold cursor-pointer">
                    <option>Newest First</option>
                    <option>Most Funded</option>
                    <option>Ending Soon</option>
                  </select>
                </div>
              </div>

              {/* Campaign Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden h-[450px] animate-pulse">
                      <div className="aspect-[4/3] bg-slate-100" />
                      <div className="p-6 space-y-4">
                        <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
                        <div className="h-4 w-full bg-slate-50 rounded-lg" />
                        <div className="h-4 w-1/2 bg-slate-50 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-slate-200" size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-ink mb-2">No campaigns found</h2>
                  <p className="text-slate-400 max-w-sm mx-auto" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    We couldn't find any campaigns matching your current search or category filter.
                  </p>
                  <button 
                    onClick={() => {setSearchQuery(''); setActiveCategory('All');}}
                    className="mt-8 px-8 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-500/20"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                  {filteredCampaigns.map(campaign => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      isSaved={savedCampaigns.includes(campaign.id)}
                      onToggleSave={toggleSaveCampaign}
                      onViewDetails={(id: string) => navigate(`/campaign/${id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-500">
                <HandHeart size={40} />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">No Donations Yet</h2>
              <p className="text-slate-400 max-w-sm mx-auto" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                You haven't contributed to any campaigns yet. Start your impact journey today.
              </p>
              <button 
                onClick={() => setActiveTab('overview')}
                className="mt-8 px-8 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm"
              >
                Explore Campaigns
              </button>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-ink tracking-tight">Saved Campaigns</h1>
              {watchlistItems.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Bookmark size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-ink mb-2">Your Watchlist is empty</h2>
                  <p className="text-slate-400 max-w-sm mx-auto" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    Save campaigns you're interested in to track their progress here.
                  </p>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="mt-8 px-8 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm"
                  >
                    Browse Projects
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {watchlistItems.map(campaign => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      isSaved={true}
                      onToggleSave={toggleSaveCampaign}
                      onViewDetails={(id: string) => navigate(`/campaign/${id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-[40px] border border-slate-100 p-12 max-w-2xl">
              <h2 className="text-2xl font-bold text-ink mb-8">Profile Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                  <div className="w-20 h-20 rounded-[28px] bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-2xl shadow-inner">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-lg">{user?.name}</h3>
                    <p className="text-slate-400 text-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{user?.email}</p>
                    <button className="mt-2 text-xs font-bold text-brand-500 hover:underline">Change Avatar</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" defaultValue={user?.name} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" defaultValue={user?.email} disabled className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium outline-none opacity-60 cursor-not-allowed" />
                  </div>
                </div>
                
                <div className="pt-6">
                  <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-ink transition-all shadow-lg shadow-slate-900/20">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Watchlist Drawer (Mobile/Condensed view) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out border-l border-slate-100 ${showWatchlist ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-ink">My Watchlist</h2>
            <button onClick={() => setShowWatchlist(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {watchlistItems.length === 0 ? (
              <div className="py-12 text-center">
                <Bookmark className="mx-auto text-slate-200 mb-4" size={40} />
                <p className="text-slate-400 text-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Your watchlist is empty.</p>
              </div>
            ) : (
              watchlistItems.map(item => (
                <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-slate-50 hover:border-brand-100 transition-colors group relative">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img src={item.coverImage} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mb-1">{item.category}</p>
                    <h4 className="text-sm font-bold text-ink line-clamp-1 group-hover:text-brand-600 transition-colors">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Goal: {item.targetFunding} ETH</p>
                  </div>
                  <button 
                    onClick={() => toggleSaveCampaign(item.id)}
                    className="absolute top-2 right-2 p-1 bg-white shadow-sm rounded-lg text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-6">
            <button 
              onClick={() => {setShowWatchlist(false); setActiveTab('saved');}}
              className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-500/20"
            >
              View Full Watchlist
            </button>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {showWatchlist && (
        <div className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowWatchlist(false)} />
      )}
    </div>
  );
};

export default ContributorDashboard;
