/**
 * Environment Configuration
 * Handles different API URLs for different platforms (web, iOS simulator, Android emulator, physical devices)
 * 
 * Uses EXPO_PUBLIC_* environment variables from .env files:
 * - .env.local - Local development
 * - .env.production - Production (Firebase Hosting)
 */

import { Platform } from 'react-native';

/**
 * Get the appropriate API base URL based on the platform and environment
 * 
 * Development (local):
 * - Web: http://127.0.0.1:8000
 * - iOS Simulator: http://localhost:8000
 * - Android Emulator: http://10.0.2.2:8000 (emulator's special IP for host machine)
 * - Physical Device: Use your computer's local network IP (e.g., http://192.168.1.100:8000)
 * 
 * Production (Firebase Hosting):
 * - All platforms: Your GKE ingress URL (from EXPO_PUBLIC_API_BASE_URL)
 */

const getApiUrl = (): string => {
  // Check if we have environment variable set (production build)
  const envApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';

  // Log environment variables for debugging
  console.log('🔧 Environment Config:', {
    EXPO_PUBLIC_API_BASE_URL: envApiUrl,
    EXPO_PUBLIC_ENVIRONMENT: environment,
    platform: Platform.OS,
  });

  // Use environment variable if in production
  if (environment === 'production' && envApiUrl) {
    console.log('✅ Using production API URL from environment variable:', envApiUrl);
    return envApiUrl;
  }

  // Development environment - platform-specific URLs
  if (Platform.OS === 'web') {
    return envApiUrl || 'http://127.0.0.1:8000';
  }

  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    // If you're using a physical Android device, replace this with your computer's IP
    // Example: return 'http://192.168.1.100:8000';
    return envApiUrl || 'http://10.0.2.2:8000';
  }

  if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return envApiUrl || 'http://localhost:8000';
  }

  // Default fallback
  return envApiUrl || 'http://127.0.0.1:8000';
};

export const ENV = {
  // All services are behind the same ingress in production
  API_BASE_URL: getApiUrl(),
  CATALOG_API_BASE_URL: getApiUrl(), // Same URL, different path (/catalog)
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  IS_DEV: __DEV__,
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production',
};

// Helper to get your computer's local IP for physical device testing
export const getLocalNetworkIp = () => {
  // Instructions for finding your local IP:
  // Windows: ipconfig (look for IPv4 Address)
  // Mac/Linux: ifconfig or ip addr (look for inet)
  // 
  // Then update the Android section above to use:
  // return 'http://YOUR_LOCAL_IP:8000';
  
  console.log(`
    📱 Testing on a physical device?
    
    1. Find your computer's local IP address:
       - Windows: Run 'ipconfig' in terminal
       - Mac: Run 'ifconfig' in terminal
       - Look for IPv4 address (e.g., 192.168.1.100)
    
    2. Update config/env.config.ts:
       - Change the Android URL to use your IP
       - Example: return 'http://192.168.1.100:8000';
    
    3. Make sure your backend allows connections from your local network
    
    4. Ensure both devices are on the same WiFi network
  `);
};
