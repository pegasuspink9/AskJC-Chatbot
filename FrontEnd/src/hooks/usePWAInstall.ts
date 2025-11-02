import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false); //  Detect iOS
  const [isStandalone, setIsStandalone] = useState(false); //  Check if in standalone mode

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    //  Detect iOS
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    setIsIOS(isIOSDevice);

    //  Check if already installed (standalone mode)
    const isInStandaloneMode = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    };

    if (isInStandaloneMode()) {
      setIsInstalled(true);
      setIsStandalone(true);
      return;
    }

    //  For non-iOS browsers: Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      console.log('✅ PWA install prompt ready (Android/Desktop)');
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('✅ PWA has been installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  //  Handle install click
  const handleInstallClick = async () => {
    // For iOS: Show instructions
    if (isIOS) {
      alert(
        '📱 To install this app on iOS:\n\n' +
        '1. Tap the Share button (square with arrow)\n' +
        '2. Select "Add to Home Screen"\n' +
        '3. Tap "Add" in the top right\n\n' +
        'You can then launch AskJC from your home screen!'
      );
      return;
    }

    // For Android/Desktop: Use standard prompt
    if (!deferredPrompt) {
      console.log('❌ No install prompt available');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response: ${outcome}`);
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  return {
    isInstallable: isInstallable || isIOS, //  Show button on iOS too
    isInstalled,
    isIOS, //  Export iOS flag
    isStandalone, //  Export standalone flag
    handleInstallClick,
  };
};