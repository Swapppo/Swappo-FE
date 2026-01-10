import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { SwipeScreen } from './screens/SwipeScreen';
import { TradeOffersScreen } from './screens/TradeOffersScreen';
import { MatchesScreen } from './screens/MatchesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ActivityIndicator, View } from 'react-native';
import { UploadItemScreen } from './screens/UploadItemScreen';
import { ChatScreen } from './screens/ChatScreen';

import './global.css';
import { BottomNavBar } from './components/BottomNavBar';
import { ItemInfoScreen } from './screens/ItemInfoScreen';

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator({ currentRoute }: { currentRoute: string }) {
  return (
    <View className="flex-1 relative pb-20">
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Swipe"
          component={SwipeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Explore"
          component={ExploreScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TradeOffers"
          component={TradeOffersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Matches"
          component={MatchesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UploadItem"
          component={UploadItemScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ItemInfo"
          component={ItemInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <BottomNavBar currentRoute={currentRoute} />
    </View>
  );
}

function Navigation({ currentRoute }: { currentRoute: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator currentRoute={currentRoute} /> : <AuthNavigator />;
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('Home');

  return (
    <AuthProvider>
      <NavigationContainer
        onStateChange={(state) => {
          if (state?.routes[state.index]) {
            setCurrentRoute(state.routes[state.index].name);
          }
        }}
      >
        <Navigation currentRoute={currentRoute} />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
