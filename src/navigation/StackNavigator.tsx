import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getColors } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import TabNavigator from './TabNavigator';
import { ChattingScreen } from '../screens';

export type RootStackParamList = {
  MainTabs: undefined;
  Chatting: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  // If you have ThemeContext, use it:
  let isDark = false;
  try {
    isDark = useTheme().isDark;
  } catch {
    // fallback to light theme
    isDark = false;
  }
  const Colors = getColors(isDark);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: Colors.dark,
        },
        headerTintColor: Colors.primary,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Chatting" 
        component={ChattingScreen}
        options={{
          title: 'Chat with JC',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;