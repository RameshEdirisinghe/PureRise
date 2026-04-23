import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ContributorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const stats = [
    { label: 'Projects Backed',    value: '0',    icon: '🚀', color: 'from-brand-400 to-brand-600' },
    { label: 'Total Contributed',  value: '$0',   icon: '💰', color: 'from-amber-400 to-brand-500' },
    { label: 'Impact Score',       value: 'N/A',  icon: '⭐', color: 'from-orange-400 to-brand-700' },
    { label: 'Campaigns Following',value: '0',    icon: '📌', color: 'from-brand-500 to-brand-800' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
              </svg>
            </div>
            <span className="font-extrabold text-lg text-ink tracking-tight">PureRaise</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Contributor
            </span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-ink leading-none">{user?.name}</p>
                <p className="text-xs text-ink-faint mt-0.5">{user?.email}</p>
              </div>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-ink-muted hover:bg-slate-50 hover:text-ink transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-brand-200 text-sm font-semibold mb-1">Welcome back 👋</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{user?.name ?? 'Contributor'}</h1>
          <p className="mt-2 text-brand-200 max-w-md text-sm">
            Explore campaigns, track your pledges, and make your impact felt across the globe.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-sm shrink-0`}>
                {icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-ink">{value}</p>
                <p className="text-xs text-ink-faint font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-7">
          <h2 className="text-base font-bold text-ink mb-5">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Browse Campaigns',    desc: 'Discover projects to back',      icon: '🔍' },
              { label: 'My Pledges',          desc: 'Track your contributions',        icon: '📋' },
              { label: 'Project Updates',     desc: 'See latest from backed projects', icon: '🔔' },
            ].map(({ label, desc, icon }) => (
              <button
                key={label}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-all text-left group"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-ink group-hover:text-brand-700 transition-colors">{label}</p>
                  <p className="text-xs text-ink-faint mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Empty state for activity */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 text-3xl">
            🚀
          </div>
          <h3 className="text-base font-bold text-ink">No activity yet</h3>
          <p className="text-sm text-ink-muted mt-1.5 max-w-xs mx-auto">
            Back your first project to start seeing your impact here.
          </p>
          <button className="mt-5 btn-primary max-w-xs mx-auto">
            Explore Campaigns →
          </button>
        </div>
      </main>
    </div>
  );
};

export default ContributorDashboard;
