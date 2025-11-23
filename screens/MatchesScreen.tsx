/**
 * Matches Screen
 * View matched items and users
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';

export function MatchesScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Matches" showBack={true} />
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-lg">Matches Screen</Text>
      </View>
    </View>
  );
}
