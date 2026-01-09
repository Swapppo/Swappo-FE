import React from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface NavItem {
  name: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', icon: '🏠', label: 'Home' },
  { name: 'Explore', icon: '🔍', label: 'Explore' },
  { name: 'Swipe', icon: '👆', label: 'Swipe' },
  { name: 'TradeOffers', icon: '🤝', label: 'Offers' },
  { name: 'Matches', icon: '❤️', label: 'Matches' },
  { name: 'MyItems', icon: '📦', label: 'My Items' },
];

export const BottomNavBar = ({ currentRoute }: { currentRoute?: string }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const getCurrentRouteName = () => {
    if (currentRoute) return currentRoute;
    try {
      const state = navigation.getState?.();
      if (!state?.routes) return null;
      return state.routes[state.index]?.name;
    } catch {
      return null;
    }
  };

  const isActive = (screenName: string) => getCurrentRouteName() === screenName;

  const handleNavPress = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  // Adjust sizes based on screen width
  const iconSize = width < 350 ? 20 : width < 500 ? 24 : 28;
  const paddingVertical = width < 350 ? 6 : 10;
  const paddingHorizontal = width < 350 ? 8 : 16;
  const fontSize = width < 350 ? 10 : 12;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 4,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginHorizontal: 8,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.name);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleNavPress(item.name)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical,
                paddingHorizontal,
                borderRadius: 24,
                backgroundColor: active ? 'black' : 'transparent',
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: iconSize }}>{item.icon}</Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize,
                  fontWeight: 'bold',
                  color: active ? 'white' : '#6B7280',
                  opacity: active ? 1 : 0.6,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
