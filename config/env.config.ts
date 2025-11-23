/**
 * Environment Configuration
 * Handles different API URLs for different platforms (web, iOS simulator, Android emulator, physical devices)
 */

import { Platform } from 'react-native';

/**
 * Get the appropriate API base URL based on the platform
 * 
 * Development:
 * - Web: http://127.0.0.1:8000
 * - iOS Simulator: http://localhost:8000
 * - Android Emulator: http://10.0.2.2:8000 (emulator's special IP for host machine)
 * - Physical Device: Use your computer's local network IP (e.g., http://192.168.1.100:8000)
 * 
 * Production:
 * - All platforms: Your production API URL
 */

const getApiUrl = (port: number = 8000): string => {
  // Set to true when deploying to production
  const IS_PRODUCTION = false;

  if (IS_PRODUCTION) {
    // Replace with your production API URL
    return 'https://api.yourapp.com';
  }

  // Development environment
  if (Platform.OS === 'web') {
    return `http://127.0.0.1:${port}`;
  }

  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    // If you're using a physical Android device, replace this with your computer's IP
    // Example: return `http://192.168.1.100:${port}`;
    return `http://10.0.2.2:${port}`;
  }

  if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return `http://localhost:${port}`;
  }

  // Default fallback
  return `http://127.0.0.1:${port}`;
};

export const ENV = {
  // Auth service (port 8000)
  API_BASE_URL: getApiUrl(8000),
  // Catalog service (port 8001) - assuming different port
  CATALOG_API_BASE_URL: getApiUrl(8001),
  IS_DEV: __DEV__,
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
