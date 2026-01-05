/**
 * Chat Service
 * Handles chat room and messaging operations
 */

import axios from 'axios';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api.config';
import { ENV } from '../config/env.config';
import {
  ChatRoomCreate,
  ChatRoomResponse,
  ChatRoomWithLastMessage,
  MessageCreate,
  MessageResponse,
  MessageUpdate,
  ChatStatistics,
} from '../types/chat.types';

const getChatApiUrl = (): string => {
  // All services behind same ingress in production
  return ENV.API_BASE_URL;
};

const CHAT_BASE_URL = getChatApiUrl();

class ChatService {
  /**
   * Create a new chat room
   */
  async createChatRoom(roomData: ChatRoomCreate): Promise<ChatRoomResponse> {
    try {
      const response = await axios.post(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.CHAT_ROOMS}`,
        roomData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  /**
   * Get chat room by trade offer ID
   */
  async getChatRoomByTradeOffer(tradeOfferId: number): Promise<ChatRoomResponse> {
    try {
      const response = await axios.get(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.CHAT_ROOM_BY_TRADE_OFFER(tradeOfferId)}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error: any) {
      // 404 is expected when chat room doesn't exist yet
      if (error?.response?.status !== 404) {
        console.error('Error fetching chat room:', error);
      }
      throw error;
    }
  }

  /**
   * List chat rooms for a user
   */
  async listChatRooms(params: {
    user_id: string;
    active_only?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<ChatRoomWithLastMessage[]> {
    try {
      const response = await axios.get(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.CHAT_ROOMS}`,
        {
          params,
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  /**
   * Get a specific chat room by ID
   */
  async getChatRoom(chatRoomId: number): Promise<ChatRoomResponse> {
    try {
      const response = await axios.get(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.CHAT_ROOM_BY_ID(chatRoomId)}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(messageData: MessageCreate): Promise<MessageResponse> {
    try {
      const response = await axios.post(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.MESSAGES}`,
        messageData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * List messages in a chat room
   */
  async listMessages(params: {
    chat_room_id: number;
    skip?: number;
    limit?: number;
  }): Promise<MessageResponse[]> {
    try {
      const response = await axios.get(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.MESSAGES}`,
        {
          params,
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Get a specific message
   */
  async getMessage(messageId: number): Promise<MessageResponse> {
    try {
      const response = await axios.get(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.MESSAGE_BY_ID(messageId)}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  /**
   * Update message (mark as read)
   */
  async updateMessage(messageId: number, update: MessageUpdate): Promise<MessageResponse> {
    try {
      const response = await axios.patch(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.MESSAGE_BY_ID(messageId)}`,
        update,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  /**
   * Mark all messages as read in a chat room
   */
  async markMessagesAsRead(chatRoomId: number, userId: string): Promise<void> {
    try {
      await axios.patch(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.MARK_MESSAGES_READ}`,
        null,
        {
          params: {
            chat_room_id: chatRoomId,
            user_id: userId,
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get chat statistics
   */
  async getStatistics(userId?: string): Promise<ChatStatistics> {
    try {
      const response = await axios.get(
        `${CHAT_BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.STATISTICS}`,
        {
          params: userId ? { user_id: userId } : undefined,
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
