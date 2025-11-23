/**
 * Home Screen
 * Main authenticated screen
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export const HomeScreen = () => {
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
    <View className="flex-1 bg-white px-6 py-8">
      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome!</Text>
        <Text className="text-gray-600">You are successfully logged in</Text>
      </View>

      {/* User Info Card */}
      <View className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          User Information
        </Text>

        <View className="space-y-3">
          <View>
            <Text className="text-sm text-gray-500">Username</Text>
            <Text className="text-base text-gray-900 font-medium">
              {user?.username}
            </Text>
          </View>

          <View>
            <Text className="text-sm text-gray-500">Email</Text>
            <Text className="text-base text-gray-900 font-medium">{user?.email}</Text>
          </View>

          {user?.full_name ? (
            <View>
              <Text className="text-sm text-gray-500">Full Name</Text>
              <Text className="text-base text-gray-900 font-medium">
                {user.full_name}
              </Text>
            </View>
          ) : null}

          <View>
            <Text className="text-sm text-gray-500">Account Status</Text>
            <Text
              className={`text-base font-medium ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}
            >
              {user?.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>

          <View>
            <Text className="text-sm text-gray-500">Member Since</Text>
            <Text className="text-base text-gray-900 font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        className="bg-red-600 rounded-lg py-4"
        onPress={handleLogout}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-semibold text-base">
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};
