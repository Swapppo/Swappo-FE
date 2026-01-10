import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ItemResponse } from '../types/catalog.types';
import { ENV } from '../config/env.config';
import NotificationBadge from '../components/NotificationBadge';
import NotificationsPopup from '@/components/NotificationsPopup';

type RootStackParamList = {
    ItemInfo: { item: ItemResponse };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ItemInfo'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ItemInfoScreen = ({ route, navigation }: Props) => {
    const { item } = route.params;
    const [showNotifications, setShowNotifications] = useState(false);
    const imageUrl = item.image_urls[0]
        ? item.image_urls[0].startsWith('http')
            ? item.image_urls[0]
            : `${ENV.CATALOG_API_BASE_URL}${item.image_urls[0]}`
        : 'https://via.placeholder.com/400x300?text=No+Image';

    const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.40;

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
            <View className="flex-row justify-between items-center bg-cream">
                <Text className="text-2xl font-manrope font-bold tracking-tight text-dark">
                    Item info
                </Text>
                <NotificationsPopup
                    visible={showNotifications}
                    onClose={() => setShowNotifications(false)}
                />
                <NotificationBadge onPress={() => setShowNotifications(true)} />
            </View>

            {/* Edit Listing Label */}
            <Text className="text-xs text-gray-400 mb-2 tracking-widest font-manrope">
                EDIT LISTING
            </Text>

            {/* Title */}
            <Text className="font-manrope text-2xl text-[#1B1A17] font-bold mb-6">
                What are you trading?
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
                {/* <TouchableOpacity
                    className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow"
                    onPress={() => alert('Edit Image pressed')}
                /> */}
            </View>

            {/* TITLE Label */}
            <Text className="text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wide font-manrope">
                TITLE
            </Text>
            <Text className="text-lg text-[#1B1A17] font-manrope mb-6">{item.name}</Text>

            {/* DESCRIPTION Label */}
            <Text className="text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wide font-manrope">
                DESCRIPTION
            </Text>
            <Text className="text-base text-[#1B1A17] font-manrope leading-relaxed">
                {item.description || 'No description provided.'}
            </Text>

        </ScrollView>
    );
};
