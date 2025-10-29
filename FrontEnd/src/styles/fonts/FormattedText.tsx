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

  // Check for bullets: -, •, or * at the start of lines
  if (text.match(/^\s*[-•*]/m)) {
    return renderWithBullets(text, baseTextStyle, Colors);
  }

  return renderFormattedText(text, baseTextStyle, Colors);
};


const renderWithMarkdownImages = (text: string, baseTextStyle: any, Colors: any) => {
  const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
  const parts = text.split(markdownImageRegex);
  
  return parts.map((part, index) => {
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
    
    if ((index - 1) % 3 === 0 && index > 0) {
      return null;
    }
    
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
        [{ text: "OK", style: "default" }]
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
  const lines = text.split('\n');
  
  return (
    <View>
      {lines.map((line, lineIndex) => {
        if (line.trim() === '') {
          return <View key={lineIndex} style={{ height: 8 }} />;
        }
        
        // Updated regex to handle bold (**text**) but not single * at line start
        const combinedRegex =
          /(\*\*.*?\*\*|https?:\/\/[^\s\)]+|www\.[^\s\)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

        const parts = line.split(combinedRegex);

        return (
          <Text key={lineIndex} style={{ ...baseTextStyle, marginBottom: 4 }}>
            {parts.map((part, index) => {
              if (!part) return null;

              let textStyle = { ...baseTextStyle };
              let content = part;

              if (part.startsWith('**') && part.endsWith('**')) {
                content = part.slice(2, -2).trim();

                if (content.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                  return (
                    <Text
                      key={index}
                      onPress={() => handleEmailPress(content)}
                      style={{
                        ...textStyle,
                        color: Colors?.primary || '#0066cc',
                        fontWeight: '500',
                        textDecorationLine: 'underline',
                      }}
                    >
                      {content}
                    </Text>
                  );
                }

                if (content.match(/^(https?:\/\/[^\s\)]+|www\.[^\s\)]+)$/)) {
                  return (
                    <Text
                      key={index}
                      onPress={() => handleUrlPress(content)}
                      style={{
                        ...textStyle,
                        color: Colors?.primary || '#0066cc',
                        fontWeight: '500',
                      }}
                    >
                      {content}
                    </Text>
                  );
                }

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
                  <Text
                    key={index}
                    onPress={() => handleEmailPress(part)}
                    style={{
                      ...textStyle,
                      color: Colors?.primary || '#0066cc',
                      fontWeight: '500',
                      textDecorationLine: 'underline',
                    }}
                  >
                    {part}
                  </Text>
                );
              }

              if (part.match(/^(https?:\/\/[^\s\)]+|www\.[^\s\)]+)$/) && !part.includes('IMAGE:')) {
                return (
                  <Text
                    key={index}
                    onPress={() => handleUrlPress(part)}
                    style={{
                      ...textStyle,
                      color: Colors?.primary || '#0066cc',
                      fontWeight: '500',
                    }}
                  >
                    {part}
                  </Text>
                );
              }

              return (
                <Text key={index} style={textStyle}>
                  {content}
                </Text>
              );
            }).filter(Boolean)}
          </Text>
        );
      })}
    </View>
  );
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
    <View>
      {lines.map((line, index) => {
        // Check if line starts with -, •, or *
        const isBullet = /^[-•*]\s*/.test(line.trim());
        // Remove the bullet marker and any following space
        const trimmed = line.trim().replace(/^[-•*]\s*/, ''); 

        return (
          <View
            key={index}
            style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}
          >
            {isBullet && (
              <Text style={{ ...baseTextStyle, marginRight: 8, marginTop: 2 }}>•</Text>
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
    <View>
      {intro ? (
        <View style={{ marginBottom: 8 }}>
          {renderFormattedText(intro, baseTextStyle, Colors)}
        </View>
      ) : null}

      <View
        style={{
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