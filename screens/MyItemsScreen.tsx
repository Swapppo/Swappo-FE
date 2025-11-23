/**
 * My Items Screen
 * Display user's uploaded items with upload button
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../hooks/useAuth';
import { catalogService } from '../services/catalog.service';
import { ItemResponse } from '../types/catalog.types';

type RootStackParamList = {
  MyItems: undefined;
  UploadItem: undefined;
};

type MyItemsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyItems'>;
};

export const MyItemsScreen = ({ navigation }: MyItemsScreenProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyItems = async () => {
    if (!user?.id) return;
    
    try {
      const myItems = await catalogService.getMyItems(user.id);
      setItems(myItems);
    } catch (error) {
      console.error('Failed to fetch my items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch items when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchMyItems();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyItems();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <ScreenHeader title="My Items" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="My Items" />
      
      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Upload Button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-4 mt-6 shadow-lg"
          onPress={() => navigation.navigate('UploadItem')}
        >
          <Text className="text-white text-center font-bold text-lg">
            📸 Upload New Item
          </Text>
        </TouchableOpacity>

        {/* Items Grid */}
        {items.length === 0 ? (
          <View className="mt-8">
            <Text className="text-gray-600 text-center text-base">
              No items yet. Upload your first item!
            </Text>
          </View>
        ) : (
          <View className="mt-6 mb-6">
            {/* Create rows of 2 items each */}
            {Array.from({ length: Math.ceil(items.length / 2) }).map((_, rowIndex) => (
              <View key={`row-${rowIndex}`} className="flex-row mb-4" style={{ gap: 12 }}>
                {items.slice(rowIndex * 2, rowIndex * 2 + 2).map((item) => (
                  <View
                    key={item.id}
                    className="flex-1 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                  >
                    {/* Item Image */}
                    {item.image_urls && item.image_urls.length > 0 && (
                      <Image
                        source={{ uri: item.image_urls[0] }}
                        className="w-full"
                        style={{ aspectRatio: 1 }}
                        resizeMode="cover"
                      />
                    )}
                    
                    {/* Item Details */}
                    <View className="p-3">
                      <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-xs text-gray-600 mb-2" numberOfLines={2}>
                        {item.description}
                      </Text>
                      <View className="flex-row items-center flex-wrap" style={{ gap: 4 }}>
                        <View className="bg-blue-100 px-2 py-1 rounded-full">
                          <Text className="text-xs font-medium text-blue-800">
                            {item.category}
                          </Text>
                        </View>
                        <View className="bg-green-100 px-2 py-1 rounded-full">
                          <Text className="text-xs font-medium text-green-800">
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
