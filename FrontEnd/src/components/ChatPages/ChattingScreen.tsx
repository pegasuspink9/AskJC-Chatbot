import React, { useRef, useCallback, useState, JSX } from 'react';
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
import { Spacing, BorderRadius, FontSizes, FontFamilies } from '../../constants/theme';
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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Enhanced send message handler
  const handleSendMessage = useCallback(() => {
    onSendMessage();
    setShouldAutoScroll(true);
    scrollToBottom();
  }, [onSendMessage, scrollToBottom]);

  // Memoized render functions
  const memoizedRenderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => renderMessage({ item }),
    [renderMessage]
  );

  const memoizedRenderTypingIndicator = useCallback(
    () => renderTypingIndicator(),
    [renderTypingIndicator]
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  // Scroll event handlers
  const onContentSizeChange = useCallback(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [shouldAutoScroll, scrollToBottom]);

  const onScrollBeginDrag = useCallback(() => {
    setShouldAutoScroll(false);
  }, []);

  const onScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
                           contentSize.height - paddingToBottom;
    
    if (isCloseToBottom) {
      setShouldAutoScroll(true);
    }
  }, []);

  // Animation styles
  const animatedStyle = {
    opacity: fadeAnim || 1,
    transform: slideAnim2 ? [{ translateY: slideAnim2 }] : [{ translateY: 0 }]
  };

  const isInputValid = inputText.trim();

  const handleKeyPress = useCallback((e: any) => {
  if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter') {
    if (!e.nativeEvent.shiftKey && isInputValid) {
      e.preventDefault();
      handleSendMessage();
    }
  }
}, [handleSendMessage, isInputValid]);

  return (
    <Animated.View style={[styles(Colors).container, animatedStyle]}>
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
                Ask<Text style={styles(Colors).welcomeJC}>JC</Text>
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
          renderItem={memoizedRenderMessage}
          keyExtractor={keyExtractor}
          style={styles(Colors).messagesList}
          contentContainerStyle={[
            styles(Colors).messagesContent,
            { flexGrow: 1 }
          ]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={memoizedRenderTypingIndicator}
          onContentSizeChange={onContentSizeChange}
          onScrollBeginDrag={onScrollBeginDrag}
          onScroll={onScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={undefined}
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
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
              onKeyPress={handleKeyPress}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
            />
            <TouchableOpacity
              style={[
                styles(Colors).sendButton,
                isInputValid 
                  ? styles(Colors).sendButtonActive 
                  : styles(Colors).sendButtonInactive
              ]}
              onPress={handleSendMessage}
              disabled={!isInputValid}
            >
              <Ionicons
                name="send"
                size={20}
                color={isInputValid ? Colors.white : Colors.gray?.[400] || '#9CA3AF'}
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
    paddingVertical: 10,
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
    paddingHorizontal: Spacing?.sm,
    paddingVertical: Spacing?.sm,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSuggestion,
    minHeight: Platform.OS === 'web' ? 70 : undefined,
    paddingBottom: Platform.OS === 'web' ? (Spacing?.md || 8) : (Spacing?.md || 12),
    ...(Platform.OS === 'web' && {
      position: 'sticky' as any,
      bottom: 0,
      zIndex: 1,
      minHeight: 70,
      maxHeight: 140,
    }),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray?.[50] || '#F9FAFB',
    borderRadius: BorderRadius?.xl || 20,
    paddingHorizontal: Spacing?.md || 12,
    paddingVertical: Spacing?.sm || 8,
    maxHeight: 120,
    minHeight: 50,
    flex: Platform.OS === 'web' ? 0 : undefined,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes?.md || 16,
    fontFamily: FontFamilies?.regular || 'System',
    color: Colors.text,
    minHeight: 50,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? (Spacing?.sm || 8) : 4,
    paddingHorizontal: 0,
    marginTop: 10,
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