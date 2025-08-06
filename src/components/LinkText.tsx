import { FONT_SIZES, FONT_WEIGHTS } from '@/src/utils/fontSizes';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface LinkTextProps {
  text: string;
  onPress: () => void;
  style?: any;
  color?: string;
}

export const LinkText: React.FC<LinkTextProps> = ({
  text,
  onPress,
  style,
  color = '#10B981',
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text
        style={[
          {
            color,
            fontSize: FONT_SIZES.caption,
            fontWeight: FONT_WEIGHTS.bold,
          },
          style,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};