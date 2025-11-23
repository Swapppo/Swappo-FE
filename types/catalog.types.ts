/**
 * Catalog Types
 * Type definitions for the Catalog microservice
 */

/**
 * Item status enum
 */
export type ItemStatus = 'active' | 'archived' | 'swapped';

/**
 * Item creation schema
 */
export interface ItemCreate {
  name: string;
  description: string;
  category: string;
  image_urls: string[];
  location_lat: number;
  location_lon: number;
  owner_id: string;
}

/**
 * Item update schema
 */
export interface ItemUpdate {
  name?: string;
  description?: string;
  category?: string;
  image_urls?: string[];
  location_lat?: number;
  location_lon?: number;
  status?: ItemStatus;
}

/**
 * Item response schema
 */
export interface ItemResponse {
  id: number;
  name: string;
  description: string;
  category: string;
  image_urls: string[];
  location_lat: number;
  location_lon: number;
  owner_id: string;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Feed query parameters
 */
export interface FeedParams {
  limit?: number;
  user_id: string;
  exclude_item_ids?: string;
  category?: string;
  distance?: number;
  user_lat?: number;
  user_lon?: number;
}

/**
 * Error response from API
 */
export interface CatalogApiError {
  detail: string;
}
