import React, { useEffect, useState } from 'react';
import { 
  Users, ShieldCheck, CheckCircle, XCircle, 
  ExternalLink, Eye, MoreVertical, Search,
  Filter, Calendar, Mail, User, Info,
  CheckCircle2, X
} from 'lucide-react';
import { getPendingRequests, reviewRequest, getSignedUrl } from '../api/admin';
import { getApiError } from '../utils/errorHelper';

// --- Types ---
interface SignedUrls {
  idFront: string;
  idBack: string;
  selfie: string;
}

// --- Constants ---
const SUPABASE_BASE_URL = 'https://oymigkrebvrwygfhtnme.supabase.co/storage/v1/object/public/kyc-documents/';

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

const AdminDashboard = () => {
  const [requests, setRequests] = useState<OnboardingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [signedUrls, setSignedUrls] = useState<SignedUrls>({ idFront: '', idBack: '', selfie: '' });
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
    fetchRequests();
  }, []);

  const handleReview = async (status: 'approved' | 'rejected') => {
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

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${SUPABASE_BASE_URL}${path}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Minimal Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 p-6 z-10 hidden lg:block">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">P</div>
          <span className="font-bold text-ink tracking-tight">PureRaise Admin</span>
        </div>

        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 text-brand-600 font-bold text-sm transition-all">
            <ShieldCheck size={18} />
            KYC Verifications
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
            <h1 className="text-xl font-bold text-ink">KYC Verifications</h1>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-xs font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded-full uppercase tracking-wider">
              {requests.length} Pending
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
          ) : requests.length === 0 ? (
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
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-500">
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
          )}
        </div>
      </main>

      {/* Detail Modal */}
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
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block mb-3">Profile Intent</label>
                  <h4 className="font-bold text-ink mb-1">{selectedRequest.profileHeadline}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{selectedRequest.profileHeadline}</p>
                </div>

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
                onClick={() => handleReview('rejected')}
                disabled={reviewing}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-red-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Reject Request
              </button>
              <button 
                onClick={() => handleReview('approved')}
                disabled={reviewing}
                className="flex-[2] py-4 rounded-2xl bg-brand-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-brand-600 shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                {reviewing ? 'Processing...' : 'Approve Campaign Owner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
