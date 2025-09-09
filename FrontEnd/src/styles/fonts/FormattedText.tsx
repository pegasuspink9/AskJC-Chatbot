import React from 'react';
import { Text, View, Linking, TouchableOpacity, Alert, Platform, Image, Dimensions } from 'react-native';
import { FontFamilies } from '../../constants/theme';

const parseFormattedText = (
  text: string,
  Colors: any,
  isUser: boolean,
  baseTextStyle: any
) => {

  if (text.includes('![')) {
    return renderWithMarkdownImages(text, baseTextStyle, Colors);
  }


  if (text.includes('|')) {
    return renderWithTable(text, baseTextStyle, Colors);
  }

  if (text.match(/^\s*[-•]/m)) {
    return renderWithBullets(text, baseTextStyle, Colors);
  }

  return renderFormattedText(text, baseTextStyle, Colors);
};


const renderWithMarkdownImages = (text: string, baseTextStyle: any, Colors: any) => {
  // Regex to match ![alt text](URL) format
  const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
  const parts = text.split(markdownImageRegex);
  
  return parts.map((part, index) => {
    // Every 3rd element starting from index 2 is a URL
    if ((index - 2) % 3 === 0 && index > 0) {
      const imageUrl = part.trim();
      return (
        <View key={index} style={{ marginVertical: 8, alignItems: 'center' }}>
          <Image 
            source={{ uri: imageUrl }}
            style={{
              width: 300,
              height: 200,           
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
        </View>
      );
    }
    
    // Every 3rd element starting from index 1 is alt text (skip it)
    if ((index - 1) % 3 === 0 && index > 0) {
      return null;
    }
    
    // Regular text parts
    if (part && part.trim()) {
      return (
        <View key={index}>
          {renderFormattedText(part, baseTextStyle, Colors)}
        </View>
      );
    }
    
    return null;
  }).filter(Boolean);
};


const handleEmailPress = async (email: string) => {
    try {
      const cleanEmail = email.trim().replace(/[.,;:]$/, '');
      
      const mailtoUrl = `mailto:${cleanEmail}`;
      
      console.log('📧 Attempting to open email:', mailtoUrl);
      
      const supported = await Linking.canOpenURL(mailtoUrl);
      
      if (supported) {
        await Linking.openURL(mailtoUrl);
        console.log('✅ Email app opened successfully');
      } else {
        Alert.alert(
          "Email App", 
          `No email app found. Please copy this email address:\n\n${cleanEmail}`,
          [
            { 
              text: "OK", 
              style: "default" 
            }
          ]
        );
      }
    } catch (error) {
      console.error('💥 Error opening email:', error);
      Alert.alert(
        "Email Error", 
        "Something went wrong while trying to open the email app.",
        [{ text: "OK", style: "default" }]
      );
    }
  };


  
const renderFormattedText = (text: string, baseTextStyle: any, Colors: any) => {
  const combinedRegex =
    /(\*\*.*?\*\*|\*.*?\*|https?:\/\/[^\s\)]+|www\.[^\s\)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  const parts = text.split(combinedRegex);

  return parts
    .map((part, index) => {
      if (!part) return null;

      let textStyle = { ...baseTextStyle };
      let content = part;

      if (part.startsWith('**') && part.endsWith('**')) {
        content = part.slice(2, -2).trim();

        if (content.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleEmailPress(content)}
              activeOpacity={0.7}
              style={{ flexShrink: 1 }}
            >
              <Text
                style={{
                  ...textStyle,
                  color: Colors?.primary || '#0066cc',
                  fontWeight: '500',
                  textDecorationLine: 'underline',
                }}
              >
                {content}
              </Text>
            </TouchableOpacity>
          );
        }

        if (content.match(/^(https?:\/\/[^\s\)]+|www\.[^\s\)]+)$/)) {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleUrlPress(content)}
              activeOpacity={0.7}
              style={{ flexShrink: 1 }}
            > 
              <Text
                style={{
                  ...textStyle,
                  color: Colors?.primary || '#0066cc',
                  fontWeight: '500',
                }}
              >
                {content}
              </Text>
            </TouchableOpacity>
          );
        }

        // 🔹 Normal bold text
        return (
          <Text
            key={index}
            style={{
              ...textStyle,
              fontFamily: FontFamilies?.bold || 'System',
            }}
          >
            {content}
          </Text>
        );
      }

      if (part.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleEmailPress(part)}
            activeOpacity={0.7}
            style={{ flexShrink: 1 }}
          >
            <Text
              style={{
                ...textStyle,
                color: Colors?.primary || '#0066cc',
                fontWeight: '500',
                textDecorationLine: 'underline',
              }}
            >
              {part}
            </Text>
          </TouchableOpacity>
        );
      }

      if (part.match(/^(https?:\/\/[^\s\)]+|www\.[^\s\)]+)$/) && !part.includes('IMAGE:')) {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleUrlPress(part)}
            activeOpacity={0.7}
            style={{ flexShrink: 1 }}
          >
            <Text
              style={{
                ...textStyle,
                color: Colors?.primary || '#0066cc',
                fontWeight: '500',
              }}
            >
              {part}
            </Text>
          </TouchableOpacity>
        );
      }

      // ✅ Normal text
      return (
        <Text key={index} style={textStyle}>
          {content}
        </Text>
      );
    })
    .filter(Boolean);
};


