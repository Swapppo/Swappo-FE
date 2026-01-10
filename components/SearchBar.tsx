import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

type SearchBarProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search items...',
  onClear,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-white mx-4 mt-4 px-4 py-3 rounded-xl border border-gray-200">
      {/* Search Input */}
      <TextInput
        className="flex-1 text-base text-gray-900"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        clearButtonMode="never"
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          className="ml-3"
          hitSlop={10}
        >
          <Text className="text-gray-400 text-lg">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
