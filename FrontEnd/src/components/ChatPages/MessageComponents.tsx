import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity
} from 'react-native';
import { getColors, Spacing, BorderRadius, FontSizes, FontFamilies } from '../../constants/theme';
import { Message as ChatMessage } from '../../types/index';

interface MessageItemProps {
  item: ChatMessage;
  Colors: any;
  onSuggestionPress?: (messageId: string, suggestion: string) => void;
  shouldShowSuggestions?: (messageId: string) => boolean;
}

interface TypingIndicatorProps {
  Colors: any;
  isTyping: boolean;
  dot1Opacity: Animated.Value;
  dot2Opacity: Animated.Value;
  dot3Opacity: Animated.Value;
}

export const MessageItem: React.FC<MessageItemProps> = ({ 
  item, 
  Colors, 
  onSuggestionPress,
  shouldShowSuggestions 
}) => {
  const formatTime = (timestamp: Date): string => {
    try {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const suggestions = ['Tuition fee', 'Enrollment Process', 'Exam Date'];

  const handleSuggestionPress = (suggestion: string) => {
    if (onSuggestionPress) {
      onSuggestionPress(item.id, suggestion);
    }
  };

  // Check if suggestions should be shown for this message
  const showSuggestions = !item.isUser && shouldShowSuggestions && shouldShowSuggestions(item.id);

  return (
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

      {showSuggestions && (
        <View style={styles(Colors).suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles(Colors).suggestionButton}
              onPress={() => handleSuggestionPress(suggestion)} 
              activeOpacity={0.7} 
            >
              <Text style={styles(Colors).suggestionText}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[
        styles(Colors).timestamp,
        item.isUser ? styles(Colors).userTimestamp : styles(Colors).botTimestamp
      ]}>
        {formatTime(item.timestamp)}
      </Text>
    </View>
  );
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  Colors,
  isTyping,
  dot1Opacity,
  dot2Opacity,
  dot3Opacity,
}) => {
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

const styles = (Colors: any) => StyleSheet.create({
  messageContainer: {
    marginBottom: Spacing?.md || 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing?.md || 12,
    paddingVertical: Spacing?.sm || 8,
    borderRadius: BorderRadius?.lg || 12,
  },
  userMessageBubble: {
    backgroundColor: Colors.usermessage,
    borderBottomRightRadius: BorderRadius?.sm || 4,
    shadowColor: Colors.usermessage,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 1,
  },
  botMessageBubble: {
    backgroundColor: Colors.botmessage,
    borderBottomLeftRadius: BorderRadius?.sm || 4,
    shadowColor: Colors.botmessage,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 1,
  },
  messageText: {
    fontSize: FontSizes?.sm,
    lineHeight: 20,
    fontFamily: FontFamilies?.regular || 'System',
  },
  userMessageText: {
    color: Colors.text,
  },
  botMessageText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: FontSizes?.xs || 12,
    fontFamily: FontFamilies?.regular || 'System',
    marginTop: Spacing?.xs || 4,
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
    paddingVertical: Spacing?.md || 12,
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
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '80%',
    marginTop: Spacing?.sm,
  },
  suggestionButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,         
    borderColor: Colors.border,
    borderRadius: BorderRadius?.md,   
    paddingHorizontal: Spacing?.sm, 
    paddingVertical: Spacing?.xs,  
    marginVertical: 2,
    marginRight: Spacing?.sm,
    alignSelf: 'flex-start',      
  },
  suggestionText: {
    fontSize: FontSizes?.xs,          
    color: Colors.textSecondary,   
    fontFamily: FontFamilies?.regular,
  },
});

export default { MessageItem, TypingIndicator };