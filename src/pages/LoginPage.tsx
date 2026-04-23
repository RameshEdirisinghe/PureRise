import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';
import crowdfundingImg from '../assets/crowdfunding.jpg';

// ── Right panel — Minimal image showcase ──────────────────────────────────────
const BrandPanel = () => (
  <div className="relative w-full h-full overflow-hidden bg-ink">
    <img 
      src={crowdfundingImg} 
      alt="Crowdfunding" 
      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity hover:opacity-80 transition-opacity duration-1000"
    />
    <div className="absolute bottom-12 left-12 right-12">
      <div className="max-w-sm">
        <div className="w-[30px] h-[1px] bg-brand-500 mb-6"></div>
        <h2 className="text-xl xl:text-2xl font-extrabold text-white leading-tight mb-3 tracking-tight font-display uppercase">
          Empowering the next <br />
          generation of innovators.
        </h2>
        <p className="text-[0.7rem] xl:text-[0.75rem] text-white/50 leading-relaxed font-bold uppercase tracking-[0.15em]">
          The professional standard for high-impact crowdfunding.
        </p>
      </div>
    </div>
    
    {/* Minimal Trust Badge */}
    <div className="absolute top-12 left-12 flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/80 text-[0.7rem] font-bold uppercase tracking-[0.2em] shadow-2xl">
      <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></div>
      Secure Decentralized Network
    </div>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────────
const LoginPage = () => (
  <div className="h-screen overflow-hidden flex text-ink bg-white">
    {/* Left — form panel (2/5) */}
    <div className="w-full lg:w-2/5 flex flex-col relative z-20 border-r border-slate-100 shadow-2xl shadow-black/5">
      {/* Nav */}
      <nav className="flex items-center justify-between px-12 py-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
            </svg>
          </div>
          <span className="font-display font-black text-xl text-ink tracking-tight uppercase">PureRaise</span>
        </Link>
      </nav>

      {/* Form Area */}
      <div className="flex-1 flex flex-col justify-center px-12 xl:px-20">
        <div className="max-w-[380px] w-full mx-auto">
          <LoginForm />
          
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="text-[0.75rem] text-ink-muted font-bold uppercase tracking-widest leading-none">
              New here?
            </div>
            <Link 
              to="/register" 
              className="text-[0.75rem] font-bold text-brand-600 hover:text-brand-700 transition-colors underline underline-offset-4"
            >
              Start as Owner
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-12 py-10 flex justify-between items-center text-[0.65rem] text-ink-faint font-bold uppercase tracking-[0.15em]">
        <span>© 2025</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-ink transition-colors">Privacy</a>
          <a href="#" className="hover:text-ink transition-colors">Help</a>
        </div>
      </footer>
    </div>

    {/* Right — showcase (3/5) */}
    <div className="hidden lg:block w-3/5 relative overflow-hidden">
      <BrandPanel />
    </div>
  </div>
);

export default LoginPage;
