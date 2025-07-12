import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ActionButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isPrimary?: boolean;
  style?: any;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  isPrimary = false,
  style 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isPrimary && styles.primaryContainer,
        style
      ]} 
      onPress={onPress}
    >
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={isPrimary ? "#FFFFFF" : "#2E86AB"} 
      />
      <Text style={[
        styles.title,
        isPrimary && styles.primaryTitle
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.subtitle,
        isPrimary && styles.primarySubtitle
      ]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryContainer: {
    backgroundColor: '#2E86AB',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginTop: 8,
    textAlign: 'center',
  },
  primaryTitle: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
    textAlign: 'center',
  },
  primarySubtitle: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
});
