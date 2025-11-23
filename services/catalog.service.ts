/**
 * Catalog Service
 * Handles all catalog-related API calls
 */

import { AxiosError } from 'axios';
import {
  ItemCreate,
  ItemUpdate,
  ItemResponse,
  FeedParams,
  CatalogApiError,
} from '../types/catalog.types';
import { catalogApiClient } from '../lib/api/catalog.axios.client';
import { API_CONFIG } from '../config/api.config';

class CatalogService {
  /**
   * Upload an image file
   */
  async uploadImage(uri: string, fileName: string): Promise<string> {
    try {
      const formData = new FormData();
      
      // Handle web vs native differently
      if (uri.startsWith('blob:') || uri.startsWith('http')) {
        // Web: fetch the blob and create a file
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, fileName);
      } else {
        // React Native: use the special format
        // @ts-ignore - React Native FormData accepts this format
        formData.append('file', {
          uri,
          type: 'image/jpeg',
          name: fileName,
        });
      }
      
      const uploadResponse = await catalogApiClient.post<{ image_url: string }>(
        '/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return uploadResponse.data.image_url;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new item listing
   */
  async createItem(itemData: ItemCreate): Promise<ItemResponse> {
    try {
      const response = await catalogApiClient.post<ItemResponse>(
        API_CONFIG.ENDPOINTS.CATALOG.ITEMS,
        itemData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all items (feed)
   */
  async getFeed(params: FeedParams): Promise<ItemResponse[]> {
    try {
      const response = await catalogApiClient.get<ItemResponse[]>(
        API_CONFIG.ENDPOINTS.CATALOG.FEED,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single item by ID
   */
  async getItemById(itemId: number): Promise<ItemResponse> {
    try {
      const response = await catalogApiClient.get<ItemResponse>(
        API_CONFIG.ENDPOINTS.CATALOG.ITEM_BY_ID(itemId)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing item
   */
  async updateItem(
    itemId: number,
    ownerId: string,
    itemData: ItemUpdate
  ): Promise<ItemResponse> {
    try {
      const response = await catalogApiClient.put<ItemResponse>(
        API_CONFIG.ENDPOINTS.CATALOG.ITEM_BY_ID(itemId),
        itemData,
        {
          params: { owner_id: ownerId },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete an item (soft delete - archives it)
   */
  async deleteItem(itemId: number, ownerId: string): Promise<void> {
    try {
      await catalogApiClient.delete(
        API_CONFIG.ENDPOINTS.CATALOG.ITEM_BY_ID(itemId),
        {
          params: { owner_id: ownerId },
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all items owned by a specific user
   */
  async getMyItems(ownerId: string): Promise<ItemResponse[]> {
    try {
      const response = await catalogApiClient.get<ItemResponse[]>(
        '/items/my-items',
        {
          params: { owner_id: ownerId },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      // Log detailed error information
      console.error('Catalog API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const apiError = error.response?.data as CatalogApiError | undefined;
      
      if (error.response?.status === 422) {
        // Validation error - show detailed message
        const validationDetail = JSON.stringify(error.response?.data, null, 2);
        return new Error(`Validation error: ${validationDetail}`);
      }
      
      if (apiError?.detail) {
        return new Error(apiError.detail);
      }
      
      if (error.response?.status === 401) {
        return new Error('Authentication required. Please log in again.');
      }
      
      if (error.response?.status === 403) {
        return new Error('You do not have permission to perform this action.');
      }
      
      if (error.response?.status === 404) {
        return new Error('Item not found.');
      }
      
      if (error.message) {
        return new Error(error.message);
      }
    }
    
    return new Error('An unexpected error occurred. Please try again.');
  }
}

export const catalogService = new CatalogService();
