/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 * All microservices are behind the same ingress in production
 */

import { ENV } from './env.config';

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  API_VERSION: 'v1',
  TIMEOUT: 10000, // 10 seconds
  
  // Service-specific base URLs (all use same ingress in production)
  AUTH_BASE_URL: ENV.API_BASE_URL,
  CATALOG_BASE_URL: ENV.API_BASE_URL,
  MATCHMAKING_BASE_URL: ENV.API_BASE_URL,
  CHAT_BASE_URL: ENV.API_BASE_URL,
  NOTIFICATIONS_BASE_URL: ENV.API_BASE_URL,
  
  // Endpoints - All include service prefix for ingress routing
  ENDPOINTS: {
    // Authentication Service (Port 8000 in dev)
    AUTH: {
      REGISTER: '/auth/api/v1/auth/register',
      LOGIN: '/auth/api/v1/auth/login',
      REFRESH: '/auth/api/v1/auth/refresh',
      ME: '/auth/api/v1/auth/me',
      CHANGE_PASSWORD: '/auth/api/v1/auth/change-password',
      PROFILE: '/auth/api/v1/auth/profile',
      LOGOUT: '/auth/api/v1/auth/logout',
    },
    
    // Catalog Service (Port 8001 in dev)
    CATALOG: {
      ITEMS: '/catalog/items',
      ITEM_BY_ID: (id: number) => `/catalog/items/${id}`,
      FEED: '/catalog/items/feed',
      MY_ITEMS: '/catalog/items/my-items',
      UPLOAD_IMAGE: '/catalog/upload-image',
    },
    
    // Matchmaking Service (Port 8002 in dev)
    MATCHMAKING: {
      OFFERS: '/matchmaking/api/v1/offers',
      OFFER_BY_ID: (id: number) => `/matchmaking/api/v1/offers/${id}`,
      RECEIVED_OFFERS: (userId: string) => `/matchmaking/api/v1/offers/received/${userId}`,
      SENT_OFFERS: (userId: string) => `/matchmaking/api/v1/offers/sent/${userId}`,
      OFFERS_BY_ITEM: (itemId: number) => `/matchmaking/api/v1/offers/by-item/${itemId}`,
      STATISTICS: (userId: string) => `/matchmaking/api/v1/statistics/${userId}`,
    },
    
    // Chat Service (Port 8004 in dev)
    CHAT: {
      CHAT_ROOMS: '/chat/api/v1/chat-rooms',
      CHAT_ROOM_BY_ID: (id: number) => `/chat/api/v1/chat-rooms/${id}`,
      CHAT_ROOM_BY_TRADE_OFFER: (tradeOfferId: number) => `/chat/api/v1/chat-rooms/trade-offer/${tradeOfferId}`,
      MESSAGES: '/chat/api/v1/messages',
      MESSAGE_BY_ID: (id: number) => `/chat/api/v1/messages/${id}`,
      MARK_MESSAGES_READ: '/chat/api/v1/messages/mark-read',
      STATISTICS: '/chat/api/v1/statistics',
    },
    
    // Notification Service (Port 8003 in dev)
    NOTIFICATIONS: {
      USER_NOTIFICATIONS: (userId: string) => `/notifications/api/v1/notifications/${userId}`,
      UNREAD_COUNT: (userId: string) => `/notifications/api/v1/notifications/${userId}/unread-count`,
      STATS: (userId: string) => `/notifications/api/v1/notifications/${userId}/stats`,
      MARK_READ: (userId: string) => `/notifications/api/v1/notifications/mark-read?user_id=${userId}`,
      MARK_SINGLE_READ: (notificationId: number, userId: string) => `/notifications/api/v1/notifications/${notificationId}/read?user_id=${userId}`,
      DELETE_NOTIFICATION: (notificationId: number, userId: string) => `/notifications/api/v1/notifications/${notificationId}?user_id=${userId}`,
      DELETE_ALL: (userId: string) => `/notifications/api/v1/notifications/user/${userId}`,
      CREATE: '/notifications/api/v1/notifications',
    },
    
    HEALTH: '/health',
  },
} as const;
