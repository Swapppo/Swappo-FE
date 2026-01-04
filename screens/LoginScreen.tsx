/**
 * Login Screen
 * User authentication interface with Yard Sale design
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
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/auth.types';

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const { login, continueAsGuest, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '', general: '' };
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setErrors({ email: '', password: '', general: '' });
      await login({ email: email.trim(), password });
      // Navigation will be handled by the auth state change
    } catch (error) {
      const apiError = error as ApiError;
      setErrors({
        email: '',
        password: '',
        general: apiError.message || 'Login failed. Please try again.',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-cream"
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="mb-12">
          <Text className="text-5xl font-young-serif tracking-tight text-dark mb-3">
            Swappo
          </Text>
          <Text className="text-xl text-gray-600 font-manrope">Welcome back</Text>
        </View>

        {/* Error Message */}
        {errors.general ? (
          <View className="mb-6 p-4 bg-accent-red/10 rounded-2xl border border-accent-red/20">
            <Text className="text-accent-red font-manrope font-medium">{errors.general}</Text>
          </View>
        ) : null}

        {/* Email Input */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
            Email
          </Text>
          <TextInput
            className={`bg-white border ${errors.email ? 'border-accent-red' : 'border-dark/5'} rounded-2xl px-5 py-4 text-base font-manrope shadow-sm`}
            placeholder="your@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
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

        {/* Password Input */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-manrope">
            Password
          </Text>
          <TextInput
            className={`bg-white border ${errors.password ? 'border-accent-red' : 'border-dark/5'} rounded-2xl px-5 py-4 text-base font-manrope shadow-sm`}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          {errors.password ? (
            <Text className="text-accent-red text-xs mt-2 font-manrope font-medium">
              {errors.password}
            </Text>
          ) : null}
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 shadow-lg ${isLoading ? 'bg-dark/60' : 'bg-dark'}`}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg font-manrope">
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600 font-manrope">Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
          >
            <Text className="text-primary font-manrope font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Mode - Development Only */}
        <TouchableOpacity
          className="mt-4 py-3 border-2 border-gray-300 rounded-2xl"
          onPress={continueAsGuest}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 text-center font-semibold text-base font-manrope">
            Continue as Guest (Dev)
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
