/**
 * Trade Offers Screen
 * View and manage trade offers
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';

export function TradeOffersScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Trade Offers" showBack={true} />
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-lg">Trade Offers Screen</Text>
      </View>
    </View>
  );
}
