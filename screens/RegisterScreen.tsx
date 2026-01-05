/**
 * Register Screen
 * New user registration interface with SWappo design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/auth.types';
import { ScreenHeader } from '../components/ScreenHeader';

export const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      general: '',
    };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setErrors({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        general: '',
      });

      await register({
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        full_name: formData.fullName.trim() || null,
      });
      // Navigation will be handled by the auth state change
    } catch (error) {
      const apiError = error as ApiError;
      setErrors({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        general: apiError.message || 'Registration failed. Please try again.',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-cream"
    >
      <ScreenHeader title="Create Account" showBack={true} />
      <ScrollView className="flex-1" contentContainerClassName="flex-grow">
        <View className="flex-1 justify-center px-6 py-8">
          {/* Subtitle */}
          <View className="mb-8">
            <Text className="text-xl text-gray-600 font-manrope">Join Swappo</Text>
          </View>

          {/* Error Message */}
          {errors.general ? (
            <View className="mb-6 p-4 bg-accent-red/10 rounded-2xl border border-accent-red/20">
              <Text className="text-accent-red font-manrope font-medium">{errors.general}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
              Email
            </Text>
            <TextInput
              className={`bg-white border ${errors.email ? 'border-accent-red' : 'border-dark/5'} rounded-2xl px-5 py-4 text-base font-manrope shadow-sm`}
              placeholder="your@email.com"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            {errors.email ? (
              <Text className="text-accent-red text-xs mt-2 font-manrope font-medium">
                {errors.email}
              </Text>
            ) : null}
          </View>

          {/* Username Input */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
              Username
            </Text>
            <TextInput
              className={`bg-white border ${errors.username ? 'border-accent-red' : 'border-dark/5'} rounded-2xl px-5 py-4 text-base font-manrope shadow-sm`}
              placeholder="Choose a username"
              placeholderTextColor="#9CA3AF"
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.username ? (
              <Text className="text-accent-red text-xs mt-2 font-manrope font-medium">
                {errors.username}
              </Text>
            ) : null}
          </View>

          {/* Full Name Input (Optional) */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
              Full Name <Text className="text-gray-300">(Optional)</Text>
            </Text>
            <TextInput
              className="bg-white border border-dark/5 rounded-2xl px-5 py-4 text-base font-manrope shadow-sm"
              placeholder="Your full name"
              placeholderTextColor="#9CA3AF"
              value={formData.fullName}
              onChangeText={(value) => updateField('fullName', value)}
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
              Password
            </Text>
            <TextInput
              className={`bg-white border ${errors.password ? 'border-accent-red' : 'border-dark/5'} rounded-2xl px-5 py-4 text-base font-manrope shadow-sm`}
              placeholder="Min 8 characters"
              placeholderTextColor="#9CA3AF"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              editable={!isLoading}
            />
            {errors.password ? (
              <Text className="text-accent-red text-xs mt-2 font-manrope font-medium">
                {errors.password}
              </Text>
            ) : null}
          </View>

          {/* Confirm Password Input */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
              Confirm Password
            </Text>
            <TextInput
              className={`bg-white border ${errors.confirmPassword ? 'border-accent-red' : 'border-dark/5'} rounded-2xl px-5 py-4 text-base font-manrope shadow-sm`}
              placeholder="Re-enter password"
              placeholderTextColor="#9CA3AF"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              editable={!isLoading}
            />
            {errors.confirmPassword ? (
              <Text className="text-accent-red text-xs mt-2 font-manrope font-medium">
                {errors.confirmPassword}
              </Text>
            ) : null}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className={`rounded-2xl py-4 shadow-lg ${isLoading ? 'bg-dark/60' : 'bg-dark'}`}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg font-manrope">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 font-manrope">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text className="text-primary font-manrope font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
