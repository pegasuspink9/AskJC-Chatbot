import React, { useRef, useCallback, useState, JSX, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, FontSizes, FontFamilies } from '../../constants/theme';
import { Message as ChatMessage } from '../../types/index';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const scrollPositionRef = useRef(0);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  //  FIX: Track previous message count to detect new messages
  const prevMessageCountRef = useRef(messages.length);
  const isNewMessageRef = useRef(false);

  const insets = useSafeAreaInsets();

  //  FIX: Detect when new messages are added
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      isNewMessageRef.current = true;
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

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
    isUserScrollingRef.current = false;
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

  //  FIX: Only auto-scroll if user is at bottom AND it's a new message
  const onContentSizeChange = useCallback((width: number, height: number) => {
    contentHeightRef.current = height;
    
    // Only auto-scroll if:
    // 1. User is not manually scrolling
    // 2. User is near bottom
    // 3. It's a new message being added
    if (!isUserScrollingRef.current && shouldAutoScroll && isNewMessageRef.current) {
      const isAtBottom = 
        scrollPositionRef.current + layoutHeightRef.current >= 
        contentHeightRef.current - 50; // 50px threshold
      
      if (isAtBottom) {
        scrollToBottom();
      }
      isNewMessageRef.current = false;
    }
  }, [shouldAutoScroll, scrollToBottom]);

  //  FIX: Mark user as scrolling when they touch the list
  const onScrollBeginDrag = useCallback(() => {
    isUserScrollingRef.current = true;
    setShouldAutoScroll(false);
    
    // Clear any pending timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  //  FIX: Improved scroll detection
  const onScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    scrollPositionRef.current = contentOffset.y;
    layoutHeightRef.current = layoutMeasurement.height;
    contentHeightRef.current = contentSize.height;
    
    const paddingToBottom = 100; // Increased threshold
    const isCloseToBottom = 
      layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !isUserScrollingRef.current) {
      setShouldAutoScroll(true);
    }
  }, []);

  //  FIX: Reset scroll state after user stops scrolling
  const onScrollEndDrag = useCallback(() => {
    // Wait a bit before allowing auto-scroll again
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 500); // Half second delay
  }, []);

  //  FIX: Also handle momentum scroll end
  const onMomentumScrollEnd = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    const paddingToBottom = 100;
    const isCloseToBottom = 
      layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    if (isCloseToBottom) {
      setShouldAutoScroll(true);
      isUserScrollingRef.current = false;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
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
  <View style={{ flex: 1, backgroundColor: Colors.background }}>
    <Animated.View style={[styles(Colors).container, animatedStyle]}>
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

      {/* Messages - Now has paddingBottom to account for input */}
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
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={onScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={100}
        initialNumToRender={15}
        windowSize={21}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />

      {/* Input Container - Now absolutely positioned at bottom */}
      <View style={[
        styles(Colors).inputContainer,
        { paddingBottom: Math.max(insets.bottom, 12) } 
      ]}>
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
    </Animated.View>
  </View>
);
};

const styles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    height: '100%', //  Ensure full height
    maxHeight: '100%', //  Don't exceed viewport
    overflow: 'hidden', //  Prevent overflow
    ...(Platform.OS === 'web' && {
      display: 'flex' as any,
      flexDirection: 'column' as any,
    }),
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
    flexShrink: 0, //  Prevent header from shrinking
    ...(Platform.OS === 'web' && {
      position: 'sticky' as any,
      top: 0,
      zIndex: 10,
      backgroundColor: Colors.surface,
    }),
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
    ...(Platform.OS === 'web' && {
      overflow: 'auto' as any, //  Enable scrolling on web
      height: '100%',
    }),
  },
  messagesContent: {
    paddingVertical: Spacing?.sm,
    paddingHorizontal: Spacing?.sm,
    paddingBottom: Platform.select({
      web: 100, //  Extra padding for web to account for input
      ios: 90,
      android: 90,
      default: 90,
    }),
  },
  inputContainer: {
    position: 'absolute', 
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing?.sm || 16,
    paddingTop: Spacing?.md || 12,
    paddingBottom: Platform.select({
      ios: 20,
      android: 12,
      web: 16, //  Consistent web padding
      default: 12,
    }),
    flexShrink: 0, //  Prevent input from shrinking
    zIndex: 20, //  Ensure input stays on top
    ...(Platform.OS === 'web' && {
      maxHeight: 120, //  Limit input container height on web
    }),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background || '#000000',
    borderRadius: 24, 
    paddingHorizontal: Spacing?.sm || 12,
    paddingVertical: Spacing?.sm || 8,
    borderWidth: 1,
    borderColor: Colors.usermessage,
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes?.md || 16,
    fontFamily: FontFamilies?.regular || 'System',
    color: Colors.text,
    maxHeight: Platform.select({
      web: 80, //  Limit max height on web
      ios: 100,
      android: 100,
      default: 100,
    }),
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlignVertical: 'center',
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
      resize: 'none' as any,
      overflow: 'auto' as any, //  Allow scroll in text input if needed
    }),
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing?.sm || 8,
    flexShrink: 0,
  },
  sendButtonActive: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonInactive: {
    backgroundColor: Colors.gray?.[200] || '#E5E7EB',
  },
});

export default ChatScreen;