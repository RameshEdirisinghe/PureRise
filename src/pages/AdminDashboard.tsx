import React, { useEffect, useState } from 'react';
import { 
  Users, ShieldCheck, CheckCircle, XCircle, 
  ExternalLink, Eye, MoreVertical, Search,
  Filter, Calendar, Mail, User, Info,
  CheckCircle2, X, Megaphone, Milestone,
  TrendingUp, Clock, AlertCircle
} from 'lucide-react';
import { getPendingRequests, reviewRequest, getSignedUrl } from '../api/admin';
import { getPendingCampaignsApi, reviewCampaignApi } from '../api/campaign';
import { getApiError } from '../utils/errorHelper';

// --- Types ---
interface SignedUrls {
  idFront: string;
  idBack: string;
  selfie: string;
}

interface OnboardingRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  fullName: string;
  idType: string;
  idFrontImage: string;
  idBackImage: string;
  selfieImage?: string;
  purposeCategory: string;
  profileHeadline: string;
  submittedAt: string;
}

interface Campaign {
  _id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  coverImage: string;
  targetFunding: number;
  endDate: string;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  milestones: Array<{
    title: string;
    description: string;
    expectedCompletionDate: string;
    status: string;
  }>;
  createdAt: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'kyc' | 'campaigns'>('kyc');
  
