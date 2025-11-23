/**
 * Swipe Screen
 * Tinder-style swiping interface for items
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';

export function SwipeScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Swipe" showBack={true} />
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-lg">Swipe Screen</Text>
      </View>
    </View>
  );
}