const handleUrlPress = async (url: string) => {
  try {
    let fullUrl = url.trim();
    
    fullUrl = fullUrl.replace(/[.,;:]$/, '');
    
    if (fullUrl.startsWith('www.')) {
      fullUrl = `https://${fullUrl}`;
    } else if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`;
    }
    
    if (Platform.OS === 'android') {
      try {
        await Linking.openURL(fullUrl);
        console.log('✅ URL opened successfully');
        return;
      } catch (androidError) {
        console.log('❌ Direct open failed, trying canOpenURL check');
      }
    }

   
    
    // Fallback for both platforms
    const supported = await Linking.canOpenURL(fullUrl);
    console.log('🔍 URL supported:', supported);
    
    if (supported) {
      await Linking.openURL(fullUrl);
      console.log('✅ URL opened via canOpenURL check');
    } else {
      Alert.alert(
        "Can't open link", 
        `Unable to open this link. Please copy and paste it in your browser:\n\n${fullUrl}`,
        [{ text: "OK", style: "default" }]
      );
    }
  } catch (error) {
    console.error('💥 Error opening URL:', error);
    Alert.alert(
      "Link Error", 
      "Something went wrong while trying to open the link.",
      [{ text: "OK", style: "default" }]
    );
  }
};

const renderWithBullets = (text: string, baseTextStyle: any, Colors: any) => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  return (
    <View style={{ width: '100%' }}>
      {lines.map((line, index) => {
        const isBullet = /^[-•]\s*/.test(line.trim());
        const trimmed = line.trim().replace(/^[-•]\s*/, ''); 

        return (
          <View
            key={index}
            style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}
          >
            {isBullet && (
              <Text style={{ ...baseTextStyle, marginRight: 20 }}>•</Text>
            )}

            <View style={{ flex: 1 }}>
              {renderFormattedText(trimmed, baseTextStyle, Colors)}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const renderWithTable = (text: string, baseTextStyle: any, Colors: any) => {
  const lines = text.split('\n');

  const firstTableIndex = lines.findIndex(line => line.includes('|'));
  const tableIndexes = lines
    .map((line, i) => (line.includes('|') ? i : -1))
    .filter(i => i !== -1);

  const lastTableIndex = tableIndexes.length > 0 ? tableIndexes.pop()! : -1;

  if (firstTableIndex === -1 || lastTableIndex === -1) {
    return renderFormattedText(text, baseTextStyle, Colors);
  }

  const intro = lines.slice(0, firstTableIndex).join('\n').trim();
  const tableLines = lines.slice(firstTableIndex, lastTableIndex + 1);
  const outro = lines.slice(lastTableIndex + 1).join('\n').trim();

  const rows = tableLines.filter((_, i) => i !== 1);

  return (
    <View style={{ width: '100%' }}>
      {intro ? (
        <View style={{ marginBottom: 8 }}>
          {renderFormattedText(intro, baseTextStyle, Colors)}
        </View>
      ) : null}

      <View
        style={{
          width: '100%',
          borderWidth: 1,
          borderColor: Colors?.line,
          marginVertical: 8,
          backgroundColor: Colors?.surface,
          borderRadius: 10,
        }}
      >
        {rows.map((row, rowIndex) => {
          const cols = row.split('|').map(col => col.trim()).filter(Boolean);

          return (
            <View
              key={rowIndex}
              style={{
                flexDirection: 'row',
                borderBottomWidth: rowIndex === rows.length - 1 ? 0 : 1,
                borderColor: Colors?.line,
              }}
            >
              {cols.map((col, colIndex) => (
                <View
                  key={colIndex}
                  style={{
                    width: colIndex === 0 ? '30%' : '35%',
                    borderRightWidth: colIndex === cols.length - 1 ? 0 : 1,
                    borderColor: Colors?.border,
                    padding: 6,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                    }}
                  >
                    {renderFormattedText(col, {
                      ...baseTextStyle,
                      fontFamily: rowIndex === 0 ? FontFamilies?.bold : baseTextStyle.fontFamily,
                      fontSize: 10,
                    }, Colors)}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </View>

      {outro ? (
        <View style={{ marginTop: 8 }}>
          {renderFormattedText(outro, baseTextStyle, Colors)}
        </View>
      ) : null}
    </View>
  );
};

export default parseFormattedText;