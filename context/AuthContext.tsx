/**
 * Authentication Context
 * Global state management for authentication
 */

import React, { createContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { AuthState, UserCreate, UserLogin } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType extends AuthState {
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialAuthState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const user = await authService.getCurrentUser();
        setState({
          user,
          accessToken: null, // Tokens are in secure storage
          refreshToken: null,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          ...initialAuthState,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState({
        ...initialAuthState,
        isLoading: false,
      });
    }
  };

  const login = useCallback(async (credentials: UserLogin) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { user, tokens } = await authService.login(credentials);

      setState({
        user,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: UserCreate) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Register the user
      await authService.register(userData);

      // Auto-login after registration
      await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      await authService.logout();

      setState({
        ...initialAuthState,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setState({
        ...initialAuthState,
        isLoading: false,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setState((prev) => ({
        ...prev,
        user,
      }));
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshUser,
    }),
    [state, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
