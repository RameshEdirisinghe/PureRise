import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getApiError, type UserRole } from '../context/AuthContext';

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
  </svg>
);

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]                       = useState<UserRole>('contributor');
  const [showPwd, setShowPwd]                 = useState(false);
  const [showConfirmPwd, setShowConfirmPwd]   = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });
      navigate('/contributor/dashboard', { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
          Join the community of innovators and backers shaping the future.
        </p>
      </div>

      {error && (
        <div className="error-banner mb-6">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-bold text-ink mb-2 uppercase tracking-wide">Full name</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-xs font-bold text-ink mb-2 uppercase tracking-wide">Email address</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Row 2: Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-password" className="block text-xs font-bold text-ink mb-2 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors px-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {showPwd 
                    ? <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    : <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.06 M17.657 16.657L13.414 12.414M9.88 9.88l-3.223-3.223 M20.582 12c-.144.457-.318.902-.52 1.332 M15.536 15.536L19 19 M5 5l3.536 3.536 M15 12a3 3 0 10-4.243-4.243"/>
                  }
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="reg-confirm" className="block text-xs font-bold text-ink mb-2 uppercase tracking-wide">Confirm</label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirmPwd ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors px-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {showConfirmPwd 
                    ? <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    : <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.06 M17.657 16.657L13.414 12.414M9.88 9.88l-3.223-3.223 M20.582 12c-.144.457-.318.902-.52 1.332 M15.536 15.536L19 19 M5 5l3.536 3.536 M15 12a3 3 0 10-4.243-4.243"/>
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Account Type */}
        <div>
          <label htmlFor="reg-role" className="block text-xs font-bold text-ink mb-2 uppercase tracking-wide">Account type</label>
          <div className="relative">
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="input-field appearance-none bg-white pr-10"
            >
              <option value="contributor">Contributor — Back projects</option>
              <option value="projectOwner">Campaign Owner — Launch projects</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-faint">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          id="register-submit-btn"
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? <><SpinnerIcon />Creating account…</> : 'Create Free Account →'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-ink-muted">
        By clicking "Create Free Account", you agree to our{' '}
        <a href="#" className="font-bold text-ink hover:text-brand-600 transition-colors">Terms of Service</a>.
      </p>
    </div>
  );
};

export default RegisterForm;
