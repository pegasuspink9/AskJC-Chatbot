import React from 'react';
import { Text } from 'react-native';
import { FontFamilies } from '../../constants/theme';

// Enhanced text parser that handles multiple formatting types
const parseFormattedText = (text: string, Colors: any, isUser: boolean, baseTextStyle: any) => {
  // Split by all formatting patterns while preserving the delimiters
 const formatRegex = /(\*.*?\"|\*.*?\*)/g;

  const parts = text.split(formatRegex);
  
  return parts.map((part, index) => {
    if (!part) return null;

    let textStyle = { ...baseTextStyle };
    let content = part;

    if (part.startsWith('*') && part.endsWith('*')) {
      // Bold text
      content = part.slice(1, -1) + '\n';
      textStyle = {
        ...textStyle,
        fontFamily: FontFamilies?.bold || 'System',
      };
    }

    return (
      <Text key={index} style={textStyle}>
        {content}
      </Text>
    );
  }).filter(Boolean);
};

export default parseFormattedText;
