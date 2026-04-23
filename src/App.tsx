import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContributorDashboard from './pages/ContributorDashboard';
import LandingPage from './pages/LandingPage';

// Simple unauthorized page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface">
    <div className="text-5xl">🚫</div>
    <h1 className="text-2xl font-bold text-ink">Access Denied</h1>
    <p className="text-sm text-ink-muted">You don't have permission to view this page.</p>
    <a href="/login" className="btn-primary max-w-xs mt-2">Go to Login</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Contributor-only routes */}
          <Route element={<ProtectedRoute allowedRoles={['contributor']} />}>
            <Route path="/contributor/dashboard" element={<ContributorDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
