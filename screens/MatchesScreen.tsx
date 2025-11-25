/**
 * Matches Screen
 * View accepted trade offers with chat functionality
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../hooks/useAuth';
import { matchmakingService } from '../services/matchmaking.service';
import { chatService } from '../services/chat.service';
import { catalogService } from '../services/catalog.service';
import { TradeOfferResponse, TradeOfferStatus } from '../types/matchmaking.types';
import { ChatRoomResponse } from '../types/chat.types';
import { ItemResponse } from '../types/catalog.types';
import { ENV } from '../config/env.config';

interface MatchWithChat {
  offer: TradeOfferResponse;
  chatRoom: ChatRoomResponse | null;
  offeredItems: ItemResponse[];
  requestedItems: ItemResponse[];
}

export function MatchesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<MatchWithChat[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadMatches();
    }, [user?.id])
  );

  const loadMatches = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get all accepted offers (both sent and received)
      const [sentOffers, receivedOffers] = await Promise.all([
        matchmakingService.getSentOffers(user.id, TradeOfferStatus.ACCEPTED),
        matchmakingService.getReceivedOffers(user.id, TradeOfferStatus.ACCEPTED),
      ]);

      const allAcceptedOffers = [...sentOffers, ...receivedOffers];

      // Load chat rooms and items for each offer
      const matchPromises = allAcceptedOffers.map(async (offer) => {
        try {
          // Try to get chat room for this offer
          let chatRoom: ChatRoomResponse | null = null;
          try {
            chatRoom = await chatService.getChatRoomByTradeOffer(offer.id);
          } catch {
            // Chat room doesn't exist yet, will be created when user opens chat
          }

          // Load item details
          const offeredItemsPromises = offer.offered_item_ids.map(id =>
            catalogService.getItemById(id).catch(() => null)
          );
          const requestedItemsPromises = offer.requested_item_ids.map(id =>
            catalogService.getItemById(id).catch(() => null)
          );

          const [offeredItems, requestedItems] = await Promise.all([
            Promise.all(offeredItemsPromises),
            Promise.all(requestedItemsPromises),
          ]);

          return {
            offer,
            chatRoom,
            offeredItems: offeredItems.filter((item): item is ItemResponse => item !== null),
            requestedItems: requestedItems.filter((item): item is ItemResponse => item !== null),
          };
        } catch (error) {
          console.error(`Failed to load match for offer ${offer.id}:`, error);
          return null;
        }
      });

      const matchesData = await Promise.all(matchPromises);
      setMatches(matchesData.filter((m): m is MatchWithChat => m !== null));
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const handleOpenChat = async (match: MatchWithChat) => {
    if (!user?.id) return;

    try {
      // Create chat room if it doesn't exist
      const chatRoom = match.chatRoom ?? await chatService.createChatRoom({
        trade_offer_id: match.offer.id,
        user1_id: match.offer.proposer_id,
        user2_id: match.offer.receiver_id,
      });

      // Determine the other user
      const otherUserId = match.offer.proposer_id === user.id
        ? match.offer.receiver_id
        : match.offer.proposer_id;

      // Navigate to chat screen
      (navigation as any).navigate('Chat', {
        chatRoomId: chatRoom.id,
        tradeOfferId: match.offer.id,
        otherUserId,
      });
    } catch (error) {
      console.error('Failed to open chat:', error);
      alert('Failed to open chat');
    }
  };

  const renderMatch = (match: MatchWithChat) => {
    const isProposer = match.offer.proposer_id === user?.id;
    const offeredItems = isProposer ? match.offeredItems : match.requestedItems;
    const requestedItems = isProposer ? match.requestedItems : match.offeredItems;

    return (
      <View key={match.offer.id} className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
        {/* Offer Info */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-semibold text-gray-700">
            Trade #{match.offer.id}
          </Text>
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-medium">✓ Accepted</Text>
          </View>
        </View>

        {/* Items Exchange */}
        <View className="flex-row items-center mb-4">
          {/* Your Items */}
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-2">You offer:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {offeredItems.map((item) => (
                <View key={item.id} className="mr-2">
                  <Image
                    source={{ uri: `${ENV.CATALOG_API_BASE_URL}${item.image_url}` }}
                    className="w-16 h-16 rounded-lg"
                  />
                  <Text className="text-xs mt-1 text-center" numberOfLines={1}>
                    {item.title && item.title.length > 10 ? item.title.substring(0, 10) + '...' : (item.title || 'Item')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Arrow */}
          <View className="px-3">
            <Text className="text-2xl text-gray-400">⇄</Text>
          </View>

          {/* Their Items */}
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-2">You get:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {requestedItems.map((item) => (
                <View key={item.id} className="mr-2">
                  <Image
                    source={{ uri: `${ENV.CATALOG_API_BASE_URL}${item.image_url}` }}
                    className="w-16 h-16 rounded-lg"
                  />
                  <Text className="text-xs mt-1 text-center" numberOfLines={1}>
                    {item.title && item.title.length > 10 ? item.title.substring(0, 10) + '...' : (item.title || 'Item')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Message if exists */}
        {match.offer.message && (
          <View className="bg-gray-50 p-3 rounded-lg mb-3">
            <Text className="text-xs text-gray-500 mb-1">Message:</Text>
            <Text className="text-sm text-gray-700">{match.offer.message}</Text>
          </View>
        )}

        {/* Chat Button */}
        <TouchableOpacity
          className="bg-blue-500 py-3 rounded-lg items-center"
          onPress={() => handleOpenChat(match)}
        >
          <Text className="text-white font-semibold">💬 Open Chat</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Matches" showBack={true} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Matches" showBack={true} />
      
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {matches.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400 text-lg mb-2">No matches yet</Text>
            <Text className="text-gray-400 text-sm text-center px-8">
              When someone accepts your trade offer, you'll see it here and can start chatting!
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Your Matches ({matches.length})
            </Text>
            {matches.map(renderMatch)}
          </>
        )}
      </ScrollView>
    </View>
  );
}
