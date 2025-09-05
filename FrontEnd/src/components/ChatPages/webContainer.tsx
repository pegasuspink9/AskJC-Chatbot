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

  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  return (
    <View style={styles(Colors).webWrapper}>
      <View style={[
        styles(Colors).mobileViewport,
        isDesktop && styles(Colors).desktop,
        isTablet && styles(Colors).tablet
      ]}>
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
    justifyContent: 'flex-start',
    minHeight: '100vh' as any,
  },
  mobileViewport: {
    width: '100%',
    height: '100%',
    minHeight: '100vh' as any,
    backgroundColor: Colors.surface || '#ffffff',
    overflow: 'hidden',
    flex: 1,
  },
  tablet: {
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderRadius: 12,
    maxHeight: '98vh' as any,
    marginTop: '1vh' as any,
  },
  desktop: {
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
    borderRadius: 20,
    maxHeight: '95vh' as any,
    marginTop: '2.5vh' as any,
  },
});

export default WebContainer;