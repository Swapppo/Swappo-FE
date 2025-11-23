/**
 * Swipe Screen
 * Tinder-style swiping interface for items
 */

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { catalogService } from '../services/catalog.service';
import { ItemResponse } from '../types/catalog.types';
import { useAuth } from '../hooks/useAuth';
import { ENV } from '../config/env.config';

const { width } = Dimensions.get('window');

export function SwipeScreen() {
  const { user } = useAuth();
  const [currentItem, setCurrentItem] = useState<ItemResponse | null>(null);
  const [myItems, setMyItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<ItemResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch items when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [user?.id])
  );

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load feed items (backend now excludes user's own items automatically)
      const feed = await catalogService.getFeed({ 
        limit: 50, 
        user_id: user.id 
      });
      setFeedItems(feed);
      
      if (feed.length > 0) {
        setCurrentItem(feed[0]);
      }

      // Load user's items (max 4)
      const items = await catalogService.getMyItems(user.id);
      setMyItems(items.slice(0, 4));
    } catch (error) {
      console.error('Failed to load swipe data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    // Move to next item
    const nextIndex = currentIndex + 1;
    if (nextIndex < feedItems.length) {
      setCurrentIndex(nextIndex);
      setCurrentItem(feedItems[nextIndex]);
    } else {
      setCurrentItem(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <ScreenHeader title="Swipe" showBack={true} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Swipe" showBack={true} />
      
      {/* Main Card Area */}
      <View className="flex-1 justify-center items-center px-4">
        {currentItem ? (
          <View 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ width: width - 32, height: '70%' }}
          >
            {/* Item Image */}
            <Image
              source={{ 
                uri: currentItem.image_urls[0]?.startsWith('http') 
                  ? currentItem.image_urls[0] 
                  : `${ENV.CATALOG_API_BASE_URL}${currentItem.image_urls[0]}`
              }}
              className="w-full h-4/5"
              resizeMode="cover"
            />
            
            {/* Item Info */}
            <View className="p-6 bg-white">
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {currentItem.name}
              </Text>
              <Text className="text-gray-600 text-base">
                Owner: {currentItem.owner_id}
              </Text>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-400 mb-2">
              No more items
            </Text>
            <Text className="text-gray-500">Check back later!</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {currentItem && (
        <View className="flex-row justify-center items-center mb-6 px-8" style={{ gap: 40 }}>
          <TouchableOpacity
            className="bg-red-500 rounded-full w-16 h-16 justify-center items-center shadow-lg"
            onPress={() => handleSwipe('left')}
          >
            <Text className="text-white text-3xl">✕</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-green-500 rounded-full w-16 h-16 justify-center items-center shadow-lg"
            onPress={() => handleSwipe('right')}
          >
            <Text className="text-white text-3xl">♥</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* My Items Row */}
      <View className="bg-gray-100 px-4 py-4 border-t border-gray-200">
        <Text className="text-sm font-semibold text-gray-700 mb-3">
          Your Items
        </Text>
        <View className="flex-row" style={{ gap: 8 }}>
          {myItems.length > 0 ? (
            myItems.map((item, index) => (
              <View
                key={item.id}
                className="flex-1 bg-white rounded-xl overflow-hidden shadow"
                style={{ aspectRatio: 1 }}
              >
                <Image
                  source={{ 
                    uri: item.image_urls[0]?.startsWith('http') 
                      ? item.image_urls[0] 
                      : `${ENV.CATALOG_API_BASE_URL}${item.image_urls[0]}`
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-4">
              <Text className="text-gray-400 text-sm">No items yet</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
