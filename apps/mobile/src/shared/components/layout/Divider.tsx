import { FONT_SIZES, FONT_WEIGHTS } from '@shared/utils/responsive';
import { verticalScale } from '@shared/utils/responsive';
import React from 'react';
import { Text, View } from 'react-native';

interface DividerProps {
  text?: string;
  containerStyle?: any;
  lineStyle?: any;
  textStyle?: any;
}

export const Divider: React.FC<DividerProps> = ({
  text = 'or',
  containerStyle,
  lineStyle,
  textStyle,
}) => {
  return (
    <View style={[defaultStyles.container, containerStyle]}>
      <View style={[defaultStyles.line, lineStyle]} />
      <Text style={[defaultStyles.text, textStyle]}>{text}</Text>
      <View style={[defaultStyles.line, lineStyle]} />
    </View>
  );
};

const defaultStyles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: verticalScale(17),
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: verticalScale(4),
  },
  text: {
    marginHorizontal: 10,
    color: '#9CA3AF',
    fontSize: FONT_SIZES.caption,
  },
};