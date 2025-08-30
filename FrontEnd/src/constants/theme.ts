export const LightColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#014211ff',
  danger: '#FF3B30',
  warning: '#343301ff',
  info: '#5AC8FA',
  light: '#F2F2F7',
  dark: '#1C1C1E',
  white: '#FFFFFF',
  black: '#000000',
  background: '#FFFFFF',
  usermessage: 'rgba(1, 53, 0, 0.55)',
  botmessage: 'rgba(139, 91, 7, 0.33)2)',
  surface: '#F9FAFB',
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  line: 'black',
  borderSuggestion:  'rgba(139, 91, 7, 1)',
  borderColor: 'rgba(139, 91, 7, 0.16)',
  suggestionBackground:  '#634e0b0c',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

export const DarkColors = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  success: '#1ad536ff',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#64D2FF',
  light: '#1C1C1E',
  dark: '#F2F2F7',
  white: '#FFFFFF',  
  black: '#000000',  
  background: '#000000',
  usermessage: 'rgba(5, 158, 2, 0.55)',
  botmessage: 'rgba(197, 127, 5, 0.29)',
  surface: '#1C1C1E',
  suggestionBackground: '#2c2c2e97',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  line: 'white',
  borderSuggestion: '#8e6c04a1',
  borderColor: 'rgba(253, 253, 253, 1)',
  gray: {
    50: '#1C1C1E',
    100: '#2C2C2E',
    200: '#38383A',
    300: '#48484A',
    400: '#636366',
    500: '#8E8E93',
    600: '#AEAEB2',
    700: '#C7C7CC',
    800: '#D1D1D6',
    900: '#F2F2F7',
  },
} as const;

export const getColors = (isDark: boolean) => {
  const colors = isDark ? DarkColors : LightColors;
  
  
  return colors;
};

// Keep other constants the same
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontFamilies = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  light: 'Poppins-Light',
  thin: 'Poppins-Thin',
};