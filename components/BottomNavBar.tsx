import React from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Home, Search, Hand, Handshake, Heart } from 'lucide-react';

interface NavItem {
  name: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', icon: Home },
  { name: 'Explore', icon: Search },
  { name: 'Swipe', icon: Hand },
  { name: 'TradeOffers', icon: Handshake },
  { name: 'Matches', icon: Heart },
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
  const paddingVertical = width < 350 ? 8 : 12;
  const paddingHorizontal = width < 350 ? 12 : 20;

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
          const IconComponent = item.icon;
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
              <IconComponent
                size={iconSize}
                color={active ? 'white' : '#6B7280'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
