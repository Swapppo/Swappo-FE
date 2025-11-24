/**
 * NotificationBadge Component
 * Displays unread notification count as a badge
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import notificationService from '../services/notification.service';

interface NotificationBadgeProps {
  onPress?: () => void;
  refreshInterval?: number; // milliseconds
}

export default function NotificationBadge({ 
  onPress, 
  refreshInterval = 30000 // Default: 30 seconds
}: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { user } = useAuth();

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Set up polling
    const interval = setInterval(fetchUnreadCount, refreshInterval);

    return () => clearInterval(interval);
  }, [user?.id, refreshInterval]);

  if (!user || unreadCount === 0) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔔</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
