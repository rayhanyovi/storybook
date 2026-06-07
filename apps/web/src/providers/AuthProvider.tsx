import { createContext, useContext, useState, useCallback } from 'react';
import type { UserDTO } from '@storybook/shared';
import { setToken, clearToken } from '@/lib/api';

interface AuthState {
  user: UserDTO | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: UserDTO) => void;
  logout: () => void;
  setUser: (user: UserDTO) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('storybook_token');
    return { user: null, token };
  });

  const login = useCallback((token: string, user: UserDTO) => {
    setToken(token);
    setState({ token, user });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ user: null, token: null });
  }, []);

  const setUser = useCallback((user: UserDTO) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
