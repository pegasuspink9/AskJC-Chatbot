import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getColors, Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import { RootStackParamList } from '../navigation/StackNavigator'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  action: string;
}
const HomeScreen: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const Colors = getColors(isDark);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const SafeColors = {
    ...Colors,
    white: Colors.white || '#FFFFFF',
    black: Colors.black || '#000000',
    gray: Colors.gray || {
      100: '#F3F4F6',
      400: '#9CA3AF',
    },
    surface: Colors.surface || '#F9FAFB',
    background: Colors.background || '#FFFFFF',
    text: Colors.text || '#111827',
    textSecondary: Colors.textSecondary || '#6B7280',
    border: Colors.border || '#E5E7EB',
    primary: Colors.primary || '#3B82F6',
  };

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-240)).current;

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

  const openDrawer = () => {
    setModalVisible(true);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setTimeout(() => setModalVisible(false), 300);
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Ask a Question',
      icon: 'help-circle-outline',
      description: 'Get help with anything',
      action: 'navigate_to_chat',
    },
    {
      id: '2',
      title: 'Get Suggestions',
      icon: 'bulb-outline',
      description: 'Explore ideas',
      action: 'get_suggestions',
    },
  ];

  const handleQuickAction = (action: QuickAction) => {
    switch (action.action) {
      case 'navigate_to_chat':
        navigation.navigate('Chatting');
        break;
      case 'get_suggestions':
        // Add your suggestion logic here
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: SafeColors.background }]}>
      {/* Hamburger Button */}
      <TouchableOpacity style={styles(SafeColors).hamburger} onPress={openDrawer}>
        <Ionicons name="menu" size={28} color={SafeColors.text} />
      </TouchableOpacity>

      {/* Modal Sidebar */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent
        onRequestClose={closeDrawer}
      >
        <TouchableOpacity
          style={styles(SafeColors).drawerOverlay}
          activeOpacity={1}
          onPress={closeDrawer}
        >
          <Animated.View
            style={[
              styles(SafeColors).drawer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={styles(SafeColors).drawerHeader}>
              <Text style={styles(SafeColors).drawerTitle}>Sidebar</Text>
            </View>
            <TouchableOpacity
              style={styles(SafeColors).drawerItem}
              onPress={() => {
                closeDrawer();
                navigation.navigate('Chatting');
              }}
            >
              <Ionicons name="chatbubbles-outline" size={22} color={SafeColors.primary} />
              <Text style={styles(SafeColors).drawerItemText}>Go to Chat</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView
        style={styles(SafeColors).container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles(SafeColors).scrollView}
          contentContainerStyle={styles(SafeColors).scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Theme Toggle Button */}
          <TouchableOpacity
            style={styles(SafeColors).themeToggle}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={24}
              color={SafeColors.primary}
            />
          </TouchableOpacity>

          {/* Welcome Section */}
          <View style={styles(SafeColors).welcomeSection}>
            <Text style={styles(SafeColors).welcomeTitle}>Welcome to AskJC</Text>
            <Text style={styles(SafeColors).welcomeSubtitle}>
              Your AI-powered assistant ready to help with anything you need.
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles(SafeColors).quickActionsSection}>
            <Text style={styles(SafeColors).sectionTitle}>Quick Actions</Text>
            <View style={styles(SafeColors).quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles(SafeColors).quickActionCard}
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.7}
                >
                  <View style={styles(SafeColors).quickActionIcon}>
                    <Ionicons
                      name={action.icon}
                      size={24}
                      color={SafeColors.primary}
                    />
                  </View>
                  <Text style={styles(SafeColors).quickActionTitle}>{action.title}</Text>
                  <Text style={styles(SafeColors).quickActionDescription}>
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* How To Use Section */}
          <View style={styles(SafeColors).recentSection}>
            <Text style={styles(SafeColors).sectionTitle}>How To Use:</Text>
            <View style={styles(SafeColors).howToCard}>
              <Text style={styles(SafeColors).howToText}>
                1. Tap "Ask a Question" to start a conversation{'\n'}
                2. Type your message in the chat{'\n'}
                3. Get instant responses from JC AI{'\n'}
                4. Toggle between light and dark mode anytime
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hamburger: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.lg,
    zIndex: 10,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.sm,
    elevation: 3,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  drawer: {
    width: 240,
    backgroundColor: Colors.surface,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  drawerHeader: {
    marginBottom: Spacing.lg,
  },
  drawerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  drawerItemText: {
    marginLeft: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  themeToggle: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.lg,
    zIndex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    padding: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeSection: {
    paddingTop: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: FontSizes.xxl,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  quickActionsSection: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    fontFamily: 'Poppins-SemiBold',
  },
  quickActionsGrid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  quickActionDescription: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'Poppins-Regular',
  },
  recentSection: {
    padding: Spacing.lg,
  },
  howToCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  howToText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
});

export default HomeScreen;