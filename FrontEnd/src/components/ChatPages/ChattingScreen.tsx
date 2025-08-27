import React, { useRef, JSX } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, Spacing, BorderRadius, FontSizes, FontFamilies } from '../../constants/theme';
import { Message as ChatMessage } from '../../types/index';

interface ChatScreenProps {
  Colors: any;
  fadeAnim: Animated.Value;
  slideAnim2: Animated.Value;
  messages: ChatMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  isTyping: boolean;
  onSendMessage: () => void;
  onResetChat: () => void;
  renderMessage: ({ item }: { item: ChatMessage }) => JSX.Element;
  renderTypingIndicator: () => JSX.Element | null;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  Colors,
  fadeAnim,
  slideAnim2,
  messages,
  inputText,
  setInputText,
  isTyping,
  onSendMessage,
  onResetChat,
  renderMessage,
  renderTypingIndicator,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Create safe animated style object
  const animatedStyle = {
    opacity: fadeAnim || 1,
    transform: slideAnim2 ? [{ translateY: slideAnim2 }] : [{ translateY: 0 }]
  };

  return (
    <Animated.View 
      style={[
        styles(Colors).container,
        animatedStyle
      ]}
    >
      <KeyboardAvoidingView
        style={styles(Colors).keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles(Colors).header}>
          <TouchableOpacity style={styles(Colors).backButton} onPress={onResetChat}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles(Colors).headerContent}>
            <View style={styles(Colors).headerInfo}>
              <Text style={[styles(Colors).headerTitle, styles(Colors).welcomeAsk]}>
                Ask
                <Text style={styles(Colors).welcomeJC}>JC</Text>
              </Text>
              <Text style={styles(Colors).headerSubtitle}>
                {isTyping ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles(Colors).messagesList}
          contentContainerStyle={StyleSheet.flatten([
            styles(Colors).messagesContent,
            { flexGrow: 1 },
          ])}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        {/* Input */}
        <View style={styles(Colors).inputContainer}>
          <View style={styles(Colors).inputWrapper}>
            <TextInput
              style={styles(Colors).textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your messages..."
              placeholderTextColor={Colors.gray?.[400] || '#9CA3AF'}
              multiline
              maxLength={500}
              onSubmitEditing={onSendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles(Colors).sendButton,
                inputText.trim() ? styles(Colors).sendButtonActive : styles(Colors).sendButtonInactive
              ])}
              onPress={onSendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? Colors.white : Colors.gray?.[400] || '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing?.md || 12,
    paddingHorizontal: Spacing?.lg || 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Spacing?.md || 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes?.md || 16,
    fontFamily: FontFamilies?.semiBold || 'System',
    color: Colors.text,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: FontSizes?.xs || 12,
    fontFamily: FontFamilies?.regular || 'System',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  welcomeAsk: {
    color: Colors.warning,
  },
  welcomeJC: {
    color: Colors.success,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing?.md || 12,
    paddingVertical: Spacing?.sm || 12,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing?.md || 12,
    paddingVertical: Spacing?.md || 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.gray?.[50] || '#F9FAFB',
    borderRadius: BorderRadius?.xl || 20,
    paddingHorizontal: Spacing?.md || 12,
    paddingVertical: Spacing?.sm || 8,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes?.md || 16,
    fontFamily: FontFamilies?.regular || 'System',
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? (Spacing?.sm || 8) : 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing?.sm || 8,
  },
  sendButtonActive: {
    backgroundColor: Colors.success,
  },
  sendButtonInactive: {
    backgroundColor: Colors.gray?.[200] || '#E5E7EB',
  },
});

export default ChatScreen;