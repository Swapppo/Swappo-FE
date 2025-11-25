/**
 * Explore Screen
 * Display items from the catalog with Yard Sale design
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
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState('');

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

      console.log('✅ Trade offer created successfully:', tradeOffer);

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

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-cream">
        <ActivityIndicator size="large" color="#4B4DED" />
        <Text className="mt-4 text-gray-600 font-manrope">Loading items...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      {/* Header */}
      <ScreenHeader title="Explore" showBack={true} />

      {/* Search Bar */}
      <View className="px-6 pt-4 pb-2">
        <View className="relative">
          <Text className="absolute left-4 top-3.5 text-gray-400 z-10">🔍</Text>
          <TextInput
            className="w-full bg-white pl-12 pr-4 py-3 rounded-2xl border border-dark/5 font-manrope text-base shadow-sm"
            placeholder="Search for vintage, books..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-accent-red/10 border border-accent-red/20 mx-6 mt-4 p-4 rounded-2xl">
          <Text className="text-accent-red font-manrope font-medium">{error}</Text>
        </View>
      )}

      {/* Items Grid */}
      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredItems.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg font-manrope">No items available</Text>
            <Text className="text-gray-400 mt-2 font-manrope">Pull down to refresh</Text>
          </View>
        ) : (
          <View className="pt-4 pb-8">
            {/* Grid: 2 columns */}
            <View className="flex-row flex-wrap" style={{ gap: 16 }}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-white rounded-3xl shadow-sm border border-dark/5 overflow-hidden"
                  style={{ width: '47%' }}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.9}
                >
                  {/* Item Image */}
                  {item.image_urls.length > 0 && (
                    <View className="relative">
                      <Image
                        source={{
                          uri: item.image_urls[0]?.startsWith('http')
                            ? item.image_urls[0]
                            : `${ENV.CATALOG_API_BASE_URL}${item.image_urls[0]}`,
                        }}
                        className="w-full bg-gray-100 rounded-2xl"
                        style={{ aspectRatio: 3 / 4 }}
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                        <Text className="text-xs font-bold font-manrope text-dark">
                          {item.status === 'available' ? 'Trade' : 'Swap'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Item Details */}
                  <View className="p-3">
                    <Text className="font-young-serif text-lg leading-tight text-dark">
                      {item.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1 font-manrope">
                      {item.category}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Trade Modal */}
      <Modal
        visible={showOfferModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelOffer}
      >
        <View className="flex-1 bg-dark/60">
          <Pressable className="flex-1" onPress={handleCancelOffer} />
          
          <View className="bg-white rounded-t-4xl p-6 h-5/6">
            {/* Modal Handle */}
            <View className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

            <ScrollView className="flex-1">
              <Text className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2 font-manrope">
                You want:
              </Text>

              {/* Selected Item */}
              {selectedItem && (
                <View className="flex-row gap-4 mb-8">
                  <Image
                    source={{
                      uri: selectedItem.image_urls[0]?.startsWith('http')
                        ? selectedItem.image_urls[0]
                        : `${ENV.CATALOG_API_BASE_URL}${selectedItem.image_urls[0]}`,
                    }}
                    className="w-24 h-24 rounded-2xl bg-gray-100"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="font-young-serif text-2xl leading-tight text-dark">
                      {selectedItem.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1 font-manrope">
                      {selectedItem.category}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-1 bg-cream px-2 py-1 rounded-lg self-start">
                      <Text className="text-xs font-bold font-manrope text-dark">
                        📍 {selectedItem.status}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View className="h-px bg-gray-100 w-full mb-6" />

              <Text className="text-sm font-bold text-dark mb-4 font-manrope">
                Select items to trade ({selectedOfferItems.size}/{myItems.length})
              </Text>

              {/* My Items Selection */}
              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                {myItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => toggleOfferItem(item.id)}
                    className={`relative rounded-2xl overflow-hidden border-2 ${
                      selectedOfferItems.has(item.id)
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                    style={{ width: '47%', aspectRatio: 1 }}
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
                    <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-gray-200 items-center justify-center">
                      {selectedOfferItems.has(item.id) && (
                        <View className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </View>
                    <Text className="absolute bottom-2 left-2 text-xs font-bold text-white font-manrope drop-shadow">
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Send Offer Button */}
            <View className="mt-6">
              <TouchableOpacity
                onPress={handleConfirmOffer}
                className="w-full py-4 rounded-2xl bg-primary shadow-lg"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-lg font-manrope">
                  Send Offer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
