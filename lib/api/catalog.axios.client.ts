/**
 * Catalog API Client
 * Axios client configured for the Catalog microservice
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { tokenStorage } from '../storage/token.storage';

// Create axios instance for catalog service
export const catalogApiClient = axios.create({
  baseURL: API_CONFIG.CATALOG_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
catalogApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
catalogApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could trigger refresh or logout
      await tokenStorage.clearTokens();
    }
    
    throw error;
  }
);
