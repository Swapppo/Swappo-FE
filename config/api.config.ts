/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

import { ENV } from './env.config';

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  CATALOG_BASE_URL: ENV.CATALOG_API_BASE_URL,
  API_VERSION: 'v1',
  TIMEOUT: 10000, // 10 seconds
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/v1/auth/register',
      LOGIN: '/api/v1/auth/login',
      REFRESH: '/api/v1/auth/refresh',
      ME: '/api/v1/auth/me',
      CHANGE_PASSWORD: '/api/v1/auth/change-password',
    },
    CATALOG: {
      ITEMS: '/items',
      ITEM_BY_ID: (id: number) => `/items/${id}`,
      FEED: '/items/feed',
    },
    HEALTH: '/health',
  },
} as const;
