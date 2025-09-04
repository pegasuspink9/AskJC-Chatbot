// Create a new file: src/components/WebContainer.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface WebContainerProps {
  children: React.ReactNode;
  Colors: any;
}

const WebContainer: React.FC<WebContainerProps> = ({ children, Colors }) => {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles(Colors).webWrapper}>
      <View style={styles(Colors).mobileViewport}>
        {children}
      </View>
    </View>
  );
};

const styles = (Colors: any) => StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: Colors.background || '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any, 
  },
  mobileViewport: {
    width: screenWidth > 45 ? 400 : '100%',
    maxWidth: 900,
    minHeight: '100vh' as any,
    backgroundColor: Colors.surface || '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderRadius: Platform.OS === 'web' ? 12 : 0, 
    overflow: 'hidden',
  },
});

export default WebContainer;