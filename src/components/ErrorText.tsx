import { FONT_SIZES, FONT_WEIGHTS } from '@/src/constants/customFontSizes';
import { verticalScale } from '@/src/utils/scaling-utils';
import React from 'react';
import { Text, View } from 'react-native';

interface ErrorTextProps {
  error: string;
  containerStyle?: any;
  textStyle?: any;
}

export const ErrorText: React.FC<ErrorTextProps> = ({
  error,
  containerStyle,
  textStyle,
}) => {
    const defaultStyles = {
  container: {
    minHeight: verticalScale(16),
  },
  text: {
    color: '#EF4444',
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
  },
};
  if (!error) return null;

  return (
    <View style={[defaultStyles.container, containerStyle]}>
      <Text style={[defaultStyles.text, textStyle]}>{error}</Text>
    </View>
  );
};