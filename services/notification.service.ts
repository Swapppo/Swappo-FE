/**
 * Notification Service
 * Handles notification operations
 */

import axios from 'axios';
import { ENV } from '../config/env.config';
import { API_CONFIG } from '../config/api.config';
import {
  NotificationCreate,
  NotificationResponse,
  MarkAsReadRequest,
  UnreadCountResponse,
  NotificationStats,
} from '../types/notification.types';

const NOTIFICATION_BASE_URL = ENV.API_BASE_URL;

class NotificationService {
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationResponse[]> {
    try {
      const params = new URLSearchParams({
        unread_only: unreadOnly.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await axios.get(
        `${NOTIFICATION_BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.USER_NOTIFICATIONS(userId)}?${params}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await axios.get<UnreadCountResponse>(
        `${NOTIFICATION_BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT(userId)}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data.unread_count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(userId: string): Promise<NotificationStats> {
    try {
      const response = await axios.get<NotificationStats>(
        `${NOTIFICATION_BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.STATS(userId)}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markAsRead(userId: string, notificationIds: number[]): Promise<void> {
    try {
      await axios.patch(
        `${NOTIFICATION_BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(userId)}`,
        { notification_ids: notificationIds } as MarkAsReadRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark a single notification as read
   */
  async markSingleAsRead(userId: string, notificationId: number): Promise<NotificationResponse> {
    try {
      const response = await axios.patch(
        `${NOTIFICATION_BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_SINGLE_READ(notificationId, userId)}`,
        {},
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(userId: string, notificationId: number): Promise<void> {
    try {
      await axios.delete(
        `${NOTIFICATION_BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE_NOTIFICATION(notificationId, userId)}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      await axios.delete(
        `${NOTIFICATION_BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE_ALL(userId)}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Create a notification (typically called by backend services)
   */
  async createNotification(notificationData: NotificationCreate): Promise<NotificationResponse> {
    try {
      const response = await axios.post(
        `${NOTIFICATION_BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.CREATE}`,
        notificationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();