  // KYC State
  const [requests, setRequests] = useState<OnboardingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  
  // Campaign State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [signedUrls, setSignedUrls] = useState<SignedUrls>({ idFront: '', idBack: '', selfie: '' });
  const [campaignSignedUrl, setCampaignSignedUrl] = useState('');
  const [loadingUrls, setLoadingUrls] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingRequests();
      setRequests(data.data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getPendingCampaignsApi();
      setCampaigns(data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchSignedUrls = async (req: OnboardingRequest) => {
    try {
      setLoadingUrls(true);
      const [front, back, selfie] = await Promise.all([
        getSignedUrl(req.idFrontImage),
        getSignedUrl(req.idBackImage),
        req.selfieImage ? getSignedUrl(req.selfieImage) : Promise.resolve({ data: { signedUrl: '' } })
      ]);

      setSignedUrls({
        idFront: front.data.signedUrl,
        idBack: back.data.signedUrl,
        selfie: selfie.data.signedUrl
      });
    } catch (err) {
      console.error('Failed to fetch signed URLs', err);
    } finally {
      setLoadingUrls(false);
    }
  };

  useEffect(() => {
    if (selectedRequest) {
      fetchSignedUrls(selectedRequest);
    } else {
      setSignedUrls({ idFront: '', idBack: '', selfie: '' });
    }
  }, [selectedRequest]);

  useEffect(() => {
    const fetchCampaignUrl = async () => {
      if (selectedCampaign) {
        try {
          setLoadingUrls(true);
          const response = await getSignedUrl(selectedCampaign.coverImage, 'campaign-media');
          setCampaignSignedUrl(response.data.signedUrl);
        } catch (err) {
          console.error('Failed to fetch campaign signed URL', err);
        } finally {
          setLoadingUrls(false);
        }
      } else {
        setCampaignSignedUrl('');
      }
    };
    fetchCampaignUrl();
  }, [selectedCampaign]);

  useEffect(() => {
    if (activeTab === 'kyc') {
      fetchRequests();
    } else {
      fetchCampaigns();
    }
  }, [activeTab]);

  const handleKYCReview = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    try {
      setReviewing(true);
      await reviewRequest(selectedRequest._id, status, reviewNotes);
      setRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setReviewing(false);
    }
  };

  const handleCampaignReview = async (status: 'active' | 'rejected') => {
    if (!selectedCampaign) return;
    
    try {
      setReviewing(true);
      await reviewCampaignApi(selectedCampaign._id, status, reviewNotes);
      setCampaigns(prev => prev.filter(c => c._id !== selectedCampaign._id));
      setSelectedCampaign(null);
      setReviewNotes('');
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setReviewing(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // For campaign images, they might be in a different bucket or public URL
    if (activeTab === 'campaigns') {
       return `https://oymigkrebvrwygfhtnme.supabase.co/storage/v1/object/public/campaign-media/${path}`;
    }
    return `https://oymigkrebvrwygfhtnme.supabase.co/storage/v1/object/public/kyc-documents/${path}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Minimal Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 p-6 z-10 hidden lg:block">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">P</div>
          <span className="font-bold text-ink tracking-tight">PureRaise Admin</span>
        </div>

        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('kyc')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'kyc' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={18} />
            KYC Verifications
          </button>
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'campaigns' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Megaphone size={18} />
            Campaign Reviews
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 font-medium text-sm transition-all">
            <Users size={18} />
            User Management
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-ink">
              {activeTab === 'kyc' ? 'KYC Verifications' : 'Campaign Reviews'}
            </h1>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-xs font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded-full uppercase tracking-wider">
              {activeTab === 'kyc' ? requests.length : campaigns.length} Pending
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search requests..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <User size={20} />
            </div>
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm">
              <Info size={18} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : activeTab === 'kyc' ? (
            // KYC Verifications List
            requests.length === 0 ? (
              <div className="bg-white rounded-[32px] p-20 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">All Caught Up!</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  There are no pending campaign owner requests to review at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {requests.map((req) => (
                  <div 
                    key={req._id}
                    className="bg-white rounded-[32px] p-6 border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-500 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-ink leading-tight">{req.fullName}</h3>
                        <p className="text-xs text-slate-400 font-medium">{req.userId.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span>ID Type</span>
                        <span className="text-ink">{req.idType}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span>Category</span>
                        <span className="text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">{req.purposeCategory}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span>Submitted</span>
                        <span className="text-ink">{new Date(req.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedRequest(req)}
                      className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-ink transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Review Identity
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Campaign Reviews List
            campaigns.length === 0 ? (
              <div className="bg-white rounded-[32px] p-20 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                  <Megaphone size={40} />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">No Campaigns Pending</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  All submitted campaigns have been reviewed. New submissions will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {campaigns.map((camp) => (
                  <div 
                    key={camp._id}
                    className="bg-white rounded-[32px] p-6 border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all group relative overflow-hidden"
                  >
                    <div className="aspect-video bg-slate-100 rounded-2xl mb-6 overflow-hidden relative">
                      <img 
                        src={getImageUrl(camp.coverImage)} 
                        alt={camp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-600">
                        {camp.category}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold text-ink text-lg mb-1 truncate">{camp.title}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <User size={12} />
                        <span>By {camp.ownerId.name}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-3 bg-slate-50 rounded-2xl">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Goal</span>
                        <span className="text-sm font-bold text-ink">{camp.targetFunding} ETH</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Milestones</span>
                        <span className="text-sm font-bold text-ink">{camp.milestones.length} Phases</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedCampaign(camp)}
                      className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-ink transition-all flex items-center justify-center gap-2"
                    >
                      <Filter size={16} />
                      Verify Campaign
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* KYC Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 font-bold text-xl">
                  {selectedRequest.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink">{selectedRequest.fullName}</h2>
                  <p className="text-sm text-slate-400 font-medium">Reviewing {selectedRequest.idType} identification</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-3">
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">ID Front</span>
                  <div className="aspect-[1.6/1] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-2 relative">
                    {loadingUrls ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <img 
                        src={signedUrls.idFront} 
                        alt="ID Front" 
                        className="w-full h-full object-contain cursor-zoom-in" 
                        onClick={() => window.open(signedUrls.idFront, '_blank')}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">ID Back</span>
                  <div className="aspect-[1.6/1] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-2 relative">
                    {loadingUrls ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <img 
                        src={signedUrls.idBack} 
                        alt="ID Back" 
                        className="w-full h-full object-contain cursor-zoom-in"
                        onClick={() => window.open(signedUrls.idBack, '_blank')}
                      />
                    )}
                  </div>
                </div>
              </div>

              {selectedRequest.selfieImage && (
                <div className="mb-10 max-w-md mx-auto space-y-3">
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block text-center">Selfie Verification</span>
                  <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-2 relative">
                    {loadingUrls ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <img 
                        src={signedUrls.selfie} 
                        alt="Selfie" 
                        className="w-full h-full object-cover rounded-2xl" 
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block mb-3">Decision Notes (Optional)</label>
                  <textarea 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm h-24 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Provide reasoning for rejection or internal notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex gap-4 bg-white">
              <button 
                onClick={() => handleKYCReview('rejected')}
                disabled={reviewing}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-red-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Reject Identity
              </button>
              <button 
                onClick={() => handleKYCReview('approved')}
                disabled={reviewing}
                className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-brand-600 shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                {reviewing ? 'Processing...' : 'Approve Campaign Owner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                  <Megaphone size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink">{selectedCampaign.title}</h2>
                  <p className="text-sm text-slate-400 font-medium">Reviewing campaign submission</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Content */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="aspect-video bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm relative">
                    {loadingUrls ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <img 
                        src={campaignSignedUrl} 
                        alt="Cover" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>

                  <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <div className="mb-6">
                      <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block mb-2">Campaign Story</span>
                      <h3 className="text-lg font-bold text-ink mb-4">{selectedCampaign.summary}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{selectedCampaign.description}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block mb-6">Milestone Roadmap</span>
                    <div className="space-y-4">
                      {selectedCampaign.milestones.map((m, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:border-slate-100 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 font-bold text-sm">
                            {i + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-ink">{m.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Info & Review */}
                <div className="space-y-8">
                  <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Owner Information</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {selectedCampaign.ownerId.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink">{selectedCampaign.ownerId.name}</p>
                          <p className="text-xs text-slate-400">{selectedCampaign.ownerId.email}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Campaign Metrics</label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                          <div className="flex items-center gap-2 text-slate-400">
                            <TrendingUp size={14} />
                            <span className="text-[10px] font-bold uppercase">Goal</span>
                          </div>
                          <span className="text-sm font-bold text-brand-600">{selectedCampaign.targetFunding} ETH</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase">Ends</span>
                          </div>
                          <span className="text-sm font-bold text-ink">{new Date(selectedCampaign.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Reviewer Notes</label>
                      <textarea 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm h-32 focus:ring-2 focus:ring-brand-500/20"
                        placeholder="Feedback for the owner..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex gap-4 bg-white">
              <button 
                onClick={() => handleCampaignReview('rejected')}
                disabled={reviewing}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-red-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Reject Campaign
              </button>
              <button 
                onClick={() => handleCampaignReview('active')}
                disabled={reviewing}
                className={`flex-[2] py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                  reviewing ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                }`}
              >
                <CheckCircle size={18} />
                {reviewing ? 'Processing...' : 'Approve & Launch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
