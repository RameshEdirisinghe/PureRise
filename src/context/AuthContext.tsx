import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import api from '../api/axios';
import { AxiosError } from 'axios';

// ── Types ──────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'projectOwner' | 'contributor';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ redirectTo: string }>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Attempt to rehydrate session from HTTP-only cookie on mount
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.post<{ data: { user: AuthUser } }>('/auth/refresh');
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<{ redirectTo: string }> => {
    const { data } = await api.post<{
      data: { user: AuthUser; redirectTo: string };
    }>('/auth/login', { email, password });
    setUser(data.data.user);
    return { redirectTo: data.data.redirectTo };
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    const { data } = await api.post<{ data: { user: AuthUser } }>(
      '/auth/register',
      payload
    );
    setUser(data.data.user);
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

// ── Helper: extract user-facing error message from Axios errors ────────────────
export const getApiError = (error: unknown): string => {
  if (error instanceof AxiosError && error.response?.data) {
    const d = error.response.data as { message?: string; errors?: string[] };
    if (d.errors && d.errors.length > 0) return d.errors.join('. ');
    if (d.message) return d.message;
  }
  return 'Something went wrong. Please try again.';
};

export default AuthContext;
