/**
 * Home Screen
 * Main authenticated screen with Yard Sale design
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NotificationBadge from '../components/NotificationBadge';
import NotificationsPopup from '../components/NotificationsPopup';
import { catalogService } from '../services/catalog.service';
import { ItemResponse } from '../types/catalog.types';
import { ENV } from '../config/env.config';
import { dummy_items } from '../mockup/dummy_data';
import { mapDummyItemToItemResponse } from '../mockup/item.mapper';
type RootStackParamList = {
  Home: undefined;
  Swipe: undefined;
  Explore: undefined;
  TradeOffers: undefined;
  Matches: undefined;
  MyItems: undefined;
  UploadItem: undefined;
  Notifications: undefined;
  ItemInfo: {item: ItemResponse}
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user, logout, isLoading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [myItems, setMyItems] = useState<ItemResponse[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    loadMyItems();
  }, [user?.id]);

  //!PRAVILNO
  // const loadMyItems = async () => {
  //   if (!user?.id) return;
  //   try {
  //     const items = await catalogService.getMyItems(user.id);
  //     setMyItems(items.slice(0, 4));
  //   } catch (error) {
  //     console.error('Failed to load items:', error);
  //   } finally {
  //     setLoadingItems(false);
  //   }
  //  };

  //!USE OF DUMMY_DATA 
  //TODO: REMOVE WHEN WORKING
  const loadMyItems = async () => {
    setLoadingItems(true);
    try {
      const items = dummy_items.map(mapDummyItemToItemResponse);
      setMyItems(items.slice(0, 4));
    }
    catch (error) {
      console.error('Failed to load dummy items: ', error);
    }
    finally {
      setLoadingItems(false);
    }
  }


  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-cream">
        <ActivityIndicator size="large" color="#4B4DED" />
      </View>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View className="flex-1 bg-cream">
      {/* Header */}
      <View className="bg-cream/90 backdrop-blur px-6 pt-12 pb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-young-serif tracking-tight text-dark">
            Swappo
          </Text>
          <NotificationBadge onPress={() => setShowNotifications(true)} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6">
        {/* Greeting Section */}
        <View className="mb-8 mt-2">
          <Text className="text-gray-500 text-sm font-manrope font-medium">
            {getGreeting()},
          </Text>
          <Text className="text-3xl font-young-serif tracking-tight text-dark mt-1">
            Ready to trade?
          </Text>
        </View>

        {/* Main CTA Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Swipe')}
          activeOpacity={0.9}
          className="mb-8"
        >
          <View className="relative">
            <View className="absolute inset-0 bg-primary rounded-4xl rotate-2 opacity-40" />
            <View className="relative bg-primary rounded-4xl p-8 shadow-xl">
              <View className="relative z-10">
                <Text className="font-young-serif text-3xl tracking-tight mb-2 text-white">
                  Start Swiping
                </Text>
                <Text className="text-white/80 font-manrope font-medium text-lg leading-relaxed max-w-[70%]">
                  Discover vintage treasures around you.
                </Text>
                <View className="mt-6 inline-flex flex-row items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/10 self-start">
                  <Text className="font-manrope font-semibold text-sm text-white">
                    Let&apos;s go
                  </Text>
                  <Text className="text-white">→</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Your Listings Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="font-young-serif text-xl tracking-tight text-dark">
              Your Listings
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('UploadItem')}>
              <Text className="text-accent-red text-sm font-manrope font-semibold">
                Add New
              </Text>
            </TouchableOpacity>
          </View>

          {/* My Items Grid */}
          <View className="flex-row">
            {loadingItems ? (
              <ActivityIndicator size="small" color="#4B4DED" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {myItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="w-28"
                    onPress={() => navigation.navigate('ItemInfo', {item})}
                  >
                    <Image
                      source={{
                        uri: item.image_urls[0]?.startsWith('http')
                          ? item.image_urls[0]
                          : `${ENV.CATALOG_API_BASE_URL}${item.image_urls[0]}`,
                      }}
                      className="w-28 h-28 rounded-2xl bg-white border border-dark/5 shadow-sm"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}

                {/* Add new item tile */}
                <TouchableOpacity
                  className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-gray-300 items-center justify-center"
                  onPress={() => navigation.navigate('UploadItem')}
                >
                  <Text className="text-gray-400 text-3xl">+</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <View className="flex-row gap-4 mb-4">
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-dark/5"
              onPress={() => navigation.navigate('Explore')}
            >
              <Text className="text-2xl mb-2">🔍</Text>
              <Text className="font-manrope font-semibold text-dark">Explore</Text>
              <Text className="font-manrope text-xs text-gray-500 mt-1">
                Browse items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-dark/5"
              onPress={() => navigation.navigate('TradeOffers')}
            >
              <Text className="text-2xl mb-2">📥</Text>
              <Text className="font-manrope font-semibold text-dark">Offers</Text>
              <Text className="font-manrope text-xs text-gray-500 mt-1">
                View trades
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="border-2 border-gray-300 rounded-2xl py-3 mb-8"
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text className="text-gray-700 text-center font-manrope font-semibold text-base">
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Notifications Popup */}
      <NotificationsPopup
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </View>
  );
};
