/**
 * Settings Screen
 * View and edit user profile and shipping information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { UserProfile } from '../types/auth.types';

export function SettingsScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      
      setProfile({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        address_line1: userData.address_line1 || '',
        address_line2: userData.address_line2 || '',
        city: userData.city || '',
        state: userData.state || '',
        postal_code: userData.postal_code || '',
        country: userData.country || 'US',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authService.updateProfile(profile);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-cream">
        <ScreenHeader title="Settings" showBack={true} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-cream"
    >
      <ScreenHeader title="Settings" showBack={true} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-6">
          {/* Account Info Section */}
          <View className="mb-8">
            <Text className="text-2xl font-young-serif text-dark mb-2">
              Account Information
            </Text>
            <Text className="text-sm text-gray-500 font-manrope mb-4">
              {user?.email}
            </Text>
            <View className="bg-white border border-dark/5 rounded-2xl p-4 shadow-sm">
              <Text className="text-sm text-gray-600 font-manrope">
                Username: <Text className="font-bold text-dark">{user?.username}</Text>
              </Text>
            </View>
          </View>

          {/* Personal Information Section */}
          <View className="mb-8">
            <Text className="text-xl font-young-serif text-dark mb-4">
              Personal Information
            </Text>

            {/* Full Name */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
                Full Name
              </Text>
              <TextInput
                className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={profile.full_name}
                onChangeText={(text) => setProfile({ ...profile, full_name: text })}
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
                Phone Number
              </Text>
              <TextInput
                className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9CA3AF"
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Shipping Address Section */}
          <View className="mb-8">
            <Text className="text-xl font-young-serif text-dark mb-2">
              Shipping Address
            </Text>
            <Text className="text-sm text-gray-500 font-manrope mb-4">
              Used for calculating shipping costs and trade deliveries
            </Text>

            {/* Address Line 1 */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
                Address Line 1
              </Text>
              <TextInput
                className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
                placeholder="123 Main St"
                placeholderTextColor="#9CA3AF"
                value={profile.address_line1}
                onChangeText={(text) => setProfile({ ...profile, address_line1: text })}
              />
            </View>

            {/* Address Line 2 */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
                Address Line 2 (Optional)
              </Text>
              <TextInput
                className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
                placeholder="Apt 4B"
                placeholderTextColor="#9CA3AF"
                value={profile.address_line2}
                onChangeText={(text) => setProfile({ ...profile, address_line2: text })}
              />
            </View>

            {/* City */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
                City
              </Text>
              <TextInput
                className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
                placeholder="New York"
                placeholderTextColor="#9CA3AF"
                value={profile.city}
                onChangeText={(text) => setProfile({ ...profile, city: text })}
              />
            </View>

            {/* State and Postal Code */}
            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1 mb-4">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
                  State
                </Text>
                <TextInput
                  className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
                  placeholder="NY"
                  placeholderTextColor="#9CA3AF"
                  value={profile.state}
                  onChangeText={(text) => setProfile({ ...profile, state: text })}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>

              <View className="flex-1 mb-4">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
                  Postal Code
                </Text>
                <TextInput
                  className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
                  placeholder="10001"
                  placeholderTextColor="#9CA3AF"
                  value={profile.postal_code}
                  onChangeText={(text) => setProfile({ ...profile, postal_code: text })}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Country */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
                Country
              </Text>
              <TextInput
                className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
                placeholder="US"
                placeholderTextColor="#9CA3AF"
                value={profile.country}
                onChangeText={(text) => setProfile({ ...profile, country: text })}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-accent-pink rounded-2xl py-4 shadow-md mb-4"
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-base font-manrope">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-white border border-accent-red rounded-2xl py-4 shadow-sm"
            onPress={handleLogout}
          >
            <Text className="text-accent-red text-center font-bold text-base font-manrope">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
