import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Message as ChatMessage } from '../../types';

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

  const getAutoResponse = (userMessage: string): string => {
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
    
    const defaultResponses = [
      'That\'s interesting! Could you tell me more about that?',
      'I understand. What would you like to know more about?',
      'Thanks for sharing that with me. How can I help you with this?',
      'I see what you\'re saying. What specific information are you looking for?',
      'That\'s a great question! Let me think about that for you.',
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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

    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getAutoResponse(currentInput),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, delay);
  };

  const addInitialMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages([userMessage]);
    
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getAutoResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

  const resetChat = () => {
    setMessages([]);
    setInputText('');
    setIsTyping(false);
    setUsedSuggestions(new Set()); 
  };

  const addUserMessage = (text: string) => {
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
  
  const delay = 1500 + Math.random() * 1500;
  setTimeout(() => {
    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: getAutoResponse(text), 
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botResponse]);
    
    setIsTyping(false);
  }, delay);
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