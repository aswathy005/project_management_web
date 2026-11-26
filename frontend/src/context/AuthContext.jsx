import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('protrack_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('protrack_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('protrack_token')));

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem('protrack_token', nextToken);
    localStorage.setItem('protrack_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('protrack_token');
    localStorage.removeItem('protrack_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('protrack_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const data = await authService.getMe();
      setUser(data.user);
      localStorage.setItem('protrack_user', JSON.stringify(data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    persistSession(data.token, data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    persistSession(data.token, data.user);
    return data;
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('protrack_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        refreshUser,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
