import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannerHeaderProps } from './types';
import { styles } from './styles';
import { getColor } from '../../styles/theme';

export const ScannerHeader: React.FC<ScannerHeaderProps> = ({
  title,
  subtitle,
  onClose,
  flashEnabled = false,
  onFlashToggle,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessibilityLabel="Close scanner"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={28} color={getColor('ui.white')} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      
      {onFlashToggle && (
        <TouchableOpacity
          style={styles.flashButton}
          onPress={onFlashToggle}
          accessibilityLabel={`Turn flash ${flashEnabled ? 'off' : 'on'}`}
          accessibilityRole="button"
        >
          <Ionicons 
            name={flashEnabled ? "flash" : "flash-off"} 
            size={24} 
            color={flashEnabled ? getColor('accent.highlightYellow') : getColor('ui.white')} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
