import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type {
  AuthContextType, LoginFormData,
  LoginResponse, User, UserRole,
} from '../types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_ROUTES: Record<UserRole, string> = {
  ADMINISTRATEUR:      '/login',
  MEDECIN:             '/',
  AGENT_ADMINISTRATIF: '/login',
  AGENT_RENSEIGNEMENT: '/login',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? (JSON.parse(saved) as User) : null;
  });

  const navigate = useNavigate();

  const login = async (data: LoginFormData) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? '/api'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        motDePasse: data.password,
      }),
    });

    if (!res.ok) {
      const err = await res.json() as { message: string };
      throw new Error(err.message ?? 'Identifiants incorrects.');
    }

    const json = (await res.json()) as LoginResponse;

    localStorage.setItem('accessToken', json.tokens.accessToken);

    if (data.rememberMe) {
      localStorage.setItem('refreshToken', json.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(json.user));
    } else {
      sessionStorage.setItem('refreshToken', json.tokens.refreshToken);
    }

    setUser(json.user);
    navigate(ROLE_ROUTES[json.user.role]);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
