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
  
  // Endpoints - All include service prefix for ingress routing
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/api/v1/auth/register',
      LOGIN: '/auth/api/v1/auth/login',
      REFRESH: '/auth/api/v1/auth/refresh',
      ME: '/auth/api/v1/auth/me',
      CHANGE_PASSWORD: '/auth/api/v1/auth/change-password',
    },
    CATALOG: {
      ITEMS: '/catalog/items',
      ITEM_BY_ID: (id: number) => `/catalog/items/${id}`,
      FEED: '/catalog/items/feed',
      UPLOAD_IMAGE: '/catalog/upload-image',
    },
    HEALTH: '/health',
  },
} as const;
