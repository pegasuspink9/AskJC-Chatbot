import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

interface WebContainerProps {
  children: React.ReactNode;
  Colors: any;
}

const WebContainer: React.FC<WebContainerProps> = ({ children, Colors }) => {
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    // 🚀 Add visual viewport listener for mobile browsers
    if (Platform.OS === 'web' && window.visualViewport) {
      const handleViewportResize = () => {
        setDimensions({
          width: window.visualViewport?.width || window.innerWidth,
          height: window.visualViewport?.height || window.innerHeight,
        });
      };

      window.visualViewport.addEventListener('resize', handleViewportResize);
      
      return () => {
        subscription?.remove();
        window.visualViewport?.removeEventListener('resize', handleViewportResize);
      };
    }

    return () => {
      subscription?.remove();
    };
  }, []);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const { width: screenWidth } = dimensions;
  
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  return (
    <View style={styles(Colors).webWrapper}>
      <View 
        style={[
          styles(Colors).mobileViewport,
          isDesktop && styles(Colors).desktop,
          isTablet && styles(Colors).tablet,
          isMobile && styles(Colors).mobile,
        ]}
        // 🚀 Add className for CSS targeting
        {...(Platform.OS === 'web' && { className: 'responsive-container' })}
      >
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
    ...(Platform.OS === 'web' && {
      width: '100vw' as any,
      height: '100vh' as any,
      overflow: 'hidden',
      position: 'fixed' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
  },
  mobileViewport: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: Colors.surface || '#ffffff',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      display: 'flex' as any,
      flexDirection: 'column' as any,
      position: 'relative',
    }),
  },
  mobile: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    margin: 0,
    ...(Platform.OS === 'web' && {
      boxShadow: 'none' as any,
      position: 'fixed' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
  },
  tablet: {
    maxWidth: 600,
    width: '90%',
    ...(Platform.OS === 'web' && {
      height: '98vh' as any,
      maxHeight: '98vh' as any,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      borderRadius: 12,
      marginTop: '1vh' as any,
      marginBottom: '1vh' as any,
    }),
  },
  desktop: {
    maxWidth: 500,
    width: 500,
    ...(Platform.OS === 'web' && {
      height: '95vh' as any,
      maxHeight: '95vh' as any,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
      borderRadius: 20,
      marginTop: '2.5vh' as any,
      marginBottom: '2.5vh' as any,
    }),
  },
});

export default WebContainer;