  import React, { memo, useCallback, useState } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    Animated,
    Platform,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator
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

  interface OptimizedImageProps {
    uri: string;
    width?: number;
    height?: number;
    borderRadius?: number;
  }

  const extractSuggestions = (text: string): string[] => {
    const suggestionRegex = /\[(?!IMAGE:)([^\]]+)\]/g;
    const matches = [];
    let match;
    
    while ((match = suggestionRegex.exec(text)) !== null) {
      let suggestion = match[1].trim();
      
      suggestion = suggestion.replace(/\*\*/g, '');
      
      if (suggestion.length > 0 && !suggestion.includes('|') && suggestion !== '---') {
        matches.push(suggestion);
      }
    }
    
    return matches;
  };

  const extractImages = (text: string): string[] => {
    const images = [];
    const bracketImageRegex = /\[IMAGE:(https?:\/\/[^\]]+)\]/g;
    let match;
    while ((match = bracketImageRegex.exec(text)) !== null) {
      images.push(match[1].trim());
    }
    
    const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
    while ((match = markdownImageRegex.exec(text)) !== null) {
      images.push(match[2].trim());
    }
    
    return images;
  };

  const cleanDisplayText = (text: string): string => {
    return text
      .replace(/\[IMAGE:(https?:\/\/[^\]]+)\]/g, '') 
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g, '')
      .replace(/\[(?!IMAGE:)([^\]]+)\]/g, '') 
      .trim();
  };

  // Optimize image URL function
  const optimizeImageUrl = (url: string, width: number = 300, height: number = 200, quality: number = 10): string => {
    // For GitHub assets, add compression parameters
    if (url.includes('github.com/user-attachments/assets/')) {
      try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('w', width.toString());
        urlObj.searchParams.set('h', height.toString());
        urlObj.searchParams.set('fit', 'crop');
        urlObj.searchParams.set('auto', 'compress');
        urlObj.searchParams.set('q', quality.toString());
        return urlObj.toString();
      } catch (error) {
        console.warn('Error optimizing URL:', error);
        return url;
      }
    }
    return url;
  };

  // Updated OptimizedImage component with proper typing
  const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
    uri, 
    width = 300, 
    height = 200, 
    borderRadius = 8 
  }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    const optimizedUri = optimizeImageUrl(uri, width, height, 75);

    return (
      <View style={{ width, height, borderRadius, position: 'relative' }}>
        {loading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius,
            zIndex: 1,
          }}>
            <ActivityIndicator size="small" color="#666" />
          </View>
        )}
        
        {error ? (
          <View style={{
            width,
            height,
            borderRadius,
            backgroundColor: '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>
              Failed to load image
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: optimizedUri }}
            style={{ width, height, borderRadius }}
            resizeMode="cover"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}
      </View>
    );
  };

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

    const suggestions = !item.isUser ? extractSuggestions(item.text) : [];
    const images = !item.isUser ? extractImages(item.text) : []; 
    const displayText = !item.isUser ? cleanDisplayText(item.text) : item.text;

    // Memoize the suggestion press handler
    const handleSuggestionPress = useCallback((suggestion: string) => {
      if (onSuggestionPress) {
        onSuggestionPress(item.id, suggestion);
      }
    }, [onSuggestionPress, item.id]);

    const showSuggestions = !item.isUser && 
      shouldShowSuggestions && 
      shouldShowSuggestions(item.id) && 
      suggestions.length > 0;

    const textStyle = StyleSheet.flatten([
      styles(Colors).messageText,
      item.isUser ? styles(Colors).userMessageText : styles(Colors).botMessageText
    ]);

    return (
      <>
        {/* Text Message */}
        {displayText && (
          <View style={StyleSheet.flatten([
            styles(Colors).messageContainer,
            item.isUser ? styles(Colors).userMessageContainer : styles(Colors).botMessageContainer
          ])}>
            
            <View style={StyleSheet.flatten([
              styles(Colors).messageBubble,
              item.isUser ? styles(Colors).userMessageBubble : styles(Colors).botMessageBubble
            ])}>
              {parseFormattedText(displayText, Colors, item.isUser, textStyle)}
            </View>

            <Text style={StyleSheet.flatten([
              styles(Colors).timestamp,
              item.isUser ? styles(Colors).userTimestamp : styles(Colors).botTimestamp
            ])}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        )}
        {/* Image Messages */}
        {images.length > 0 && images.map((imageUrl, index) => {
          return (
            <View 
              key={`${item.id}-image-${index}`}
              style={StyleSheet.flatten([
                styles(Colors).messageContainer,
                styles(Colors).botMessageContainer 
              ])}
            >
              <View style={StyleSheet.flatten([
                styles(Colors).messageBubble,
                styles(Colors).botMessageBubble,
                styles(Colors).imageBubble
              ])}>
                <OptimizedImage
                  uri={imageUrl}
                  width={280}
                  height={180}
                  borderRadius={8}
                />
              </View>

              <Text style={StyleSheet.flatten([
                styles(Colors).timestamp,
                styles(Colors).botTimestamp
              ])}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          );
        })}
        
        {/* Suggestions */}
        {showSuggestions && (
          <View style={StyleSheet.flatten([
            styles(Colors).messageContainer,
            styles(Colors).botMessageContainer
          ])}>
            <View style={styles(Colors).suggestionsContainer}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles(Colors).suggestionButton}
                  onPress={() => handleSuggestionPress(suggestion)} 
                  activeOpacity={0.7} 
                >
                  <Text 
                    style={styles(Colors).suggestionText}
                    numberOfLines={2} // Limit to 2 lines
                    ellipsizeMode="tail" // Add ... if text is too long
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </>
    );
  }, (prevProps, nextProps) => {
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
      maxWidth: '90%',
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
      borderColor: Colors.borderColor
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
      fontFamily: FontFamilies?.regular || 'System'
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
      marginTop: -10,
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
      marginBottom: 4,
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
      suggestionText: {
      fontSize: FontSizes?.xs || 12,          
      color: Colors.textSecondary,   
      fontFamily: FontFamilies?.regular || 'System',
      flexShrink: 1, 
      flexWrap: 'wrap', 
    },
      imageBubble: {
      padding: 4, 
    },
    messageImage: {
      width: '100%',
      borderRadius: BorderRadius?.md || 8,
    },
  });

  export default { MessageItem, TypingIndicator };