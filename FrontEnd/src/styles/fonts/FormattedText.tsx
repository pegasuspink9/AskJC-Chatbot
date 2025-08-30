import React from 'react';
import { Text, View } from 'react-native';
import { FontFamilies, FontSizes } from '../../constants/theme';

const parseFormattedText = (
  text: string,
  Colors: any,
  isUser: boolean,
  baseTextStyle: any
) => {
  if (text.includes('|')) {
    return renderWithTable(text, baseTextStyle, Colors);
  }

  if (text.match(/^\s*[-•]/m)) {
    return renderWithBullets(text, baseTextStyle);
  }

  return renderFormattedText(text, baseTextStyle);
};

const renderFormattedText = (text: string, baseTextStyle: any) => {
  const formatRegex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const parts = text.split(formatRegex);

  return parts
    .map((part, index) => {
      if (!part) return null;

      let textStyle = { ...baseTextStyle };
      let content = part;

      if (part.startsWith('**') && part.endsWith('**')) {
        content = part.slice(2, -2);
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
    })
    .filter(Boolean);
};

const renderWithBullets = (text: string, baseTextStyle: any) => {
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

            <Text style={{ flex: 1 }}>
              {renderFormattedText(trimmed, baseTextStyle)}
            </Text>
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
    return renderFormattedText(text, baseTextStyle);
  }

  const intro = lines.slice(0, firstTableIndex).join('\n').trim();
  const tableLines = lines.slice(firstTableIndex, lastTableIndex + 1);
  const outro = lines.slice(lastTableIndex + 1).join('\n').trim();

  const rows = tableLines.filter((_, i) => i !== 1);

  return (
    <View style={{ width: '100%' }}>
      {intro ? (
        <Text style={{ ...baseTextStyle, marginBottom: 8 }}>{intro}</Text>
      ) : null}

      <View
        style={{
          width: '100%',
          borderWidth: 1,
          borderColor: Colors?.border || '#000',
          marginVertical: 8,
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
                    padding: 6,
                    borderRightWidth: colIndex === cols.length - 1 ? 0 : 1,
                    borderColor: Colors?.border || '#000',
                  }}
                >
                  <Text
                    style={{
                      ...baseTextStyle,
                      fontFamily:
                        rowIndex === 0
                          ? FontFamilies?.bold
                          : baseTextStyle.fontFamily,
                      fontSize: 10,
                      flexWrap: 'wrap',
                    }}
                    numberOfLines={0}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.7}
                  >
                    {col}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>

      {outro ? (
        <View style={{ marginTop: 8 }}>
          {renderFormattedText(outro, baseTextStyle)}
        </View>
      ) : null}
    </View>
  );
};

export default parseFormattedText;
