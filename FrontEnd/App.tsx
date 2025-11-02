import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import StackNavigator from './src/navigation/StackNavigator';
import { ThemeProvider, useTheme } from './src/constants/ThemeContext';
import WebContainer from './src/components/ChatPages/webContainer';
import { getColors } from './src/constants/theme';

SplashScreen.preventAutoHideAsync();

const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const Colors = getColors(isDark);

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.primary,
      background: Colors.background,
      card: Colors.surface,
      text: Colors.text,
      border: Colors.border,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.primary,
      background: Colors.background,
      card: Colors.surface,
      text: Colors.text,
      border: Colors.border,
    },
  };

  return (
    <WebContainer Colors={Colors}>
      <NavigationContainer theme={isDark ? customDarkTheme : customLightTheme}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <StackNavigator />
      </NavigationContainer>
    </WebContainer>
  );
};

export default function App() {
  return (
    //  Wrap entire app in SafeAreaProvider
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}