// SimpleLottie.tsx - Using correct lottie.host embed
import React from 'react';
import { Platform, ViewStyle } from 'react-native';

interface SimpleLottieProps {
  source: { uri: string } | any;
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
  resizeMode?: 'contain' | 'cover' | 'center';
}

const SimpleLottie: React.FC<SimpleLottieProps> = ({
  source,
  style,
  autoPlay = true,
  loop = true,
  resizeMode = 'contain',
}) => {
  if (Platform.OS === 'web') {
    const sourceUrl = typeof source === 'object' && source.uri ? source.uri : source;
    
    let embedUrl = sourceUrl;
    if (sourceUrl.includes('lottie.host') && !sourceUrl.includes('/embed/')) {
      // Replace the domain part with embed URL
      embedUrl = sourceUrl.replace('https://lottie.host/', 'https://lottie.host/embed/');
    }
    
    return (
      <iframe
        src={embedUrl}
        style={{
          ...style as any,
          border: 'none',
          backgroundColor: 'transparent',
          width: style?.width || '100%',
          height: style?.height || '100%',
        }}
        title="Lottie Animation"
        loading="lazy"
        allowFullScreen={false}
      />
    );
  }

  // For mobile - check if lottie-react-native is available
  try {
    const LottieView = require('lottie-react-native').default;
    
    return (
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        style={style}
        resizeMode={resizeMode}
      />
    );
  } catch (error) {
    console.log('Lottie React Native not available:', error);
    return null;
  }
};

export default SimpleLottie;