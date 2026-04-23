import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, ShieldCheck, Target, Wallet, FileCheck, 
  CheckCircle2, ArrowRight, ArrowLeft, Upload, 
  Lock, Info, MapPin, Phone, Calendar, Camera, X
} from 'lucide-react';
import api from '../api/axios';
import { uploadKYCImage, submitOnboarding } from '../api/kyc';
import { getApiError } from '../utils/errorHelper';
import { compressImage } from '../utils/imageCompression';

// --- Types ---
type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 'success';

interface OnboardingData {
  // Step 1
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  // Step 2
  idType: 'passport' | 'nic' | 'driver_license';
  idFrontImage: string; // Using URLs for now as placeholders
  idBackImage: string;
  selfieImage?: string;
  // Step 3
  profileHeadline: string;
  profileBio: string;
  purposeCategory: string;
  // Step 4
  walletAddress: string;
  // Step 5
  agreed: boolean;
}

// --- Components ---

const ProgressIndicator = ({ currentStep }: { currentStep: OnboardingStep }) => {
  const steps = [
    { id: 1, icon: User, label: 'Personal' },
    { id: 2, icon: ShieldCheck, label: 'Identity' },
    { id: 3, icon: Target, label: 'Profile' },
    { id: 4, icon: Wallet, label: 'Wallet' },
    { id: 5, icon: FileCheck, label: 'Submit' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-brand-500 -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${typeof currentStep === 'number' ? ((currentStep - 1) / (steps.length - 1)) * 100 : 100}%` }}
        />

        {steps.map((s) => {
          const isCompleted = typeof currentStep === 'number' ? currentStep > s.id : currentStep === 'success';
          const isActive = currentStep === s.id;
          
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isCompleted ? 'bg-brand-500 border-brand-500 text-white' : 
                  isActive ? 'bg-white border-brand-500 text-brand-500 shadow-lg shadow-brand-500/20' : 
                  'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : <s.icon size={18} />}
              </div>
              <span className={`absolute -bottom-7 text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap ${
                isActive ? 'text-brand-600' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraModal = ({ onCapture, onClose }: CameraModalProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Camera access denied or not available.');
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            onClose();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] overflow-hidden w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <Camera size={20} className="text-brand-500" />
            Verify Identity
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
          {error ? (
            <div className="text-white text-center p-8">
              <Info size={32} className="mx-auto mb-4 text-red-400" />
              <p className="font-bold">{error}</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>

        <div className="p-8 flex flex-col items-center gap-4">
          <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">
            Position your face and ID clearly within the frame
          </p>
          <button 
            onClick={handleCapture}
            disabled={!!error}
            className="w-16 h-16 rounded-full border-4 border-slate-200 p-1 hover:border-brand-500 transition-all active:scale-95"
          >
            <div className="w-full h-full rounded-full bg-brand-500 flex items-center justify-center text-white">
              <Camera size={28} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const CampaignOwnerOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    country: '',
    idType: 'passport',
    idFrontImage: '', 
    idBackImage: '',
    selfieImage: '',
    profileHeadline: '',
    profileBio: '',
    purposeCategory: '',
    walletAddress: '',
    agreed: false,
  });

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [showCamera, setShowCamera] = useState(false);

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = async () => {
    if (typeof step === 'number' && step < 5) {
      setStep((step + 1) as OnboardingStep);
      window.scrollTo(0, 0);
    } else if (step === 5) {
      handleFinalSubmit();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'idFrontImage' | 'idBackImage' | 'selfieImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum allowed size is 5MB.');
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // Upload to Supabase via Backend
    setUploading(prev => ({ ...prev, [field]: true }));
    setError('');
    
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      const filePath = await uploadKYCImage(compressedFile);
      updateData({ [field]: filePath });
    } catch (err) {
      setError(`Failed to upload ${field.replace('Image', '')}: ${getApiError(err)}`);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleCapturePhoto = async (file: File) => {
    const field = 'selfieImage';
    
    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    setUploading(prev => ({ ...prev, [field]: true }));
    setError('');
    
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      const filePath = await uploadKYCImage(compressedFile);
      updateData({ [field]: filePath });
    } catch (err) {
      setError(`Failed to capture selfie: ${getApiError(err)}`);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleFinalSubmit = async () => {
    console.log('Final submit initiated', data);
    if (!data.idFrontImage || !data.idBackImage) {
      setError('Please upload both front and back images of your ID');
      setStep(2);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await submitOnboarding(data);
      console.log('Submission success:', response);
      setStep('success');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Submission failed:', err);
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (typeof step === 'number' && step > 1) {
      setStep((step - 1) as OnboardingStep);
      window.scrollTo(0, 0);
    }
  };

  // --- Step Renders ---

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink tracking-tight">Personal Information</h2>
        <p className="text-sm text-ink-muted mt-1">Basic details for account security and verification.</p>
      </div>
      
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 text-red-600 animate-in fade-in zoom-in-95 duration-300 mb-6">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              className="input-field pl-12" 
              placeholder="As per government ID"
              value={data.fullName}
              onChange={(e) => updateData({ fullName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Phone Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="tel" 
                className="input-field pl-12" 
                placeholder="+1 234 567 890"
                value={data.phoneNumber}
                onChange={(e) => updateData({ phoneNumber: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Date of Birth</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="date" 
                className="input-field pl-12"
                value={data.dateOfBirth}
                onChange={(e) => updateData({ dateOfBirth: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Country of Residence</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              className="input-field pl-12 appearance-none bg-white"
              value={data.country}
              onChange={(e) => updateData({ country: e.target.value })}
            >
              <option value="">Select country</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="JP">Japan</option>
              {/* Add more as needed */}
            </select>
          </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-700">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p className="text-[0.75rem] leading-relaxed">
            This information is required to verify your identity and ensure platform security.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink tracking-tight">Verify Your Identity</h2>
        <p className="text-sm text-ink-muted mt-1">Secure KYC verification to enable campaign launching.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">Government ID (Front)</label>
            <label 
              htmlFor="idFrontUpload"
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                data.idFrontImage ? 'border-brand-500 bg-brand-50/10' : 'border-slate-200 hover:border-brand-500 hover:bg-brand-50/20'
              }`}
            >
              <input 
                id="idFrontUpload"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'idFrontImage')}
                disabled={uploading.idFrontImage}
              />
              
              {uploading.idFrontImage ? (
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-[0.6rem] font-bold text-brand-600 uppercase tracking-widest">Uploading...</span>
                </div>
              ) : previews.idFrontImage ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <img src={previews.idFrontImage} alt="ID Front" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={24} className="text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-slate-400 mb-3 group-hover:text-brand-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Click to upload</span>
                  <span className="text-[0.6rem] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                </>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">Government ID (Back)</label>
            <label 
              htmlFor="idBackUpload"
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                data.idBackImage ? 'border-brand-500 bg-brand-50/10' : 'border-slate-200 hover:border-brand-500 hover:bg-brand-50/20'
              }`}
            >
              <input 
                id="idBackUpload"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'idBackImage')}
                disabled={uploading.idBackImage}
              />

              {uploading.idBackImage ? (
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-[0.6rem] font-bold text-brand-600 uppercase tracking-widest">Uploading...</span>
                </div>
              ) : previews.idBackImage ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <img src={previews.idBackImage} alt="ID Back" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={24} className="text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-slate-400 mb-3 group-hover:text-brand-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Click to upload</span>
                  <span className="text-[0.6rem] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider">Selfie with ID (Optional)</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <label 
              htmlFor="selfieUpload"
              className={`flex-1 relative border-2 border-dashed rounded-2xl p-6 flex items-center justify-center gap-4 transition-all cursor-pointer group ${
                data.selfieImage ? 'border-brand-500 bg-brand-50/10' : 'border-slate-200 hover:border-brand-500 hover:bg-brand-50/20'
              }`}
            >
              <input 
                id="selfieUpload"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'selfieImage')}
                disabled={uploading.selfieImage}
              />
              {uploading.selfieImage ? (
                <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              ) : previews.selfieImage ? (
                <img src={previews.selfieImage} alt="Selfie" className="w-10 h-10 rounded-full object-cover border-2 border-brand-500" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-500">
                  <User size={20} />
                </div>
              )}
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                {data.selfieImage ? 'Selfie uploaded' : 'Upload from files'}
              </span>
            </label>

            <button 
              type="button"
              onClick={() => setShowCamera(true)}
              className="px-6 py-4 rounded-2xl border border-brand-500 text-brand-500 font-bold text-xs uppercase tracking-widest hover:bg-brand-50 transition-all flex items-center justify-center gap-3"
            >
              <Camera size={18} />
              Open Camera
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3 text-slate-500">
          <Lock size={18} className="shrink-0 mt-0.5 text-brand-500" />
          <p className="text-[0.75rem] leading-relaxed">
            Your data is encrypted and securely stored. We never share your identity documents with third parties.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink tracking-tight">Professional Profile</h2>
        <p className="text-sm text-ink-muted mt-1">Tell us and your future backers who you are and why you're here.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Profile Headline</label>
          <input 
            type="text"
            className="input-field" 
            placeholder="e.g. Social Entrepreneur | Tech Innovator | Community Leader"
            value={data.profileHeadline}
            onChange={(e) => updateData({ profileHeadline: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Why are you joining PureRaise?</label>
          <select 
            className="input-field appearance-none bg-white"
            value={data.purposeCategory}
            onChange={(e) => updateData({ purposeCategory: e.target.value })}
          >
            <option value="">Select your primary goal</option>
            <option value="technology">To launch innovative technology projects</option>
            <option value="social">To drive social and community impact</option>
            <option value="startup">To find backers for business expansion</option>
            <option value="personal">To fund personal creative endeavors</option>
            <option value="medical">To organize medical or mutual aid</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Profile Description / Bio</label>
          <textarea 
            className="input-field min-h-[140px] py-4" 
            placeholder="Introduce yourself to the community. Mention your experience, past projects, or your general vision for the campaigns you plan to launch."
            value={data.profileBio}
            onChange={(e) => updateData({ profileBio: e.target.value })}
          />
          <p className="mt-2 text-[0.65rem] text-slate-400">
            This will be displayed on your Campaign Owner profile to help build trust with backers.
          </p>
        </div>

        <div className="bg-brand-50/30 p-4 rounded-xl border border-brand-100/50 flex gap-3 text-brand-700">
          <Info size={16} className="shrink-0 mt-0.5" />
          <p className="text-[0.7rem] leading-relaxed">
            A complete profile helps contributors trust you. You can update these details anytime after your account is approved.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink tracking-tight">Connect Your Wallet</h2>
        <p className="text-sm text-ink-muted mt-1">Integration with Web3 for secure fund management.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-brand-500/10 flex items-center justify-center mb-6">
            <Wallet size={36} className="text-brand-500" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">Web3 Wallet</h3>
          <p className="text-[0.75rem] text-slate-400 text-center max-w-xs mb-8">
            Connect your MetaMask or other compatible wallet to receive and manage funds.
          </p>
          
          <button className="flex items-center gap-3 px-8 py-4 rounded-full bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 group">
            Connect MetaMask
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <label className="block text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Network</label>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="font-bold text-sm text-ink">Ethereum Sepolia</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <label className="block text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Security Standard</label>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-500" />
              <span className="font-bold text-sm text-ink">Smart Contract Managed</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 text-slate-400 text-[0.7rem] bg-brand-50/30 p-4 rounded-xl border border-brand-100/50">
          <Info size={16} className="shrink-0 text-brand-500" />
          <p className="leading-relaxed">
            Funds will be managed securely through decentralized smart contracts. PureRaise does not have direct access to your funds.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink tracking-tight">Review & Submit</h2>
        <p className="text-sm text-ink-muted mt-1">Verify your details before final submission.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="text-slate-400 font-medium">Full Name</div>
            <div className="text-ink font-bold text-right">{data.fullName || "—"}</div>
            
            <div className="text-slate-400 font-medium">Verification Status</div>
            <div className="text-brand-600 font-bold text-right flex items-center justify-end gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-500"></div>
              Pending Review
            </div>

            <div className="text-slate-400 font-medium">Primary Focus</div>
            <div className="text-ink font-bold text-right capitalize">{data.purposeCategory || "—"}</div>
            
            <div className="text-slate-400 font-medium">Wallet Address</div>
            <div className="text-ink font-bold text-right overflow-hidden text-ellipsis whitespace-nowrap ml-4">
              {data.walletAddress || "Not connected"}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <div className="text-slate-400 text-[0.7rem] font-bold uppercase tracking-widest mb-1">Wallet for Smart Contracts</div>
            <div className="text-ink font-mono text-xs break-all bg-white p-3 rounded-lg border border-slate-100 italic">
              0x742d35Cc6634C0532925a3b844Bc454e4438f44e
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer group">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-500 accent-brand-500 cursor-pointer"
              checked={data.agreed}
              onChange={(e) => updateData({ agreed: e.target.checked })}
            />
            <div className="text-[0.75rem] leading-relaxed text-slate-500 group-hover:text-ink transition-colors">
              I agree to the <a href="#" className="font-bold text-brand-600 underline">Terms & Conditions</a> and confirm that all information provided is accurate and truthful. I understand that misrepresentation may lead to account suspension.
            </div>
          </label>
        </div>

        <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 text-brand-700 flex gap-3">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p className="text-[0.7rem] leading-relaxed">
            Your account will be reviewed by our compliance team before activation. You will receive an email notification within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 animate-in zoom-in-95 duration-700">
      <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand-500/10">
        <CheckCircle2 size={48} className="text-brand-500" />
      </div>
      <h2 className="text-3xl font-black text-ink tracking-tight mb-4">Application Submitted</h2>
      <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed">
        Your Campaign Owner account is under review. Our team is verifying your application to ensure platform integrity.
      </p>

      <div className="max-w-[280px] mx-auto p-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.6rem] font-bold text-slate-400 tracking-[0.2em] uppercase">Status</span>
          <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-600 text-[0.65rem] font-black uppercase">Pending Approval</span>
        </div>
        <div className="text-left">
          <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">Expected Review</div>
          <div className="text-lg font-black text-ink">24–48 Hours</div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <p className="text-xs text-slate-400 font-medium">In the meantime, you can explore public campaigns.</p>
        <button 
          onClick={() => navigate('/')}
          className="mx-auto flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 underline underline-offset-4"
        >
          Explore PureRaise <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Minimal Nav */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
            </svg>
          </div>
          <span className="font-display font-black text-xl text-ink tracking-tight uppercase">PureRaise</span>
          <div className="h-4 w-[1.5px] bg-slate-200 mx-2 hidden sm:block"></div>
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Campaign Onboarding</span>
        </div>
        
        {step !== 'success' && (
          <button 
            onClick={() => navigate('/login')}
            className="text-[0.7rem] font-bold text-ink-muted hover:text-ink transition-colors flex items-center gap-2"
          >
            Cancel and Exit
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          {step !== 'success' && <ProgressIndicator currentStep={step} />}

          <div className="bg-white rounded-[32px] shadow-2xl shadow-black/5 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
            {step !== 'success' && (
              <div className="absolute top-0 right-0 px-6 py-3 bg-brand-50 text-brand-600 text-[0.65rem] font-bold uppercase tracking-widest rounded-bl-2xl">
                Step {step} of 5
              </div>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 'success' && renderSuccess()}

            {showCamera && (
              <CameraModal 
                onCapture={handleCapturePhoto} 
                onClose={() => setShowCamera(false)} 
              />
            )}

            {step !== 'success' && (
              <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
                <button 
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`flex items-center gap-2 text-sm font-bold transition-all ${
                    step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <ArrowLeft size={18} /> Back
                </button>
                
                <button 
                  onClick={nextStep}
                  disabled={loading || (step === 5 && !data.agreed)}
                  className={`px-8 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                    loading || (step === 5 && !data.agreed) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95'
                  }`}
                >
                  {loading ? (
                    'Submitting...'
                  ) : step === 5 ? (
                    'Submit for Approval'
                  ) : (
                    'Continue'
                  )}
                  {!loading && step !== 5 && <ArrowRight size={18} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="h-10 text-[0.6rem] text-slate-400 text-center font-bold uppercase tracking-[0.2em] pb-4">
        © 2025 PureRaise Foundation • Established to empower global decentralized innovation
      </footer>
    </div>
  );
};

export default CampaignOwnerOnboarding;
