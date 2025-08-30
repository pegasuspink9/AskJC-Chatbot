// hooks/useChatLogic.ts
import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Message as ChatMessage } from '../../types';
import { apiService } from '../../services/api/apiService';

export const useChatLogic = () => {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());

  // Typing animation state
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  const typingAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Setup typing animation
  useEffect(() => {
    if (isTyping) {
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

      typingAnimationRef.current = Animated.loop(
        Animated.parallel([
          createAnimation(dot1Opacity, 0),
          createAnimation(dot2Opacity, 200),
          createAnimation(dot3Opacity, 400),
        ])
      );
      
      typingAnimationRef.current.start();
    } else {
      if (typingAnimationRef.current) {
        typingAnimationRef.current.stop();
      }
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);
    }

    return () => {
      if (typingAnimationRef.current) {
        typingAnimationRef.current.stop();
      }
    };
  }, [isTyping]);

  // Fallback response for API errors
  const getFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();

    if (lowerMessage.includes('whoso do you think is the hottest') ||
        (lowerMessage.includes('person') && lowerMessage.includes('hottest'))) {
      return `There's no doubt about it, Noel Avila from Cantandog 1 Hilongos Leyte is the hottest!`;
    }
  
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return 'Goodbye! It was great chatting with you. Feel free to come back anytime you need help!';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return 'I can help you with a variety of things! I can answer questions, provide information, help with problem-solving, and have friendly conversations. What specifically would you like help with?';
    }
    
    return 'I apologize, but I\'m having trouble connecting to the server right now. Please try again in a moment.';
  };

  // Get response from API or fallback
  const getResponse = async (userMessage: string): Promise<string> => {
    try {
      // Try to get response from API
      const response = await apiService.sendChatQuery(userMessage);
      return response;
    } catch (error) {
      // Use fallback response on error
      console.warn('Using fallback response due to API error:', error);
      return getFallbackResponse(userMessage);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Hide all previous suggestions when user sends a new message
    setMessages(prev => {
      const allBotMessageIds = prev.filter(msg => !msg.isUser).map(msg => msg.id);
      setUsedSuggestions(prevUsed => new Set([...prevUsed, ...allBotMessageIds]));
      return prev;
    });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      const botResponseText = await getResponse(currentInput);
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const addInitialMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages([userMessage]);
    
    setIsTyping(true);
    
    try {
      const botResponseText = await getResponse(text);
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInputText('');
    setIsTyping(false);
    setUsedSuggestions(new Set()); 
  };

  const addUserMessage = async (text: string) => {
    setMessages(prev => {
      const allBotMessageIds = prev.filter(msg => !msg.isUser).map(msg => msg.id);
      setUsedSuggestions(prevUsed => new Set([...prevUsed, ...allBotMessageIds]));
      return prev;
    });

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);
    
    try {
      const botResponseText = await getResponse(text);
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionPress = (messageId: string, suggestion: string) => {
    setMessages(prev => {
      const allBotMessageIds = prev.filter(msg => !msg.isUser).map(msg => msg.id);
      setUsedSuggestions(prevUsed => new Set([...prevUsed, ...allBotMessageIds]));
      return prev;
    });
    
    addUserMessage(suggestion);
  };

  const shouldShowSuggestions = (messageId: string) => {
    return !usedSuggestions.has(messageId);
  };

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    sendMessage,
    addInitialMessage,
    resetChat,
    typingDots: {
      dot1Opacity,
      dot2Opacity,
      dot3Opacity,
    },
    addUserMessage,
    handleSuggestionPress,
    shouldShowSuggestions
  };
};