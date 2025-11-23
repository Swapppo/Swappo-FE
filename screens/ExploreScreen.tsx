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
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { catalogService } from '../services/catalog.service';
import { ItemResponse } from '../types/catalog.types';
import { ScreenHeader } from '../components/ScreenHeader';

export function ExploreScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpload = useCallback(() => {
    navigation.navigate('UploadItem');
  }, [navigation]);

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

      {/* Upload Button */}
      <View className="bg-white px-6 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={handleUpload}
          className="bg-blue-600 py-3 rounded-lg active:bg-blue-700"
        >
          <Text className="text-white text-center font-semibold text-base">
            + Upload New Item
          </Text>
        </TouchableOpacity>
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
            {items.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
              >
                {/* Item Image */}
                {item.image_urls.length > 0 && (
                  <Image
                    source={{ uri: item.image_urls[0] }}
                    className="w-full h-64"
                    resizeMode="cover"
                  />
                )}

                {/* Item Details */}
                <View className="p-4">
                  <Text className="text-xl font-bold text-gray-900">
                    {item.name}
                  </Text>
                  
                  <Text className="text-sm text-gray-500 mt-1">
                    {item.category}
                  </Text>
                  
                  <Text className="text-gray-700 mt-2" numberOfLines={3}>
                    {item.description}
                  </Text>

                  <View className="flex-row items-center mt-2">
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
                        <View className={`px-2 py-1 rounded ${getStatusBgColor(item.status)}`}>
                          <Text className={`text-xs font-medium ${getStatusTextColor(item.status)}`}>
                            {item.status}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>

                  {/* Action Buttons - Only show delete for own items */}
                  {user?.id === item.owner_id && (
                    <View className="mt-4">
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.owner_id)}
                        className="bg-red-600 py-2 rounded-lg active:bg-red-700"
                      >
                        <Text className="text-white text-center font-semibold">
                          Delete Item
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
