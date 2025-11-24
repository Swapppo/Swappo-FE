/**
 * Explore Screen
 * Display items from the catalog with upload and delete functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { catalogService } from '../services/catalog.service';
import { matchmakingService } from '../services/matchmaking.service';
import { ItemResponse } from '../types/catalog.types';
import { ScreenHeader } from '../components/ScreenHeader';
import { ENV } from '../config/env.config';

export function ExploreScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<ItemResponse[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemResponse | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOfferItems, setSelectedOfferItems] = useState<Set<number>>(new Set());

  const loadItems = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      setError(null);
      console.log('Fetching feed for user:', user.id);
      const feed = await catalogService.getFeed({
        user_id: user.id,
        limit: 50,
      });
      console.log('Feed loaded:', feed.length, 'items');
      setItems(feed);

      // Load user's items for making offers
      const userItems = await catalogService.getMyItems(user.id);
      setMyItems(userItems);
    } catch (err) {
      console.error('Error loading items:', err);
      const message = err instanceof Error ? err.message : 'Failed to load items';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const handleDelete = useCallback(
    async (itemId: number, ownerId: string) => {
      if (!user?.id) return;

      // Check if user owns this item
      if (ownerId !== user.id) {
        Alert.alert('Error', 'You can only delete your own items');
        return;
      }

      Alert.alert(
        'Delete Item',
        'Are you sure you want to delete this item?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              catalogService.deleteItem(itemId, user.id)
                .then(() => {
                  Alert.alert('Success', 'Item deleted successfully');
                  loadItems();
                })
                .catch((err) => {
                  const message = err instanceof Error ? err.message : 'Failed to delete item';
                  Alert.alert('Error', message);
                });
            },
          },
        ]
      );
    },
    [user?.id, loadItems]
  );

  const handleItemPress = (item: ItemResponse) => {
    // If user owns this item, show delete option
    if (user?.id === item.owner_id) {
      Alert.alert(
        item.name,
        `${item.description}\n\nCategory: ${item.category}\nStatus: ${item.status}\n\nYou own this item`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDelete(item.id, item.owner_id),
          },
        ]
      );
    } else {
      // Open offer modal
      setSelectedItem(item);
      setSelectedOfferItems(new Set());
      setShowOfferModal(true);
    }
  };

  const toggleOfferItem = (itemId: number) => {
    setSelectedOfferItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleConfirmOffer = async () => {
    if (!user?.id || !selectedItem) return;

    if (selectedOfferItems.size === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to offer');
      return;
    }

    try {
      const tradeOffer = await matchmakingService.createTradeOffer({
        proposer_id: user.id,
        receiver_id: selectedItem.owner_id,
        offered_item_ids: Array.from(selectedOfferItems),
        requested_item_ids: [selectedItem.id],
      });

      console.log('✅ Trade offer created successfully:', {
        offerId: tradeOffer.id,
        proposer: tradeOffer.proposer_id,
        receiver: tradeOffer.receiver_id,
        offeredItems: tradeOffer.offered_item_ids,
        requestedItems: tradeOffer.requested_item_ids,
        status: tradeOffer.status,
      });

      setShowOfferModal(false);
      setSelectedItem(null);
      setSelectedOfferItems(new Set());

      Alert.alert('Success', 'Trade offer sent successfully!');
    } catch (error) {
      console.error('❌ Failed to create trade offer:', error);
      Alert.alert('Error', 'Failed to send trade offer. Please try again.');
    }
  };

  const handleCancelOffer = () => {
    setShowOfferModal(false);
    setSelectedItem(null);
    setSelectedOfferItems(new Set());
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading items...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <ScreenHeader title="Explore" showBack={true} />
      <View className="bg-white px-6 py-2 border-b border-gray-200">
        <Text className="text-gray-600">Discover items to trade</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 border border-red-200 mx-4 mt-4 p-4 rounded-lg">
          <Text className="text-red-800">{error}</Text>
        </View>
      )}

      {/* Items List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {items.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg">No items available</Text>
            <Text className="text-gray-400 mt-2">Pull down to refresh</Text>
          </View>
        ) : (
          <View className="p-4">
            {/* Create rows of 2 items each */}
            {Array.from({ length: Math.ceil(items.length / 2) }).map((_, rowIndex) => (
              <View key={rowIndex} className="flex-row mb-4" style={{ gap: 12 }}>
                {items.slice(rowIndex * 2, rowIndex * 2 + 2).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden"
                    onPress={() => handleItemPress(item)}
                  >
                    {/* Item Image */}
                    {item.image_urls.length > 0 && (
                      <Image
                        source={{ uri: item.image_urls[0] }}
                        className="w-full"
                        style={{ aspectRatio: 1 }}
                        resizeMode="cover"
                      />
                    )}

                    {/* Item Details */}
                    <View className="p-3">
                      <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                        {item.name}
                      </Text>
                      
                      <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
                        {item.category}
                      </Text>
                      
                      <View className="mt-2">
                        {(() => {
                          const getStatusBgColor = (status: string) => {
                            if (status === 'active') return 'bg-green-100';
                            if (status === 'swapped') return 'bg-blue-100';
                            return 'bg-gray-100';
                          };
                          
                          const getStatusTextColor = (status: string) => {
                            if (status === 'active') return 'text-green-800';
                            if (status === 'swapped') return 'text-blue-800';
                            return 'text-gray-800';
                          };
                          
                          return (
                            <View className={`px-2 py-1 rounded self-start ${getStatusBgColor(item.status)}`}>
                              <Text className={`text-xs font-medium ${getStatusTextColor(item.status)}`}>
                                {item.status}
                              </Text>
                            </View>
                          );
                        })()}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Trade Offer Modal */}
      <Modal
        visible={showOfferModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelOffer}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-end"
          onPress={handleCancelOffer}
        >
          <Pressable 
            className="bg-white rounded-t-3xl max-h-3/4"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">Make an Offer</Text>
              {selectedItem && (
                <View className="mt-2">
                  <Text className="text-sm text-gray-600">For: {selectedItem.name}</Text>
                </View>
              )}
            </View>

            {/* Your Items Selection */}
            <ScrollView className="px-6 py-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Select items to offer:
              </Text>
              
              {myItems.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-gray-400 text-center">
                    You don't have any items to offer yet
                  </Text>
                  <Text className="text-gray-400 text-center mt-2">
                    Upload items first to make offers
                  </Text>
                </View>
              ) : (
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {myItems.map((item) => {
                    const isSelected = selectedOfferItems.has(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        className="relative rounded-xl overflow-hidden"
                        style={{ width: '30%', aspectRatio: 1 }}
                        onPress={() => toggleOfferItem(item.id)}
                      >
                        <Image
                          source={{
                            uri: item.image_urls[0]?.startsWith('http')
                              ? item.image_urls[0]
                              : `${ENV.CATALOG_API_BASE_URL}${item.image_urls[0]}`,
                          }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                        
                        {/* Selection Overlay */}
                        {isSelected && (
                          <View className="absolute inset-0 bg-blue-500 bg-opacity-60 justify-center items-center">
                            <View className="bg-white rounded-full w-10 h-10 justify-center items-center">
                              <Text className="text-blue-500 text-2xl font-bold">✓</Text>
                            </View>
                          </View>
                        )}
                        
                        {/* Selection Border */}
                        {isSelected && (
                          <View className="absolute inset-0 border-4 border-blue-500 rounded-xl" />
                        )}
                        
                        {/* Item Name */}
                        <View className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                          <Text className="text-white text-xs font-medium" numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {selectedOfferItems.size > 0 && (
                <Text className="text-sm text-blue-600 font-semibold mt-4 text-center">
                  {selectedOfferItems.size} item{selectedOfferItems.size > 1 ? 's' : ''} selected
                </Text>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View className="px-6 py-4 border-t border-gray-200 flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-4 rounded-xl"
                onPress={handleCancelOffer}
              >
                <Text className="text-gray-900 text-center font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl ${
                  selectedOfferItems.size > 0 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onPress={handleConfirmOffer}
                disabled={selectedOfferItems.size === 0}
              >
                <Text className="text-white text-center font-semibold text-base">
                  Confirm Offer
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
