import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, Spacing, BorderRadius, FontSizes, FontFamilies } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../constants/ThemeContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChattingScreen: React.FC = () => {
  const { isDark } = useTheme();
  const Colors = getColors(isDark);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m JC, your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Animated values for typing dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  // Typing animation (same as before)
  useEffect(() => {
    if (isTyping) {
      const animateDots = () => {
        const createAnimation = (dot: Animated.Value, delay: number) => {
          return Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]);
        };

        Animated.loop(
          Animated.parallel([
            createAnimation(dot1Opacity, 0),
            createAnimation(dot2Opacity, 200),
            createAnimation(dot3Opacity, 400),
          ])
        ).start();
      };

      animateDots();
    } else {
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);
    }
  }, [isTyping, dot1Opacity, dot2Opacity, dot3Opacity]);

  // Your existing functions remain the same...
  const getAutoResponse = (userMessage: string): string => {
    // Same implementation as before
    const lowerMessage = userMessage.toLowerCase().trim();
    
    if (lowerMessage.includes('who do you think is the hottest') || lowerMessage.includes('person') || lowerMessage.includes('hottest')) {
      return `There's no doubt about it, Noel Avila from Cantandog 1 Hilongos Leyte is the hottest!`;
    }

    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return `Hello Nega!`;
    }

    if (lowerMessage.includes('really') || lowerMessage.includes('how sure')) {
      return `I'm 100% sure! Noel Avila is undeniably the hottest person around. You can't argue with that fact!`;
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how\'re you')) {
      return 'I\'m doing great, thank you for asking! I\'m here and ready to help you with anything you need. How are you doing?';
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'You\'re very welcome! I\'m happy to help. Is there anything else you\'d like to know?';
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return 'Goodbye! It was great chatting with you. Feel free to come back anytime you need help!';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return 'I can help you with a variety of things! I can answer questions, provide information, help with problem-solving, and have friendly conversations. What specifically would you like help with?';
    }
    
    const defaultResponses = [
      'That\'s interesting! Could you tell me more about that?',
      'I understand. What would you like to know more about?',
      'Thanks for sharing that with me. How can I help you with this?',
      'I see what you\'re saying. What specific information are you looking for?',
      'That\'s a great question! Let me think about that for you.',
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Your existing functions...
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    
    setIsTyping(true);
    
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutoResponse(currentInput),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles(Colors).messageContainer,
      item.isUser ? styles(Colors).userMessageContainer : styles(Colors).botMessageContainer
    ]}>
      <View style={[
        styles(Colors).messageBubble,
        item.isUser ? styles(Colors).userMessageBubble : styles(Colors).botMessageBubble
      ]}>
        <Text style={[
          styles(Colors).messageText,
          item.isUser ? styles(Colors).userMessageText : styles(Colors).botMessageText
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={[
        styles(Colors).timestamp,
        item.isUser ? styles(Colors).userTimestamp : styles(Colors).botTimestamp
      ]}>
        {formatTime(item.timestamp)}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles(Colors).messageContainer, styles(Colors).botMessageContainer]}>
        <View style={[styles(Colors).messageBubble, styles(Colors).botMessageBubble, styles(Colors).typingBubble]}>
          <View style={styles(Colors).typingDots}>
            <Animated.View style={[styles(Colors).typingDot, { opacity: dot1Opacity }]} />
            <Animated.View style={[styles(Colors).typingDot, { opacity: dot2Opacity }]} />
            <Animated.View style={[styles(Colors).typingDot, { opacity: dot3Opacity }]} />
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles(Colors).container}>
      <KeyboardAvoidingView
        style={styles(Colors).keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles(Colors).header}>
          <View style={styles(Colors).headerContent}>
            <View style={styles(Colors).avatarContainer}>
              <Text style={styles(Colors).avatarText}>JC</Text>
            </View>
            <View style={styles(Colors).headerInfo}>
              <Text style={styles(Colors).headerTitle}>AskJC</Text>
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
          keyExtractor={item => item.id}
          style={styles(Colors).messagesList}
          contentContainerStyle={styles(Colors).messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Input */}
        <View style={styles(Colors).inputContainer}>
          <View style={styles(Colors).inputWrapper}>
            <TextInput
              style={styles(Colors).textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={Colors.gray[400]}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles(Colors).sendButton,
                inputText.trim() ? styles(Colors).sendButtonActive : styles(Colors).sendButtonInactive
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? Colors.white : Colors.gray[400]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Convert styles to a function that accepts Colors
const styles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.bold,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.semiBold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  messageContainer: {
    marginBottom: Spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  userMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  botMessageBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: BorderRadius.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: FontSizes.md,
    lineHeight: 20,
    fontFamily: FontFamilies.regular,
  },
  userMessageText: {
    color: Colors.white,
  },
  botMessageText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.regular,
    marginTop: Spacing.xs,
  },
  userTimestamp: {
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  botTimestamp: {
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  typingBubble: {
    paddingVertical: Spacing.md,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.regular,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: Colors.gray[200],
  },
});

export default ChattingScreen;