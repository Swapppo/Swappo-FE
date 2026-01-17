import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ItemResponse } from '../types/catalog.types';
import { API_CONFIG } from '../config/api.config';
import NotificationBadge from '../components/NotificationBadge';
import NotificationsPopup from '@/components/NotificationsPopup';
import { useAuth } from '../hooks/useAuth';
import { catalogService } from '../services/catalog.service';

type RootStackParamList = {
    ItemInfo: { item: ItemResponse };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ItemInfo'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ItemInfoScreen = ({ route, navigation }: Props) => {
    const { item } = route.params;
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const imageUrl = item.image_urls[0]
        ? item.image_urls[0].startsWith('http')
            ? item.image_urls[0]
            : `${API_CONFIG.CATALOG_BASE_URL}${item.image_urls[0]}`
        : 'https://via.placeholder.com/400x300?text=No+Image';

    const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.40;

    const isOwner = user?.id === item.owner_id;
    console.log('ItemInfo Check:', { 
        userId: user?.id, 
        itemOwnerId: item.owner_id, 
        isOwner,
        itemId: item.id
    });

    const handleDelete = async () => {
        console.log('Delete button pressed');
        if (!user?.id) {
            console.log('No user ID found');
            return;
        }

        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to delete this item? This action cannot be undone.");
            if (confirmed) {
                try {
                    setIsDeleting(true);
                    await catalogService.deleteItem(item.id, user.id);
                    // On web, we might want to use window.alert or a toast, but this is fine
                    alert("Item deleted successfully"); 
                    navigation.goBack();
                } catch (error) {
                    console.error("Delete error:", error);
                    alert("Failed to delete item");
                } finally {
                    setIsDeleting(false);
                }
            }
        } else {
            Alert.alert(
                "Delete Item",
                "Are you sure you want to delete this item? This action cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Delete", 
                        style: "destructive",
                        onPress: async () => {
                            try {
                                setIsDeleting(true);
                                await catalogService.deleteItem(item.id, user.id);
                                Alert.alert("Success", "Item deleted successfully");
                                navigation.goBack();
                            } catch (error) {
                                console.error("Delete error:", error);
                                Alert.alert("Error", "Failed to delete item");
                            } finally {
                                setIsDeleting(false);
                            }
                        }
                    }
                ]
            );
        }
    };



    return (
        <ScrollView
            className="flex-1 bg-cream"
            contentContainerStyle={{
                paddingHorizontal: SCREEN_WIDTH * 0.06,
                paddingTop: 50,
                paddingBottom: 40,
            }}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center bg-cream mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Text className="text-dark font-manrope font-bold text-lg">Back</Text>
                </TouchableOpacity>
                <Text className="text-xl font-manrope font-bold tracking-tight text-dark">
                    Item Info
                </Text>
                <View className="flex-row items-center gap-2">
                    <NotificationsPopup
                        visible={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />
                    <NotificationBadge onPress={() => setShowNotifications(true)} />
                </View>
            </View>

            {/* Title */}
            <Text className="font-manrope text-2xl text-[#1B1A17] font-bold mb-6">
                {item.name}
            </Text>

            {/* Image with edit icon */}
            <View
                className="relative mb-6 rounded-3xl overflow-hidden shadow-md border border-gray-200"
                style={{ height: IMAGE_HEIGHT }}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            </View>

            {/* CATEGORY Label */}
            <Text className="text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wide font-manrope">
                CATEGORY
            </Text>
            <Text className="text-lg text-[#1B1A17] font-manrope mb-6">{item.category}</Text>

            {/* DESCRIPTION Label */}
            <Text className="text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wide font-manrope">
                DESCRIPTION
            </Text>
            <Text className="text-base text-[#1B1A17] font-manrope leading-relaxed mb-8">
                {item.description || 'No description provided.'}
            </Text>

            {/* Delete Button for Owner */}
            {isOwner && (
                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500 py-4 rounded-xl items-center justify-center shadow-sm mt-4"
                >
                    {isDeleting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-manrope font-bold text-base">
                            Delete Item
                        </Text>
                    )}
                </TouchableOpacity>
            )}

        </ScrollView>
    );
};
