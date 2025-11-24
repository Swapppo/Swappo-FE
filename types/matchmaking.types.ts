/**
 * Matchmaking Types
 * Type definitions for trade offers and matchmaking
 */

export enum TradeOfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface TradeOfferCreate {
  proposer_id: string;
  receiver_id: string;
  offered_item_ids: number[];
  requested_item_ids: number[];
  message?: string;
}

export interface TradeOfferResponse {
  id: number;
  proposer_id: string;
  receiver_id: string;
  offered_item_ids: number[];
  requested_item_ids: number[];
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
}

export interface TradeOfferUpdate {
  status: TradeOfferStatus;
}

export interface MatchStatistics {
  total_offers: number;
  pending_offers: number;
  accepted_offers: number;
  rejected_offers: number;
  completed_offers: number;
}
