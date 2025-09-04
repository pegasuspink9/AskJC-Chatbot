import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WebContainerProps {
  children: React.ReactNode;
  Colors: any;
}

const WebContainer: React.FC<WebContainerProps> = ({ children, Colors }) => {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // Determine layout based on screen size
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;
  const isMobile = screenWidth < 768;

  return (
    <View style={styles(Colors, { isTablet, isDesktop, isMobile }).webWrapper}>
      <View style={styles(Colors, { isTablet, isDesktop, isMobile }).mobileViewport}>
        {children}
      </View>
    </View>
  );
};

const styles = (Colors: any, { isTablet, isDesktop, isMobile }: any) => StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: isMobile ? Colors.surface || '#ffffff' : Colors.background || '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    minHeight: '100vh' as any,
  },
  mobileViewport: {
    width: '100%',
    maxWidth: isDesktop ? 500 : isTablet ? 600 : '100%',
    height: '100%',
    minHeight: '100vh' as any,
    backgroundColor: Colors.surface || '#ffffff',
    ...(isDesktop && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
      elevation: 12,
      borderRadius: 20,
      maxHeight: '95vh' as any,
      marginTop: '2.5vh' as any,
    }),
    
    ...(isTablet && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
      borderRadius: 12,
      maxHeight: '98vh' as any,
      marginTop: '1vh' as any,
    }),
    
    ...(isMobile && {
      borderRadius: 0,
      shadowOpacity: 0,
      elevation: 0,
    }),
    
    overflow: 'hidden',
    flex: 1,
  },
});

export default WebContainer;