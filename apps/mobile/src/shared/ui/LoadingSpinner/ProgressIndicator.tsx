import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';
import { ProgressIndicatorProps } from './types';

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  color,
  textStyle,
}) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progress}%`, 
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, textStyle]}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
};
