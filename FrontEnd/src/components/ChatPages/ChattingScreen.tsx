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
  Dimensions,
  SafeAreaView,
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
  const [screenData, setScreenData] = useState(() => Dimensions.get('window'));

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    
    return () => subscription?.remove();
  }, []);

  // Calculate responsive dimensions
  const getDimensions = useCallback(() => {
    const { width, height } = screenData;
    const isTablet = width >= 768;
    const isSmallScreen = width < 375;
    const isLandscape = width > height;
    
    // Calculate safe areas and margins
    const horizontalMargin = isTablet ? Math.max(20, width * 0.02) : 
                           isSmallScreen ? 8 : (Spacing?.md || 12);
    
    const inputContainerHeight = isTablet ? 80 : 
                               isSmallScreen ? 60 : 70;
    
    const maxInputHeight = isTablet ? 140 : 
                          isSmallScreen ? 80 : 100;
    
    // Bottom safe area
    const bottomSafeArea = Platform.select({
      ios: isLandscape ? 20 : 34,
      android: 16,
      web: 16,
    });
    
    return {
      horizontalMargin,
      inputContainerHeight,
      maxInputHeight,
      bottomSafeArea,
      isTablet,
      isSmallScreen,
      screenWidth: width,
      screenHeight: height,
    };
  }, [screenData]);

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
  const dimensions = getDimensions();

  const handleKeyPress = useCallback((e: any) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter') {
      if (!e.nativeEvent.shiftKey && isInputValid) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  }, [handleSendMessage, isInputValid]);

  return (
    <SafeAreaView style={styles(Colors, dimensions).safeArea}>
      <Animated.View style={[styles(Colors, dimensions).container, animatedStyle]}>
        <KeyboardAvoidingView
          style={styles(Colors, dimensions).keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          {/* Header */}
          <View style={styles(Colors, dimensions).header}>
            <TouchableOpacity style={styles(Colors, dimensions).backButton} onPress={onResetChat}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles(Colors, dimensions).headerContent}>
              <View style={styles(Colors, dimensions).headerInfo}>
                <Text style={[styles(Colors, dimensions).headerTitle, styles(Colors, dimensions).welcomeAsk]}>
                  Ask<Text style={styles(Colors, dimensions).welcomeJC}>JC</Text>
                </Text>
                <Text style={styles(Colors, dimensions).headerSubtitle}>
                  {isTyping ? 'Typing...' : 'Online'}
                </Text>
              </View>
            </View>
          </View>

          {/* Messages Container */}
          <View style={styles(Colors, dimensions).messagesContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={memoizedRenderMessage}
              keyExtractor={keyExtractor}
              style={styles(Colors, dimensions).messagesList}
              contentContainerStyle={styles(Colors, dimensions).messagesContent}
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
          </View>

          {/* Input Container - Always visible at bottom */}
          <View style={styles(Colors, dimensions).inputContainer}>
            <View style={styles(Colors, dimensions).inputWrapper}>
              <TextInput
                style={styles(Colors, dimensions).textInput}
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
                  styles(Colors, dimensions).sendButton,
                  isInputValid 
                    ? styles(Colors, dimensions).sendButtonActive 
                    : styles(Colors, dimensions).sendButtonInactive
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
    </SafeAreaView>
  );
};

const styles = (Colors: any, dimensions: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background || '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
    position: 'relative',
  },
  header: {
    backgroundColor: Colors.surface || Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: dimensions.horizontalMargin,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    zIndex: 10,
  },
  backButton: {
    marginRight: dimensions.horizontalMargin,
    padding: 8,
    borderRadius: 8,
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
    color: Colors.text || '#000000',
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: FontSizes?.xs || 12,
    fontFamily: FontFamilies?.regular || 'System',
    color: Colors.textSecondary || '#6B7280',
    marginTop: 2,
  },
  welcomeAsk: {
    color: Colors.warning || '#F59E0B',
  },
  welcomeJC: {
    color: Colors.success || '#10B981',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background || '#FFFFFF',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: dimensions.horizontalMargin,
    paddingVertical: 8,
    paddingBottom: dimensions.inputContainerHeight + dimensions.bottomSafeArea + 20,
    flexGrow: 1,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface || Colors.background || '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSuggestion || Colors.border || '#E5E7EB',
    paddingHorizontal: dimensions.horizontalMargin,
    paddingTop: 12,
    paddingBottom: Math.max(dimensions.bottomSafeArea, 12),
    minHeight: dimensions.inputContainerHeight,
    maxHeight: dimensions.maxInputHeight,
    zIndex: 100,
    // Enhanced shadows for better visibility
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    }),
    ...(Platform.OS === 'android' && {
      elevation: 16,
    }),
    ...(Platform.OS === 'web' && {
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
    }),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.gray?.[50] || '#F9FAFB',
    borderRadius: BorderRadius?.xl || 20,
    paddingHorizontal: dimensions.isSmallScreen ? 12 : 16,
    paddingVertical: dimensions.isSmallScreen ? 8 : 12,
    minHeight: dimensions.isSmallScreen ? 44 : 52,
    maxHeight: dimensions.maxInputHeight - 40,
    borderWidth: 1.5,
    borderColor: Colors.gray?.[200] || '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: dimensions.isSmallScreen ? 14 : (FontSizes?.md || 16),
    fontFamily: FontFamilies?.regular || 'System',
    color: Colors.text || '#000000',
    minHeight: dimensions.isSmallScreen ? 32 : 36,
    maxHeight: dimensions.maxInputHeight - 60,
    paddingVertical: Platform.select({
      ios: 8,
      android: 6,
      web: 8,
    }),
    paddingHorizontal: 0,
    textAlignVertical: 'center',
    lineHeight: dimensions.isSmallScreen ? 18 : Math.round((FontSizes?.md || 16) * 1.25),
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
      resize: 'none' as any,
      overflow: 'auto' as any,
    }),
  },
  sendButton: {
    width: dimensions.isSmallScreen ? 32 : 36,
    height: dimensions.isSmallScreen ? 32 : 36,
    borderRadius: dimensions.isSmallScreen ? 16 : 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: dimensions.isSmallScreen ? 6 : 8,
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: Colors.success || '#10B981',
  },
  sendButtonInactive: {
    backgroundColor: Colors.gray?.[200] || '#E5E7EB',
  },
});

export default ChatScreen;