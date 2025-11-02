import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, Spacing, FontSizes } from '../../constants/theme';
import SimpleLottie from '../../LottieAnimation/SimpleLottie';
import { useTheme } from '../../constants/ThemeContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const { width, height } = Dimensions.get('window');

interface LandingScreenProps {
  Colors: any;
  fadeAnim: Animated.Value;
  slideAnim2: Animated.Value;
  introInput: string;
  setIntroInput: (text: string) => void;
  onSubmit: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({
  Colors,
  fadeAnim,
  slideAnim2,
  introInput,
  setIntroInput,
  onSubmit,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { isInstallable, isInstalled, isIOS, handleInstallClick } = usePWAInstall(); //  Get isIOS

  return (
    <Animated.View
      style={[
        styles(Colors).welcomeSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim2 }]
        }
      ]}
    >
      {/* Theme Toggle Button */}
      <TouchableOpacity
        style={styles(Colors).themeToggle}
        onPress={toggleTheme} 
        activeOpacity={0.7}
      >
        <Ionicons
          name={isDark ? 'sunny' : 'moon'}
          size={24}
          color={Colors.primary}
        />
      </TouchableOpacity>

      {/* PWA Install Button - Show on Web when installable */}
      {Platform.OS === 'web' && isInstallable && !isInstalled && (
        <TouchableOpacity
          style={[
            styles(Colors).installButton,
            isIOS && styles(Colors).iOSInstallButton //  Different style for iOS
          ]}
          onPress={handleInstallClick}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isIOS ? "share-social" : "download-outline"} //  Different icon for iOS
            size={20}
            color={Colors.white}
          />
          <Text style={styles(Colors).installButtonText}>
            {isIOS ? "Add to Home Screen" : "Install App"} {/*  Different text for iOS */}
          </Text>
        </TouchableOpacity>
      )}

     

      <SimpleLottie
        source={{ uri: 'https://lottie.host/9c5ce41b-6089-4da6-97d8-b6c9106f2f3c/coLSHGaNNi.lottie' }}
        style={styles(Colors).lottieBackground}
        autoPlay
        loop
        resizeMode="contain"
      />

      <Text style={[styles(Colors).welcomeTitle, styles(Colors).welcomeAsk]}>
        Ask
        <Text style={styles(Colors).welcomeJC}>JC</Text>
      </Text>

      <Text style={styles(Colors).welcomeSubtitle}>
        Your AI-powered assistant ready to help with anything you need.
      </Text>

      <View style={styles(Colors).inputRow}>
        <TextInput
          style={styles(Colors).introInput}
          value={introInput}
          onChangeText={setIntroInput}
          placeholder="Type your question..."
          placeholderTextColor={Colors.gray?.[400] || '#9CA3AF'}
          maxLength={100}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles(Colors).sendButton,
            introInput.trim()
              ? styles(Colors).sendButtonActive
              : styles(Colors).sendButtonInactive
          ]}
          onPress={onSubmit}
          disabled={!introInput.trim()}
        >
          <Ionicons
            name="arrow-forward"
            size={20}
            color={introInput.trim() ? Colors.white : Colors.gray?.[400]}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = (Colors: any) => StyleSheet.create({
  welcomeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing?.lg || 16,
    paddingBottom: Spacing?.lg || 16,
  },
  lottieBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: -1,
    opacity: 0.2,
  },
  welcomeTitle: {
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 100,
  },
  welcomeAsk: {
    color: Colors.warning,
  },
  welcomeJC: {
    color: Colors.success,
  },
  welcomeSubtitle: {
    fontSize: FontSizes?.sm || 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
    marginBottom: Spacing?.lg || 16,
  },
  inputRow: {
    flexDirection: 'row',
    width: 330,
    marginTop: Spacing?.lg || 16,
  },
  introInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray?.[50],
    borderRadius: 16,
    marginRight: Spacing?.sm || 8,
    fontFamily: 'Poppins-Regular'
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing?.sm || 8,
  },
  sendButtonActive: {
    backgroundColor: Colors.success,
  },
  sendButtonInactive: {
    backgroundColor: Colors.gray?.[200] || '#E5E7EB',
  },
  themeToggle: {
    position: 'absolute',
    top: height * 0.064,
    right: width * 0.05,
    zIndex: 10,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing?.sm || 8,
    elevation: 3,
    shadowColor: Colors.black || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  //  PWA Install Button Styles
  installButton: {
    position: 'absolute',
    top: height * 0.064,
    left: width * 0.05,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 24,
    paddingVertical: Spacing?.sm || 8,
    paddingHorizontal: Spacing?.md || 12,
    elevation: 3,
    shadowColor: Colors.black || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  //  iOS-specific styling
  iOSInstallButton: {
    backgroundColor: Colors.primary || '#3B82F6', // Different color for iOS
  },
  installButtonText: {
    color: Colors.white,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginLeft: 6,
  },
  //  Already Installed Badge
  installedBadge: {
    position: 'absolute',
    top: height * 0.064,
    left: width * 0.05,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingVertical: Spacing?.sm || 8,
    paddingHorizontal: Spacing?.md || 12,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  installedText: {
    color: Colors.success,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginLeft: 6,
  },
});

export default LandingScreen;