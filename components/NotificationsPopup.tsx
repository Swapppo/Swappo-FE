/**
 * NotificationsPopup Component
 * Modal popup for displaying notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import notificationService from '../services/notification.service';
import { NotificationResponse, NotificationType } from '../types/notification.types';

interface NotificationsPopupProps {
  visible: boolean;
  onClose: () => void;
  onNotificationCountChange?: (count: number) => void;
}

export default function NotificationsPopup({ 
  visible, 
  onClose,
  onNotificationCountChange 
}: NotificationsPopupProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(
        user.id,
        filter === 'unread',
        20,
        0
      );
      setNotifications(data);
      
      // Update unread count
      const unreadCount = data.filter(n => !n.is_read).length;
      onNotificationCountChange?.(unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter, onNotificationCountChange]);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible, loadNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user?.id) return;

    try {
      await notificationService.markSingleAsRead(user.id, notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id);

    if (unreadIds.length === 0) {
      Alert.alert('Info', 'No unread notifications');
      return;
    }

    try {
      await notificationService.markAsRead(user.id, unreadIds);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    if (!user?.id) return;

    try {
      await notificationService.deleteNotification(user.id, notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.TRADE_OFFER_RECEIVED:
        return '🤝';
      case NotificationType.TRADE_OFFER_ACCEPTED:
        return '✅';
      case NotificationType.TRADE_OFFER_REJECTED:
        return '❌';
      case NotificationType.TRADE_OFFER_CANCELLED:
        return '🚫';
      case NotificationType.TRADE_COMPLETED:
        return '🎉';
      case NotificationType.NEW_MESSAGE:
        return '💬';
      case NotificationType.ITEM_LIKED:
        return '❤️';
      case NotificationType.SYSTEM:
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = (notification: NotificationResponse) => {
    return (
      <View
        key={notification.id}
        style={[
          styles.notificationCard,
          !notification.is_read && styles.unreadCard,
        ]}
      >
        <View style={styles.notificationHeader}>
          <Text style={styles.icon}>{getNotificationIcon(notification.type)}</Text>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(notification.created_at)}</Text>
          </View>
          {!notification.is_read && (
            <View style={styles.unreadDot} />
          )}
        </View>

        <Text style={styles.body}>{notification.body}</Text>

        <View style={styles.actions}>
          {!notification.is_read && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMarkAsRead(notification.id)}
            >
              <Text style={styles.actionButtonText}>✓</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNotification(notification.id)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.popup} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
              onPress={() => setFilter('unread')}
            >
              <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
                Unread
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <ScrollView style={styles.scrollView}>
            {loading ? (
              <View style={styles.centered}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyText}>
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </Text>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {notifications.map(renderNotification)}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  popup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 380,
    maxHeight: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  markAllButton: {
    marginLeft: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 480,
  },
  notificationsList: {
    padding: 12,
  },
  notificationCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  unreadCard: {
    backgroundColor: '#E8F4FF',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 11,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  body: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
