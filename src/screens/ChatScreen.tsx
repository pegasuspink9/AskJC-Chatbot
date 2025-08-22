import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { globalStyles } from '../styles/globalStyles';
import { getColors, Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import { Chat, RootStackParamList } from '../types';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { isDark } = useTheme();
  const Colors = getColors(isDark);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'General Questions',
      lastMessage: 'How can I help you with React Native?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), 
      unreadCount: 2,
    },
    {
      id: '2',
      title: 'Project Help',
      lastMessage: 'Let me help you with your coding project.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      unreadCount: 0,
    },
    {
      id: '3',
      title: 'Learning Session',
      lastMessage: 'What would you like to learn today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      unreadCount: 1,
    },
  ]);

  const formatTimestamp = (timestampString: string) => {
    const timestamp = new Date(timestampString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffInDays}d ago`;
    }
  };

  const handleChatPress = (chat: Chat) => {
    // Navigate to chatting screen
    navigation.navigate('Chatting');
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `New Chat ${chats.length + 1}`,
      lastMessage: 'How can I assist you today?',
      timestamp: new Date().toISOString(),
      unreadCount: 0,
    };
    setChats([newChat, ...chats]);
  };

  const handleDeleteChat = (chatId: string) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setChats(chats.filter(chat => chat.id !== chatId));
          },
        },
      ]
    );
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles(Colors).chatItem}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles(Colors).chatAvatar}>
        <Ionicons name="chatbubble" size={20} color={Colors.primary} />
      </View>
      
      <View style={styles(Colors).chatContent}>
        <View style={styles(Colors).chatHeader}>
          <Text style={styles(Colors).chatTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles(Colors).chatTimestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles(Colors).chatFooter}>
          <Text style={styles(Colors).lastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles(Colors).unreadBadge}>
              <Text style={styles(Colors).unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles(Colors).deleteButton}
        onPress={() => handleDeleteChat(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.gray[400]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles(Colors).emptyState}>
      <View style={styles(Colors).emptyIcon}>
        <Ionicons name="chatbubbles-outline" size={64} color={Colors.gray[300]} />
      </View>
      <Text style={styles(Colors).emptyTitle}>No Chats Yet</Text>
      <Text style={styles(Colors).emptySubtitle}>
        Start a conversation by tapping the + button below
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[globalStyles.safeArea, { backgroundColor: Colors.background }]}>
      <View style={styles(Colors).container}>
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={[
            styles(Colors).listContainer,
            chats.length === 0 && styles(Colors).emptyContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles(Colors).separator} />}
          ListEmptyComponent={renderEmptyState}
        />
        
        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles(Colors).fab}
          onPress={handleNewChat}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Convert styles to a function that accepts Colors
const styles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    padding: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  chatTitle: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  chatTimestamp: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginRight: Spacing.sm,
    fontFamily: 'Poppins-Regular',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  unreadText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'Poppins-SemiBold',
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ChatScreen;