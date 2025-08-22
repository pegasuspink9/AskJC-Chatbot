import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import { RootTabParamList } from '../types';
import { HomeScreen, ChatScreen } from '../screens';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          display: "none",
        },
       
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Chats" 
        component={ChatScreen}
        options={{
          title: 'Chats',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;