import { Platform } from 'react-native';

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
    return envApiUrl;
  }

  return envApiUrl || 'http://127.0.0.1:8000';
};

export const ENV = {
  API_BASE_URL: getApiUrl(),
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  IS_DEV: __DEV__,
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production',
  
  // Shipping estimates Cloud Function URL EXPO_PUBLIC_SHIPPING_API_URL=https://shipping-estimates-lgvrxvnupa-ey.a.run.app 
  SHIPPING_API_URL: process.env.EXPO_PUBLIC_SHIPPING_API_URL || 'https://shipping-estimates-lgvrxvnupa-ey.a.run.app',
};
