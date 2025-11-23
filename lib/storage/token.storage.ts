/**
 * Secure Token Storage
 * Handles secure storage of authentication tokens for mobile devices
 * Note: This app is designed for mobile. Web support is limited.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Check if SecureStore is available (mobile only)
const isSecureStoreAvailable = Platform.OS !== 'web';

// Simple in-memory storage for web (for testing only - not persistent)
const memoryStorage: { [key: string]: string } = {};

export const tokenStorage = {
  /**
   * Save authentication tokens
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await Promise.all([
          SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
          SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
        ]);
      } else {
        // Web fallback - in-memory only (not persistent)
        memoryStorage[ACCESS_TOKEN_KEY] = accessToken;
        memoryStorage[REFRESH_TOKEN_KEY] = refreshToken;
        console.warn('⚠️ Using in-memory storage on web. Tokens will not persist after refresh. Please use a mobile device or emulator for full functionality.');
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      if (isSecureStoreAvailable) {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      } else {
        return memoryStorage[ACCESS_TOKEN_KEY] || null;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      if (isSecureStoreAvailable) {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      } else {
        return memoryStorage[REFRESH_TOKEN_KEY] || null;
      }
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await Promise.all([
          SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
          SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        ]);
      } else {
        delete memoryStorage[ACCESS_TOKEN_KEY];
        delete memoryStorage[REFRESH_TOKEN_KEY];
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw new Error('Failed to clear authentication tokens');
    }
  },

  /**
   * Check if tokens exist
   */
  async hasTokens(): Promise<boolean> {
    try {
      if (isSecureStoreAvailable) {
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        return !!accessToken;
      } else {
        return !!memoryStorage[ACCESS_TOKEN_KEY];
      }
    } catch (error) {
      console.error('Error checking tokens:', error);
      return false;
    }
  },
};
