import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/api';
import { getCurrentUserApi, loginApi, logoutApi } from '../services/api/auth';
import { onUnauthorized, ApiError } from '../services/api/client';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const DEMO_USERS: Record<string, User> = {
  'admin@nexora.demo': {
    id: 'usr_admin_01',
    name: 'Alex Rivera (Admin)',
    email: 'admin@nexora.demo',
    role: 'Administrator',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
  },
  'manager@nexora.demo': {
    id: 'usr_manager_01',
    name: 'Sarah Chen (Manager)',
    email: 'manager@nexora.demo',
    role: 'Manager',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    createdAt: new Date().toISOString(),
  },
  'viewer@nexora.demo': {
    id: 'usr_viewer_01',
    name: 'Marcus Vance (Viewer)',
    email: 'viewer@nexora.demo',
    role: 'Viewer',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date().toISOString(),
  },
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUserApi();
      setUser(currentUser);
      localStorage.setItem('nexora_demo_user', JSON.stringify(currentUser));
    } catch {
      const savedUserStr = localStorage.getItem('nexora_demo_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          setUser(savedUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      localStorage.removeItem('nexora_demo_user');
      setUser(null);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      const loggedUser = await loginApi(email, password);
      setUser(loggedUser);
      localStorage.setItem('nexora_demo_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err: unknown) {
      const lowerEmail = email.toLowerCase().trim();
      const isDemoAccount = lowerEmail in DEMO_USERS;
      const isNetworkErr = err instanceof ApiError ? err.status === 0 : true;

      // When deployed on Vercel or when backend is unreachable, fallback to browser session demo mode
      if (isDemoAccount || isNetworkErr) {
        const demoUser: User = DEMO_USERS[lowerEmail] || {
          id: `usr_${Date.now()}`,
          name: lowerEmail.split('@')[0].replace('.', ' '),
          email: email,
          role: lowerEmail.includes('admin') ? 'Administrator' : lowerEmail.includes('manager') ? 'Manager' : 'Viewer',
          status: 'Active',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          createdAt: new Date().toISOString(),
        };

        setUser(demoUser);
        localStorage.setItem('nexora_demo_user', JSON.stringify(demoUser));
        return demoUser;
      }

      const msg = err instanceof Error ? err.message : 'Invalid email or password.';
      setError(msg);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('nexora_demo_user');
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
