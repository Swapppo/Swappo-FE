/**
 * Notification Types
 * Type definitions for notifications
 */

export enum NotificationType {
  TRADE_OFFER_RECEIVED = 'trade_offer_received',
  TRADE_OFFER_ACCEPTED = 'trade_offer_accepted',
  TRADE_OFFER_REJECTED = 'trade_offer_rejected',
  TRADE_OFFER_CANCELLED = 'trade_offer_cancelled',
  TRADE_COMPLETED = 'trade_completed',
  NEW_MESSAGE = 'new_message',
  ITEM_LIKED = 'item_liked',
  SYSTEM = 'system',
}

export interface NotificationCreate {
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  related_user_id?: string;
  related_item_id?: number;
  related_offer_id?: number;
}

export interface NotificationResponse {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  related_user_id?: string;
  related_item_id?: number;
  related_offer_id?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface MarkAsReadRequest {
  notification_ids: number[];
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
}
