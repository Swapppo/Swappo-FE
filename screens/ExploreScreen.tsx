/**
 * Explore Screen
 * Display items from the catalog with upload and delete functionality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { SearchBar } from '../components/SearchBar';
import { ENV } from '../config/env.config';

import { dummy_items } from '../mockup/dummy_data';
import { mapDummyItemToItemResponse } from '../mockup/item.mapper';

import { API_CONFIG } from '../config/api.config';

export function ExploreScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();

  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadItems = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch feed from API
      const feed = await catalogService.getFeed({
        user_id: user.id,
        limit: 50,
      });

      setItems(feed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load items';
      console.error(message);
      // Fail silently or show toast, but don't block UI with alert on every load
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

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const q = searchQuery.toLowerCase();

    return items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const handleItemPress = (item: ItemResponse) => {
    navigation.navigate('ItemInfo', { item });
  };

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
      <ScreenHeader title="Explore" showBack={false} />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Search items..."
      />

      <ScrollView
        className="flex-1 mt-2"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredItems.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-gray-500 text-lg font-manrope">No items found</Text>
          </View>
        ) : (
          <View className="p-4">
            {Array.from({ length: Math.ceil(filteredItems.length / 2) }).map(
              (_, rowIndex) => (
                <View key={rowIndex} className="flex-row mb-4" style={{ gap: 12 }}>
                  {filteredItems
                    .slice(rowIndex * 2, rowIndex * 2 + 2)
                    .map(item => (
                      <TouchableOpacity
                        key={item.id}
                        className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                        onPress={() => handleItemPress(item)}
                      >
                        <Image
                          source={{
                            uri: item.image_urls[0]?.startsWith('http')
                              ? item.image_urls[0]
                              : `${API_CONFIG.CATALOG_BASE_URL}${item.image_urls[0]}`,
                          }}
                          className="w-full"
                          style={{ aspectRatio: 1 }}
                        />

                        <View className="p-3">
                          <Text className="font-manrope font-bold text-base text-dark" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text className="text-xs text-gray-500 font-manrope">
                            {item.category}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
