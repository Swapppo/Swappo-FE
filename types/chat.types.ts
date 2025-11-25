/**
 * Chat Types
 * Type definitions for chat rooms and messages
 */

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export interface ChatRoomCreate {
  trade_offer_id: number;
  user1_id: string;
  user2_id: string;
}

export interface ChatRoomResponse {
  id: number;
  trade_offer_id: number;
  user1_id: string;
  user2_id: string;
  is_active: boolean;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRoomWithLastMessage extends ChatRoomResponse {
  last_message_content?: string;
  last_message_sender_id?: string;
  unread_count: number;
}

export interface MessageCreate {
  chat_room_id: number;
  sender_id: string;
  content: string;
}

export interface MessageResponse {
  id: number;
  chat_room_id: number;
  sender_id: string;
  content: string;
  status: MessageStatus;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageUpdate {
  status?: MessageStatus;
}

export interface ChatStatistics {
  total_rooms: number;
  active_rooms: number;
  total_messages: number;
  total_unread_messages: number;
}
