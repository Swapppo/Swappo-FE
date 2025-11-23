/**
 * My Items Screen
 * Display user's uploaded items with upload button
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '../components/ScreenHeader';

type RootStackParamList = {
  MyItems: undefined;
  UploadItem: undefined;
};

type MyItemsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyItems'>;
};

export const MyItemsScreen = ({ navigation }: MyItemsScreenProps) => {
  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="My Items" />
      
      <ScrollView className="flex-1 px-6">
        {/* Upload Button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-4 mt-6 shadow-lg"
          onPress={() => navigation.navigate('UploadItem')}
        >
          <Text className="text-white text-center font-bold text-lg">
            📸 Upload New Item
          </Text>
        </TouchableOpacity>

        {/* Items List Placeholder */}
        <View className="mt-8">
          <Text className="text-gray-600 text-center text-base">
            Your items will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
