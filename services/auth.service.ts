/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { AxiosError } from 'axios';
import {
  UserCreate,
  UserLogin,
  Token,
  UserResponse,
  UserProfile,
  ChangePassword,
  ApiError,
} from '../types/auth.types';
import { apiClient } from '../lib/api/axios.client';
import { API_CONFIG } from '../config/api.config';
import { tokenStorage } from '../lib/storage/token.storage';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: UserCreate): Promise<UserResponse> {
    try {
      const response = await apiClient.post<UserResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  async login(credentials: UserLogin): Promise<{ user: UserResponse; tokens: Token }> {
    try {
      // Get tokens from login
      const tokenResponse = await apiClient.post<Token>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const tokens = tokenResponse.data;

      // Save tokens
      await tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token);

      // Get user info
      const user = await this.getCurrentUser();

      return { user, tokens };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await tokenStorage.clearTokens();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await apiClient.get<UserResponse>(
        API_CONFIG.ENDPOINTS.AUTH.ME
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<Token> {
    try {
      const response = await apiClient.post<Token>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refresh_token: refreshToken }
      );

      const tokens = response.data;

      // Save new tokens
      await tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token);

      return tokens;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwords: ChangePassword): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, passwords);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.get<UserResponse>(
        `/auth/api/v1/auth/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profile: UserProfile): Promise<UserResponse> {
    try {
      const response = await apiClient.put<UserResponse>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE,
        profile
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const hasTokens = await tokenStorage.hasTokens();
      if (!hasTokens) {
        return false;
      }

      // Try to get user info to verify token is valid
      await this.getCurrentUser();
      return true;
    } catch {
      // Token is invalid or expired
      return false;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): ApiError {
    if (error instanceof AxiosError) {
      const apiError: ApiError = {
        message: error.response?.data?.detail || error.message || 'An error occurred',
        status: error.response?.status,
        details: error.response?.data,
      };

      // Handle validation errors
      if (error.response?.status === 422 && Array.isArray(error.response?.data?.detail)) {
        const validationErrors = error.response.data.detail;
        apiError.message = validationErrors
          .map((err: { loc: (string | number)[]; msg: string }) => {
            const field = err.loc.at(-1);
            return `${field}: ${err.msg}`;
          })
          .join(', ');
      }

      return apiError;
    }

    return {
      message: 'An unexpected error occurred',
    };
  }
}

export const authService = new AuthService();
