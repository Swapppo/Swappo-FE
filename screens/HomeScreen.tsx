/**
 * Home Screen
 * Main authenticated screen
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Swipe: undefined;
  Explore: undefined;
  TradeOffers: undefined;
  Matches: undefined;
  MyItems: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900">Swappo</Text>
        <Text className="text-gray-600 mt-1">Welcome, {user?.username}!</Text>
      </View>

      {/* Main Navigation Buttons */}
      <View className="flex-1 px-6 py-8">
        <View className="flex-1 justify-center">
          {/* First Row */}
          <View className="flex-row mb-4" style={{ gap: 16 }}>
            {/* Swipe Button */}
            <TouchableOpacity
              className="flex-1 rounded-2xl shadow-lg"
              style={{ 
                backgroundColor: '#ec4899',
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => navigation.navigate('Swipe')}
            >
              <Text className="text-5xl mb-2">💘</Text>
              <Text className="text-white text-center font-bold text-lg">
                Swipe
              </Text>
            </TouchableOpacity>

            {/* Explore Button */}
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-2xl shadow-lg"
              style={{ 
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text className="text-5xl mb-2">🔍</Text>
              <Text className="text-white text-center font-bold text-lg">
                Explore
              </Text>
            </TouchableOpacity>
          </View>

          {/* Second Row */}
          <View className="flex-row mb-4" style={{ gap: 16 }}>
            {/* Trade Offers Button */}
            <TouchableOpacity
              className="flex-1 bg-purple-600 rounded-2xl shadow-lg"
              style={{ 
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => navigation.navigate('TradeOffers')}
            >
              <Text className="text-5xl mb-2">🤝</Text>
              <Text className="text-white text-center font-bold text-lg">
                Trade Offers
              </Text>
            </TouchableOpacity>

            {/* Matches Button */}
            <TouchableOpacity
              className="flex-1 bg-green-600 rounded-2xl shadow-lg"
              style={{ 
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => navigation.navigate('Matches')}
            >
              <Text className="text-5xl mb-2">⭐</Text>
              <Text className="text-white text-center font-bold text-lg">
                Matches
              </Text>
            </TouchableOpacity>
          </View>

          {/* My Items Button - Full Width */}
          <TouchableOpacity
            className="bg-orange-500 rounded-2xl py-6 shadow-lg"
            onPress={() => navigation.navigate('MyItems')}
          >
            <Text className="text-white text-center font-bold text-xl">
              📦 My Items
            </Text>
            <Text className="text-white text-center text-sm mt-1 opacity-90">
              Manage your listings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="border border-gray-300 rounded-lg py-2 mt-4"
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text className="text-gray-700 text-center font-medium text-base">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
