/**
 * Trade Offers Screen
 * View and manage trade offers
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../hooks/useAuth';
import { matchmakingService } from '../services/matchmaking.service';
import { catalogService } from '../services/catalog.service';
import { shippingService } from '../services/easyship.service';
import { authService } from '../services/auth.service';
import { TradeOfferResponse, TradeOfferStatus } from '../types/matchmaking.types';
import { ItemResponse } from '../types/catalog.types';
import { ENV } from '../config/env.config';
import { API_CONFIG } from '../config/api.config';

export function TradeOffersScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [receivedOffers, setReceivedOffers] = useState<TradeOfferResponse[]>([]);
  const [itemsCache, setItemsCache] = useState<Map<number, ItemResponse>>(new Map());
  const [shippingCosts, setShippingCosts] = useState<Map<number, { cost: number; currency: string; courier: string }>>(new Map());

  useFocusEffect(
    React.useCallback(() => {
      loadOffers();
    }, [user?.id])
  );

  const loadOffers = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get received offers (pending only to start)
      const offers = await matchmakingService.getReceivedOffers(
        user.id,
        TradeOfferStatus.PENDING
      );
      
      setReceivedOffers(offers);

      // Load item details for all items in the offers
      const itemIds = new Set<number>();
      offers.forEach(offer => {
        offer.offered_item_ids.forEach(id => itemIds.add(id));
        offer.requested_item_ids.forEach(id => itemIds.add(id));
      });

      // Fetch item details
      const itemPromises = Array.from(itemIds).map(id => 
        catalogService.getItemById(id).catch(() => null)
      );
      const items = await Promise.all(itemPromises);
      
      const cache = new Map<number, ItemResponse>();
      items.forEach(item => {
        if (item) cache.set(item.id, item);
      });
      
      setItemsCache(cache);

      // Load shipping estimates for each offer
      loadShippingEstimates(offers);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShippingEstimates = async (offers: TradeOfferResponse[]) => {
    console.log('📦 Loading shipping estimates for', offers.length, 'offers');
    
    const costs = new Map<number, { cost: number; currency: string; courier: string }>();

    // Load shipping costs for each offer in parallel
    await Promise.all(
      offers.map(async (offer) => {
        try {
          // Fetch proposer's profile to get their country
          let proposerCountry = 'US'; // Default fallback
          try {
            const proposerProfile = await authService.getUserById(offer.proposer_id);
            proposerCountry = proposerProfile.country || 'US';
            console.log(`📍 Proposer (${offer.proposer_id}) country: ${proposerCountry}`);
          } catch (error) {
            console.warn(`⚠️ Could not fetch proposer profile, using default country:`, error);
          }

          // Estimate shipping cost via Cloud Function
          // Using proposer's country as origin and current user's country as destination
          const estimate = await shippingService.estimateShippingCost({
            from_country: proposerCountry,
            to_country: user?.country || 'US',
            weight_kg: 1,
          });

          if (estimate) {
            costs.set(offer.id, estimate);
            console.log(`✅ Shipping estimate for offer ${offer.id}: $${estimate.cost} via ${estimate.courier} (${proposerCountry} → ${user?.country || 'US'})`);
          }
        } catch (error) {
          console.error(`❌ Failed to get shipping estimate for offer ${offer.id}:`, error);
        }
      })
    );

    setShippingCosts(costs);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOffers();
    setRefreshing(false);
  };

  const handleAcceptOffer = async (offerId: number) => {
    if (!user?.id) return;

    try {
      await matchmakingService.updateTradeOfferStatus(
        offerId,
        user.id,
        { status: TradeOfferStatus.ACCEPTED }
      );
      console.log('✅ Offer accepted:', offerId);
      loadOffers(); // Reload to update UI
    } catch (error) {
      console.error('Failed to accept offer:', error);
      alert('Failed to accept offer');
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    if (!user?.id) return;

    try {
      await matchmakingService.updateTradeOfferStatus(
        offerId,
        user.id,
        { status: TradeOfferStatus.REJECTED }
      );
      console.log('❌ Offer rejected:', offerId);
      loadOffers(); // Reload to update UI
    } catch (error) {
      console.error('Failed to reject offer:', error);
      alert('Failed to reject offer');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-cream">
        <ScreenHeader title="Trade Offers" showBack={true} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <ScreenHeader title="Trade Offers" showBack={false} />
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {receivedOffers.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400 text-lg mb-2 font-manrope">No pending offers</Text>
            <Text className="text-gray-400 text-sm font-manrope">New offers will appear here</Text>
          </View>
        ) : (
          <View className="p-4" style={{ gap: 16 }}>
            {receivedOffers.map((offer) => (
              <View
                key={offer.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
              >
                {/* Header */}
                <View className="mb-3">
                  <Text className="text-sm text-gray-500">
                    From: {offer.proposer_id}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {new Date(offer.created_at).toLocaleDateString()}
                  </Text>
                </View>

                {/* They Want Section */}
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    They want:
                  </Text>
                  <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                    {offer.requested_item_ids.map((itemId) => {
                      const item = itemsCache.get(itemId);
                      return (
                        <View key={itemId} className="w-20 h-20 rounded-lg overflow-hidden">
                          {item ? (
                            <Image
                              source={{
                                uri: item.image_urls[0]?.startsWith('http')
                                  ? item.image_urls[0]
                                  : `${API_CONFIG.CATALOG_BASE_URL}${item.image_urls[0]}`,
                              }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="w-full h-full bg-gray-200 justify-center items-center">
                              <Text className="text-gray-400 text-xs">#{itemId}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* They Offer Section */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    They offer:
                  </Text>
                  <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                    {offer.offered_item_ids.map((itemId) => {
                      const item = itemsCache.get(itemId);
                      return (
                        <View key={itemId} className="w-20 h-20 rounded-lg overflow-hidden">
                          {item ? (
                            <Image
                              source={{
                                uri: item.image_urls[0]?.startsWith('http')
                                  ? item.image_urls[0]
                                  : `${API_CONFIG.CATALOG_BASE_URL}${item.image_urls[0]}`,
                              }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="w-full h-full bg-gray-200 justify-center items-center">
                              <Text className="text-gray-400 text-xs">#{itemId}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Message */}
                {offer.message && (
                  <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-700">{offer.message}</Text>
                  </View>
                )}

                {/* Shipping Cost */}
                {shippingCosts.has(offer.id) && (
                  <View className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-semibold text-blue-900">
                        Estimated Shipping
                      </Text>
                      <Text className="text-lg font-bold text-blue-600">
                        ${shippingCosts.get(offer.id)!.cost.toFixed(2)}
                      </Text>
                    </View>
                    <Text className="text-xs text-blue-700 mt-1">
                      via {shippingCosts.get(offer.id)!.courier}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row" style={{ gap: 8 }}>
                  <TouchableOpacity
                    className="flex-1 bg-red-500 py-3 rounded-xl"
                    onPress={() => handleRejectOffer(offer.id)}
                  >
                    <Text className="text-white text-center font-semibold">Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-green-500 py-3 rounded-xl"
                    onPress={() => handleAcceptOffer(offer.id)}
                  >
                    <Text className="text-white text-center font-semibold">Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
