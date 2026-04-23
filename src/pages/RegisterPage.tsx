import RegisterForm from '../components/RegisterForm';
import { Link } from 'react-router-dom';

const RegisterPage = () => (
  <div className="min-h-screen grid lg:grid-cols-2">
    {/* Left */}
    <div className="flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
            </svg>
          </div>
          <span className="font-extrabold text-lg text-ink tracking-tight">PureRaise</span>
        </Link>
        <div className="text-xs text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">Sign in</Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <RegisterForm />
      </div>

      <p className="text-center pb-6 text-[11px] text-ink-faint">
        © 2025 PureRaise. Empowering innovators globally.
      </p>
    </div>

    {/* Right — decorative */}
    <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-brand-50/50 via-brand-50 to-brand-100 p-10 relative overflow-hidden gap-8">
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-100/20 blur-3xl" />

      <div className="relative text-center animate-slide-up">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs font-bold text-brand-700 shadow-sm border border-brand-100 uppercase tracking-widest mb-6">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
          </svg>
          Join 2.4M Backers
        </span>
        <h2 className="text-3xl xl:text-4xl font-extrabold text-ink leading-tight">
          Back the projects{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 italic">
            that matter
          </span>
        </h2>
        <p className="mt-4 text-sm text-ink-muted max-w-xs mx-auto leading-relaxed">
          Create your free account and start backing innovative projects from around the world.
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-5 animate-fade-in">
        {[
          { label: 'Projects Funded', value: '48k+' },
          { label: 'Total Raised', value: '$320M' },
          { label: 'Success Rate', value: '91%' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center shadow-card border border-white/60 min-w-[90px]">
            <p className="text-xl font-extrabold text-ink">{value}</p>
            <p className="text-[10px] text-ink-faint font-semibold mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default RegisterPage;
