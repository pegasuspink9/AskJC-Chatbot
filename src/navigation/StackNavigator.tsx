import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getColors } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import TabNavigator from './TabNavigator';

export type RootStackParamList = {
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  let isDark = false;
  try {
    isDark = useTheme().isDark;
  } catch {
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
    </Stack.Navigator>
  );
};

export default StackNavigator;