/**
 * Matchmaking Service
 * Handles trade offer operations
 */

import axios from 'axios';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api.config';
import { 
  TradeOfferCreate, 
  TradeOfferResponse, 
  TradeOfferUpdate, 
  MatchStatistics,
  TradeOfferStatus 
} from '../types/matchmaking.types';

const getMatchmakingApiUrl = (port: number = 8002): string => {
  const IS_PRODUCTION = false;

  if (IS_PRODUCTION) {
    return 'https://api.yourapp.com';
  }

  if (typeof window !== 'undefined') {
    return `http://127.0.0.1:${port}`;
  }

  // For React Native
  
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  }

  if (Platform.OS === 'ios') {
    return `http://localhost:${port}`;
  }

  return `http://127.0.0.1:${port}`;
};

const MATCHMAKING_BASE_URL = getMatchmakingApiUrl(8002);

class MatchmakingService {
  /**
   * Create a new trade offer
   */
  async createTradeOffer(offerData: TradeOfferCreate): Promise<TradeOfferResponse> {
    try {
      const response = await axios.post(
        `${MATCHMAKING_BASE_URL}/api/v1/offers`,
        offerData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating trade offer:', error);
      throw error;
    }
  }

  /**
   * Get a specific trade offer by ID
   */
  async getTradeOffer(offerId: number): Promise<TradeOfferResponse> {
    try {
      const response = await axios.get(
        `${MATCHMAKING_BASE_URL}/api/v1/offers/${offerId}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching trade offer:', error);
      throw error;
    }
  }

  /**
   * List trade offers with filters
   */
  async listTradeOffers(params: {
    user_id: string;
    status?: TradeOfferStatus;
    as_proposer?: boolean;
    as_receiver?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<TradeOfferResponse[]> {
    try {
      const response = await axios.get(
        `${MATCHMAKING_BASE_URL}/api/v1/offers`,
        {
          params,
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error listing trade offers:', error);
      throw error;
    }
  }

  /**
   * Get received offers for a user
   */
  async getReceivedOffers(
    userId: string,
    status?: TradeOfferStatus,
    limit: number = 20,
    offset: number = 0
  ): Promise<TradeOfferResponse[]> {
    try {
      const response = await axios.get(
        `${MATCHMAKING_BASE_URL}/api/v1/offers/received/${userId}`,
        {
          params: { status, limit, offset },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching received offers:', error);
      throw error;
    }
  }

  /**
   * Get sent offers for a user
   */
  async getSentOffers(
    userId: string,
    status?: TradeOfferStatus,
    limit: number = 20,
    offset: number = 0
  ): Promise<TradeOfferResponse[]> {
    try {
      const response = await axios.get(
        `${MATCHMAKING_BASE_URL}/api/v1/offers/sent/${userId}`,
        {
          params: { status, limit, offset },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sent offers:', error);
      throw error;
    }
  }

  /**
   * Update trade offer status
   */
  async updateTradeOfferStatus(
    offerId: number,
    userId: string,
    updateData: TradeOfferUpdate
  ): Promise<TradeOfferResponse> {
    try {
      const response = await axios.patch(
        `${MATCHMAKING_BASE_URL}/api/v1/offers/${offerId}`,
        updateData,
        {
          params: { user_id: userId },
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating trade offer:', error);
      throw error;
    }
  }

  /**
   * Delete a trade offer
   */
  async deleteTradeOffer(offerId: number, userId: string): Promise<void> {
    try {
      await axios.delete(
        `${MATCHMAKING_BASE_URL}/api/v1/offers/${offerId}`,
        {
          params: { user_id: userId },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
    } catch (error) {
      console.error('Error deleting trade offer:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<MatchStatistics> {
    try {
      const response = await axios.get(
        `${MATCHMAKING_BASE_URL}/api/v1/statistics/${userId}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }

  /**
   * Get offers by item ID
   */
  async getOffersByItem(
    itemId: number,
    status?: TradeOfferStatus
  ): Promise<TradeOfferResponse[]> {
    try {
      const response = await axios.get(
        `${MATCHMAKING_BASE_URL}/api/v1/offers/by-item/${itemId}`,
        {
          params: { status },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching offers by item:', error);
      throw error;
    }
  }
}

export const matchmakingService = new MatchmakingService();
