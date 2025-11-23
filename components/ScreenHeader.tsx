/**
 * Screen Header Component
 * Reusable header with back button and title
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function ScreenHeader({ title, showBack = true, rightAction }: ScreenHeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        {/* Back Button */}
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 p-2 -ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-2xl text-blue-600">←</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-8" />
        )}

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 flex-1">
          {title}
        </Text>

        {/* Right Action */}
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} className="ml-3">
            <Text className="text-blue-600 font-semibold">{rightAction.label}</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-8" />
        )}
      </View>
    </View>
  );
}
