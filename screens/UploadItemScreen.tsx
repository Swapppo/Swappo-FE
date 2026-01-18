/**
 * Upload Item Screen
 * Screen for uploading new items with image picker
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { catalogService } from '../services/catalog.service';
import { API_CONFIG } from '../config/api.config';
import { ScreenHeader } from '../components/ScreenHeader';

export function UploadItemScreen({ navigation, route }: { navigation: any, route: any }) {
  const { user } = useAuth();
  const editingItem = route.params?.item;
  const isEditing = !!editingItem;

  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    description: editingItem?.description || '',
    category: editingItem?.category || '',
  });
  
  // Format existing images to full URLs if needed
  const initialImages = editingItem?.image_urls?.map((url: string) => 
    url.startsWith('http') ? url : `${API_CONFIG.CATALOG_BASE_URL}${url}`
  ) || [];

  const [selectedImages, setSelectedImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to select images');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map((asset: { uri: string }) => asset.uri);
      setSelectedImages(prev => [...prev, ...uris].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to upload items');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!formData.category.trim()) {
      Alert.alert('Error', 'Please enter a category');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please select at least one image');
      return;
    }

    try {
      setUploading(true);

      // Upload new images and identify existing ones
      const finalImageUrls: string[] = [];
      
      for (let i = 0; i < selectedImages.length; i++) {
        const uri = selectedImages[i];
        
        // Check if it's already a remote URL
        if (uri.startsWith('http')) {
           // It's an existing image, just use it (stripping base URL if needed by backend, 
           // but backend usually stores relative path. 
           // Let's assume createItem/updateItem handles absolute URLs or we strip it)
           
           // Actually, the backend stores what we send. 
           // If we send absolute, it stores absolute. If we send relative, relative.
           // To be inconsistent usage, let's keep it simple: 
           // If it's already an absolute URL from our bucket, we can try to make it relative or just keep it.
           // However, `uploadImage` returns a relative path (usually).
           // Let's just pass the URL as is.
           finalImageUrls.push(uri);
        } else {
          // It's a local file, upload it
          const fileName = `item_${Date.now()}_${i}.jpg`;
          try {
            const imageUrl = await catalogService.uploadImage(uri, fileName);
            // Convert relative URL to absolute URL for frontend consistency if needed, 
            // but for `createItem`, we send the URL returned by uploadImage. 
            // Wait, `createItem` implementation in `UploadItemScreen` before wrapped it with absolute URL.
            // Let's stick to what worked:
            const absoluteUrl = imageUrl.startsWith('http') 
              ? imageUrl 
              : `${API_CONFIG.CATALOG_BASE_URL}${imageUrl}`;
            finalImageUrls.push(absoluteUrl);
          } catch (err) {
            console.error('Failed to upload image:', err);
            throw new Error(`Failed to upload image ${i + 1}`);
          }
        }
      }

      if (isEditing) {
        // Update existing item
        await catalogService.updateItem(editingItem.id, user.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category.trim(),
          image_urls: finalImageUrls,
        });
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        // Create new item
        await catalogService.createItem({
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category.trim(),
          image_urls: finalImageUrls,
          location_lat: 0, 
          location_lon: 0,
          owner_id: user.id,
        });
        Alert.alert('Success', 'Item uploaded successfully!');
      }

      navigation.goBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'upload'} item`;
      Alert.alert('Error', message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-cream"
    >
      <ScreenHeader title={isEditing ? "Edit Item" : "Upload New Item"} showBack={true} />
      <ScrollView className="flex-1">
        <View className="p-6">

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2 font-manrope">Item Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="Enter item name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={!uploading}
            />
          </View>

          {/* Description Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2 font-manrope">Description</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base h-24"
              placeholder="Describe your item"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!uploading}
            />
          </View>

          {/* Category Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2 font-manrope">Category</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="e.g., Electronics, Books, Clothing"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              editable={!uploading}
            />
          </View>

          {/* Image Picker */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2 font-manrope">
              Images (Max 5)
            </Text>
            
            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <ScrollView horizontal className="mb-3" showsHorizontalScrollIndicator={false}>
                {selectedImages.map((uri, index) => (
                  <View key={index} className="mr-2 relative">
                    <Image
                      source={{ uri }}
                      className="w-24 h-24 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                      disabled={uploading}
                    >
                      <Text className="text-white font-bold text-xs">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Add Image Button */}
            {selectedImages.length < 5 && (
              <TouchableOpacity
                onPress={pickImage}
                className="border-2 border-dashed border-gray-300 rounded-lg py-8 items-center"
                disabled={uploading}
              >
                <Text className="text-4xl text-gray-400 mb-2">📷</Text>
                <Text className="text-gray-600 font-medium font-manrope">Tap to select images</Text>
                <Text className="text-gray-400 text-sm mt-1 font-manrope">
                  {selectedImages.length}/5 selected
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className={`rounded-lg py-4 ${uploading ? 'bg-blue-400' : 'bg-blue-600'}`}
            disabled={uploading}
          >
            {uploading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" />
                <Text className="text-white font-manrope font-semibold ml-2">
                  {isEditing ? 'Updating...' : 'Uploading...'}
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-manrope font-semibold text-base">
                {isEditing ? 'Update Item' : 'Upload Item'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-3 py-4"
            disabled={uploading}
          >
            <Text className="text-gray-600 text-center font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
