import React, { memo, useCallback } from 'react';
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
import parseFormattedText from '../../styles/fonts/FormattedText';

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

// Memoized MessageItem component
export const MessageItem = memo<MessageItemProps>(({ 
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

  // Memoize the suggestion press handler
  const handleSuggestionPress = useCallback((suggestion: string) => {
    if (onSuggestionPress) {
      onSuggestionPress(item.id, suggestion);
    }
  }, [onSuggestionPress, item.id]);

  const showSuggestions = !item.isUser && shouldShowSuggestions && shouldShowSuggestions(item.id);

  const textStyle = StyleSheet.flatten([
    styles(Colors).messageText,
    item.isUser ? styles(Colors).userMessageText : styles(Colors).botMessageText
  ]);

  return (
    <View style={StyleSheet.flatten([
      styles(Colors).messageContainer,
      item.isUser ? styles(Colors).userMessageContainer : styles(Colors).botMessageContainer
    ])}>
      
      <View style={StyleSheet.flatten([
        styles(Colors).messageBubble,
        item.isUser ? styles(Colors).userMessageBubble : styles(Colors).botMessageBubble
      ])}>
        
        <Text style={textStyle}>
          {parseFormattedText(
            item.text, 
            Colors, 
            item.isUser,
            textStyle 
          )}
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

      <Text style={StyleSheet.flatten([
        styles(Colors).timestamp,
        item.isUser ? styles(Colors).userTimestamp : styles(Colors).botTimestamp
      ])}>
        {formatTime(item.timestamp)}
      </Text>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.text === nextProps.item.text &&
    prevProps.item.isUser === nextProps.item.isUser &&
    prevProps.item.timestamp === nextProps.item.timestamp &&
    prevProps.Colors === nextProps.Colors &&
    prevProps.onSuggestionPress === nextProps.onSuggestionPress &&
    prevProps.shouldShowSuggestions === nextProps.shouldShowSuggestions
  );
});

// Memoized TypingIndicator component
export const TypingIndicator = memo<TypingIndicatorProps>(({
  Colors,
  isTyping,
  dot1Opacity,
  dot2Opacity,
  dot3Opacity,
}) => {
  if (!isTyping) return null;
  
  // Create safe animated styles with fallbacks
  const dot1Style = {
    ...styles(Colors).typingDot,
    opacity: dot1Opacity || 1
  };
  
  const dot2Style = {
    ...styles(Colors).typingDot,
    opacity: dot2Opacity || 0.7
  };
  
  const dot3Style = {
    ...styles(Colors).typingDot,
    opacity: dot3Opacity || 0.4
  };
  
  return (
    <View style={StyleSheet.flatten([
      styles(Colors).messageContainer, 
      styles(Colors).botMessageContainer
    ])}>
      <View style={StyleSheet.flatten([
        styles(Colors).messageBubble, 
        styles(Colors).botMessageBubble, 
        styles(Colors).typingBubble
      ])}>
        <View style={styles(Colors).typingDots}>
          <Animated.View style={dot1Style} />
          <Animated.View style={dot2Style} />
          <Animated.View style={dot3Style} />
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isTyping === nextProps.isTyping &&
    prevProps.Colors === nextProps.Colors &&
    prevProps.dot1Opacity === nextProps.dot1Opacity &&
    prevProps.dot2Opacity === nextProps.dot2Opacity &&
    prevProps.dot3Opacity === nextProps.dot3Opacity
  );
});

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
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
  },
  botMessageBubble: {
    backgroundColor: Colors.botmessage,
    borderBottomLeftRadius: BorderRadius?.sm || 4,
    shadowColor: Colors.botmessage,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 0.4,
    borderColor: Colors.borderColor,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 21,
    fontFamily: FontFamilies?.regular || 'System',
  },
  userMessageText: {
    color: Colors.text,
  },
  botMessageText: {
    color: Colors.text,
    fontFamily: FontFamilies?.regular || 'System',
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
    backgroundColor: Colors.text || '#666',
    marginHorizontal: 2,
  },
  suggestionsContainer: {
    flexWrap: 'wrap',
    maxWidth: '80%',
    marginTop: Spacing?.sm || 8,
  },
  suggestionButton: {
    backgroundColor: Colors.suggestionBackground,
    borderWidth: 1,         
    borderColor: Colors.borderSuggestion,
    borderRadius: BorderRadius?.md || 8,   
    paddingHorizontal: Spacing?.sm || 8, 
    paddingVertical: Spacing?.xs || 4,  
    marginVertical: 2,
    marginRight: Spacing?.sm || 8,
    alignSelf: 'flex-start',      
  },
  suggestionText: {
    fontSize: FontSizes?.xs || 12,          
    color: Colors.textSecondary,   
    fontFamily: FontFamilies?.regular || 'System',
  },
});

export default { MessageItem, TypingIndicator };