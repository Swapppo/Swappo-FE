/**
 * Chat Service
 * Handles chat room and messaging operations
 */

import axios from 'axios';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api.config';
import {
  ChatRoomCreate,
  ChatRoomResponse,
  ChatRoomWithLastMessage,
  MessageCreate,
  MessageResponse,
  MessageUpdate,
  ChatStatistics,
} from '../types/chat.types';

const getChatApiUrl = (port: number = 8004): string => {
  const IS_PRODUCTION = false;

  if (IS_PRODUCTION) {
    return 'https://api.yourapp.com/chat';
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

const CHAT_BASE_URL = getChatApiUrl(8004);

class ChatService {
  /**
   * Create a new chat room
   */
  async createChatRoom(roomData: ChatRoomCreate): Promise<ChatRoomResponse> {
    try {
      const response = await axios.post(
        `${CHAT_BASE_URL}/api/v1/chat-rooms`,
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
        `${CHAT_BASE_URL}/api/v1/chat-rooms/trade-offer/${tradeOfferId}`,
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
        `${CHAT_BASE_URL}/api/v1/chat-rooms`,
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
        `${CHAT_BASE_URL}/api/v1/chat-rooms/${chatRoomId}`,
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
        `${CHAT_BASE_URL}/api/v1/messages`,
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
        `${CHAT_BASE_URL}/api/v1/messages`,
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
        `${CHAT_BASE_URL}/api/v1/messages/${messageId}`,
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
        `${CHAT_BASE_URL}/api/v1/messages/${messageId}`,
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
        `${CHAT_BASE_URL}/api/v1/messages/mark-read`,
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
        `${CHAT_BASE_URL}/api/v1/statistics`,
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
