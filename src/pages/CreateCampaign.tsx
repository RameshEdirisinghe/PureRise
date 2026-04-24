import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  PlusCircle, 
  Milestone, 
  History, 
  Settings, 
  Wallet, 
  ChevronRight,
  ChevronLeft,
  Upload,
  Info,
  Trash2,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Calendar as CalendarIcon,
  User,
  Bell,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createCampaignApi, uploadCampaignMediaApi } from '../api/campaign';
import { getApiError } from '../context/AuthContext';

// --- Sub-components ---

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

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'The Vision', description: 'Basics' },
    { id: 2, label: 'Funding', description: 'Goals & Time' },
    { id: 3, label: 'Milestones', description: 'Smart Rules' },
    { id: 4, label: 'Review', description: 'Deployment' }
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-16">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center relative group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
              currentStep >= step.id 
                ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' 
                : 'bg-white border-slate-200 text-slate-400'
            }`}>
              {currentStep > step.id ? <CheckCircle2 size={20} /> : <span className="text-xs font-bold">{step.id}</span>}
            </div>
            <div className="absolute -bottom-8 text-center w-max">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= step.id ? 'text-brand-600' : 'text-slate-400'}`}>
                {step.label}
              </p>
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-[2px] mx-4 transition-all duration-700 ${currentStep > step.id ? 'bg-brand-500' : 'bg-slate-100'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Main Page ---

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    category: 'startup',
    fundingGoal: '',
    endDate: '',
    coverImage: '' // Stores the path from Supabase
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      setUploadLoading(true);
      
      // Use the campaign API client for consistent error handling and automatic cookie inclusion
      const result = await uploadCampaignMediaApi(file);
      setFormData(prev => ({ ...prev, coverImage: result.filePath }));
      
    } catch (err: any) {
      console.error('Upload error:', err);
      // Check if there's a helpful user-friendly message from the API client
      if (err.userFriendlyMessage) {
        setError(err.userFriendlyMessage);
      } else {
        setError(getApiError(err) || 'Failed to upload media. Please try again.');
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const [milestones, setMilestones] = useState([
    { title: '', description: '', percentage: 0 }
  ]);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMilestone = () => {
    if (totalPercentage >= 100) return;
    setMilestones([...milestones, { title: '', description: '', percentage: 0 }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: string, value: string | number) => {
    const updated = [...milestones];
    (updated[index] as any)[field] = value;
    setMilestones(updated);
  };

  const handleDeploy = async () => {
    try {
      setError('');
      setSuccessMessage('');
      
      // Validate required fields
      if (!formData.title || !formData.summary || !formData.description) {
        setError('Please fill in all campaign details.');
        return;
      }

      if (!formData.coverImage) {
        setError('Please upload a cover image for your campaign.');
        return;
      }

      if (totalPercentage !== 100) {
        setError('Milestone percentages must total exactly 100%.');
        return;
      }

      setDeploying(true);

      // Call the backend API to create the campaign
      const response = await createCampaignApi({
        title: formData.title,
        summary: formData.summary,
        description: formData.description,
        category: (formData.category.toLowerCase() as any),
        coverImage: formData.coverImage,
        targetFunding: Number(formData.fundingGoal),
        endDate: formData.endDate,
        goalDescription: formData.description.slice(0, 1000), // Ensure it stays within 1000 char limit
        milestones: milestones.map(m => ({
          title: m.title,
          description: m.description || m.title, // Fallback to title if description empty
          percentage: Number(m.percentage)
        }))
      });

      setSuccessMessage('🎉 Campaign created successfully! Awaiting admin approval...');
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        navigate('/campaign-owner/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Deploy error:', err);
      setError(getApiError(err) || 'Failed to create campaign. Please try again.');
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 p-6 z-10 hidden lg:block">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">P</div>
          <span className="font-bold text-ink tracking-tight">PureRaise Owner</span>
        </div>

        <nav className="space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/campaign-owner/dashboard')} />
          <SidebarItem icon={Megaphone} label="My Campaigns" />
          <SidebarItem icon={PlusCircle} label="Create Campaign" active />
          <SidebarItem icon={Milestone} label="Milestones" />
          <SidebarItem icon={History} label="Withdrawals" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-ink">Campaign Wizard</h1>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full border border-brand-100">
              <ShieldCheck size={12} className="text-brand-600" />
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Secure Deployment</span>
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

        <div className="p-12 max-w-5xl mx-auto" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          <Stepper currentStep={step} />

          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-900">{successMessage}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm transition-all duration-500">
            
            {/* STEP 1: THE VISION */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Campaign Title</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Clean Oceans Initiative" 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Short Summary</label>
                    <input 
                      type="text" 
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      placeholder="One sentence that captures the essence of your project" 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 font-sans"
                    >
                      <option value="startup">Startup</option>
                      <option value="medical">Medical</option>
                      <option value="education">Education</option>
                      <option value="social">Social Impact</option>
                      <option value="technology">Technology</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Full Story</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell your story. Why does this project matter?" 
                    className="w-full p-6 bg-slate-50 border-none rounded-2xl text-sm h-48 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Media Upload</label>
                  <label className="relative border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-brand-500 hover:bg-brand-50/30 transition-all cursor-pointer group block overflow-hidden">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploadLoading}
                    />
                    
                    {uploadLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-bold text-brand-600 font-sans">Uploading to Supabase...</p>
                      </div>
                    ) : formData.coverImage ? (
                      <div className="space-y-4">
                        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                           <img 
                            src={`https://oymigkrebvrwygfhtnme.supabase.co/storage/v1/object/public/campaign-media/${formData.coverImage}`} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                           />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                             <p className="text-white text-xs font-bold uppercase tracking-widest">Change Media</p>
                           </div>
                        </div>
                        <p className="text-[10px] text-green-600 font-bold uppercase">✓ Uploaded successfully</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-bold text-ink mb-1 font-sans">Click or drag and drop to upload cover media</p>
                        <p className="text-[11px] text-slate-400 uppercase font-sans">High quality JPG, PNG, or MP4</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* STEP 2: FUNDING & TIMELINE */}
            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Funding Goal (ETH)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        name="fundingGoal"
                        value={formData.fundingGoal}
                        onChange={handleInputChange}
                        placeholder="0.00" 
                        className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <TrendingUp size={18} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">End Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 font-sans"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <CalendarIcon size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-50 rounded-3xl p-8 border border-brand-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm shrink-0">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-900 mb-1 font-sans uppercase tracking-tight">Smart Contract Protection</h4>
                    <p className="text-xs text-brand-800/70 leading-relaxed">
                      PureRaise uses Milestone-Based Funding. Your total goal will be locked in a smart contract and released to your wallet in stages as you complete verified milestones. This builds maximum trust with your contributors.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: MILESTONES */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-ink">Milestone Definitions</h2>
                    <p className="text-xs text-slate-400 font-medium">Break down your project into verifiable phases.</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border-2 transition-all ${totalPercentage === 100 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-brand-50 border-brand-100 text-brand-600'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Total Allocation: </span>
                    <span className="text-sm font-bold">{totalPercentage}%</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 relative group">
                      <button 
                        onClick={() => handleRemoveMilestone(idx)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-400 rounded-full border border-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-3">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Phase {idx + 1} Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Prototype Development"
                            value={milestone.title}
                            onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                            className="w-full p-4 bg-white border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Release %</label>
                          <input 
                            type="number" 
                            placeholder="0"
                            value={milestone.percentage}
                            onChange={(e) => handleMilestoneChange(idx, 'percentage', e.target.value)}
                            className="w-full p-4 bg-white border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Deliverables & Evidence</label>
                          <textarea 
                            placeholder="Describe what will be achieved and what evidence you will provide (e.g. GitHub repo, photos, test reports)"
                            value={milestone.description}
                            onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                            className="w-full p-4 bg-white border border-slate-100 rounded-xl text-sm h-24 focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleAddMilestone}
                  disabled={totalPercentage >= 100}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2 font-sans"
                >
                  <PlusCircle size={16} />
                  Add New Milestone
                </button>

                {totalPercentage !== 100 && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest justify-center font-sans">
                    <Info size={14} />
                    Total percentage must equal exactly 100% to proceed
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: FINAL REVIEW */}
            {step === 4 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center max-w-lg mx-auto">
                  <h2 className="text-2xl font-bold text-brand-900 mb-2 italic">Ready for the Blockchain?</h2>
                  <p className="text-sm text-slate-400">Review your campaign architecture before permanent deployment.</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Basics</h3>
                    <div>
                      <p className="text-lg font-bold text-ink">{formData.title}</p>
                      <p className="text-xs text-brand-600 font-bold uppercase">{formData.category}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">Target Goal</p>
                       <p className="text-xl font-bold text-brand-900">{formData.fundingGoal} ETH</p>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Milestone Roadmap</h3>
                    <div className="space-y-4">
                      {milestones.map((m, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="font-bold text-ink">{m.title}</span>
                          <span className="px-2 py-0.5 bg-brand-50 text-brand-600 rounded-lg font-bold text-[10px]">{m.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[32px] p-10 text-white flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-brand-400">
                      <Rocket size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Launch Configuration</h4>
                      <p className="text-xs text-brand-300">Deployment will interact with MetaMask and initialize smart contracts.</p>
                    </div>
                  </div>
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="mt-16 flex items-center justify-between pt-8 border-t border-slate-50">
              <button 
                onClick={() => {
                  setError('');
                  setSuccessMessage('');
                  setStep(step - 1);
                }}
                disabled={step === 1 || deploying}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-0 font-sans"
              >
                <ChevronLeft size={18} />
                Back
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={() => {
                    setError('');
                    setStep(step + 1);
                  }}
                  disabled={(step === 3 && totalPercentage !== 100) || !formData.title || deploying}
                  className="flex items-center gap-2 px-10 py-4 bg-brand-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-ink shadow-xl shadow-brand-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale font-sans"
                >
                  Next Step
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleDeploy}
                  disabled={deploying || totalPercentage !== 100 || !formData.coverImage}
                  className="flex items-center gap-3 px-12 py-4 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-700 shadow-xl shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:grayscale font-sans"
                >
                  {deploying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Rocket size={18} />
                      Confirm & Deploy to Mainnet
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;
