import React from 'react';
import { Text } from 'react-native';
import { FontFamilies, FontSizes } from '../../constants/theme';

// Enhanced text parser that handles multiple formatting types
const parseFormattedText = (text: string, Colors: any, isUser: boolean, baseTextStyle: any) => {
  // Updated regex to properly capture **text** and *text* patterns
  const formatRegex = /(\*\*.*?\*\*|\*.*?\*)/g;
  
  const parts = text.split(formatRegex);
  
  return parts.map((part, index) => {
    if (!part) return null;

    let textStyle = { ...baseTextStyle };
    let content = part;

    if (part.startsWith('**') && part.endsWith('**')) {
      content = part.slice(2, -2);
      textStyle = {
        ...textStyle,
        fontFamily: FontFamilies?.bold || 'System',
        fontSize: FontSizes?.md || 15,
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