import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, Spacing, FontSizes } from '../../constants/theme';

interface SidebarProps {
  Colors: any;
  modalVisible: boolean;
  slideAnim: Animated.Value;
  isDark: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  Colors,
  modalVisible,
  slideAnim,
  isDark,
  onClose,
  onNewChat,
  onToggleTheme,
}) => {
  const handleNewChat = () => {
    onClose();
    onNewChat();
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles(Colors).drawerOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles(Colors).drawer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
            style={{ flex: 1 }}
          >
            <View style={styles(Colors).drawerHeader}>
              <Text style={styles(Colors).drawerTitle}>Menu</Text>
            </View>
            
            <TouchableOpacity
              style={styles(Colors).drawerItem}
              onPress={handleNewChat}
            >
              <Ionicons name="chatbubbles-outline" size={22} color={Colors.primary} />
              <Text style={styles(Colors).drawerItemText}>New Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles(Colors).themeToggle}
              onPress={onToggleTheme}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = (Colors: any) => StyleSheet.create({
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  drawer: {
    width: 240,
    backgroundColor: Colors.surface,
    paddingTop: Spacing?.xl || 24,
    paddingHorizontal: Spacing?.lg || 16,
    elevation: 5,
    shadowColor: Colors.black || '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  drawerHeader: {
    marginBottom: Spacing?.lg || 16,
  },
  drawerTitle: {
    fontSize: FontSizes?.lg || 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing?.md || 12,
  },
  drawerItemText: {
    marginLeft: Spacing?.md || 12,
    fontSize: FontSizes?.md || 16,
    color: Colors.text,
  },
  themeToggle: {
    position: 'absolute',
    top: Spacing?.lg || 16,
    right: Spacing?.lg || 16,
    zIndex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    padding: Spacing?.sm || 8,
    shadowColor: Colors.black || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Sidebar;