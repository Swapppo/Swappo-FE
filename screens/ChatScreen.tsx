/**
 * Chat Screen
 * Individual chat conversation for a trade offer
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chat.service';
import { MessageResponse } from '../types/chat.types';

interface ChatScreenProps {
  readonly route: {
    readonly params: {
      readonly chatRoomId: number;
      readonly tradeOfferId: number;
      readonly otherUserId: string;
    };
  };
}

export function ChatScreen({ route }: ChatScreenProps) {
  const { user } = useAuth();
  const { chatRoomId } = route.params;
  
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => loadMessages(), 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]);

  const loadMessages = async () => {
    try {
      const msgs = await chatService.listMessages({
        chat_room_id: chatRoomId,
        limit: 100,
      });
      setMessages(msgs);
      
      // Mark messages as read
      if (user?.id) {
        await chatService.markMessagesAsRead(chatRoomId, user.id);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !user?.id || sending) return;

    try {
      setSending(true);
      const message = await chatService.sendMessage({
        chat_room_id: chatRoomId,
        sender_id: user.id,
        content: messageText.trim(),
      });
      
      setMessages([...messages, message]);
      setMessageText('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMessages = () => {
    let lastDate = '';
    
    return messages.map((message, index) => {
      const isOwnMessage = message.sender_id === user?.id;
      const messageDate = formatDate(message.created_at);
      const showDateHeader = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <View key={message.id}>
          {showDateHeader && (
            <View className="items-center my-2">
              <Text className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {messageDate}
              </Text>
            </View>
          )}
          
          <View
            className={`mb-2 ${isOwnMessage ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                isOwnMessage
                  ? 'bg-blue-500 rounded-tr-none'
                  : 'bg-gray-200 rounded-tl-none'
              }`}
            >
              <Text
                className={`text-base ${
                  isOwnMessage ? 'text-white' : 'text-gray-900'
                }`}
              >
                {message.content}
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {formatTime(message.created_at)}
                {isOwnMessage && message.status === 'read' && ' ✓✓'}
              </Text>
            </View>
          </View>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <ScreenHeader title="Chat" showBack={true} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScreenHeader title="Chat" showBack={true} />
      
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 pt-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400 text-base">No messages yet</Text>
            <Text className="text-gray-400 text-sm mt-2">
              Start the conversation!
            </Text>
          </View>
        ) : (
          renderMessages()
        )}
      </ScrollView>

      {/* Message Input */}
      <View className="border-t border-gray-200 px-4 py-3 bg-white">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base"
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={5000}
            editable={!sending}
          />
          <TouchableOpacity
            className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${
              messageText.trim() && !sending ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onPress={sendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-xl">➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
