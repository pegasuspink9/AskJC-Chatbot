import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getColors, Spacing } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import { RootStackParamList } from '../navigation/StackNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import new components
import LandingScreen from '../components/ChatPages/LandingScreen';
import ChatScreen from '../components/ChatPages/ChattingScreen';
import { MessageItem, TypingIndicator } from '../components/ChatPages/MessageComponents';
import { useChatLogic } from '../components/ChatPages/useChats';
import { Message as ChatMessage } from '../types/index';

const HomeScreen: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const Colors = getColors(isDark);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Intro state
  const [showIntro, setShowIntro] = useState(true);
  const [introInput, setIntroInput] = useState('');

  // Sidebar state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-240)).current;

  // Transition state
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim2 = useRef(new Animated.Value(0)).current;

  // Chat logic using custom hook
  const {
    messages,
    inputText,
    setInputText,
    isTyping,
    sendMessage,
    addInitialMessage,
    resetChat,
    typingDots,
    handleSuggestionPress,
    shouldShowSuggestions,
  } = useChatLogic();

  // Sidebar animations
  useEffect(() => {
    if (drawerVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -240,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [drawerVisible, slideAnim]);

  //SideBar
  const openDrawer = () => {
    setModalVisible(true);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setTimeout(() => setModalVisible(false), 300);
  };

  const handleIntroSubmit = () => {
    if (introInput.trim()) {
      addInitialMessage(introInput.trim());
      
      // Animate transition from intro to chat
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim2, {
          toValue: -30,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowIntro(false);
        setIntroInput('');
        
        // Reset and animate in chat section
        fadeAnim.setValue(0);
        slideAnim2.setValue(30);
        
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim2, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          ]).start();
        }, 50);
      });
    }
  };

  const handleResetChat = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim2, {
        toValue: 30,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowIntro(true);
      setIntroInput('');
      resetChat();
      
      fadeAnim.setValue(0);
      slideAnim2.setValue(-30);
      
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim2, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }, 50);
    });
  };

  const handleNewChat = () => {
    handleResetChat();
  };

  // Render functions
  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageItem 
      item={item} 
      Colors={Colors} 
      onSuggestionPress={handleSuggestionPress}
      shouldShowSuggestions={shouldShowSuggestions}
    />
  );

  const renderTypingIndicator = () => (
    <TypingIndicator
      Colors={Colors}
      isTyping={isTyping}
      dot1Opacity={typingDots.dot1Opacity}
      dot2Opacity={typingDots.dot2Opacity}
      dot3Opacity={typingDots.dot3Opacity}
    />
  );

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.background }]}>
 
      <KeyboardAvoidingView
        style={styles(Colors).container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {showIntro ? (
          <LandingScreen
            Colors={Colors}
            fadeAnim={fadeAnim}
            slideAnim2={slideAnim2}
            introInput={introInput}
            setIntroInput={setIntroInput}
            onSubmit={handleIntroSubmit}
          />
        ) : (
          <ChatScreen
            Colors={Colors}
            fadeAnim={fadeAnim}
            slideAnim2={slideAnim2}
            messages={messages}
            inputText={inputText}
            setInputText={setInputText}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            onResetChat={handleResetChat}
            renderMessage={renderMessage}
            renderTypingIndicator={renderTypingIndicator}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default HomeScreen;