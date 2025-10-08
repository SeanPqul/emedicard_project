import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { styles } from './ApplicationListHeader.styles';

interface ApplicationListHeaderProps {
  totalCount: number;
  searchQuery: string;
  showFilters: boolean;
  onSearchChange: (query: string) => void;
  onToggleFilters: () => void;
}

export const ApplicationListHeader: React.FC<ApplicationListHeaderProps> = ({
  totalCount,
  searchQuery,
  showFilters,
  onSearchChange,
  onToggleFilters,
}) => {
  return (
    <View style={[styles.gradientContainer, { backgroundColor: theme.colors.primary[500] }]}>
      <View style={styles.container}>
        {/* Header Title Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Applications</Text>
            <Text style={styles.subtitle}>
              {totalCount} {totalCount === 1 ? 'application' : 'applications'} total
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={onToggleFilters}
            accessibilityLabel="Toggle filters"
          >
            <Ionicons 
              name={showFilters ? 'funnel' : 'funnel-outline'} 
              size={HEADER_CONSTANTS.ICON_SIZE} 
              color={HEADER_CONSTANTS.WHITE}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={moderateScale(20)} 
            color="rgba(255, 255, 255, 0.7)" 
            style={styles.searchIcon} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons 
                name="close-circle" 
                size={moderateScale(20)} 
                color="rgba(255, 255, 255, 0.7)" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Decorative wave at bottom */}
      <View style={styles.waveContainer}>
        <View style={styles.wave} />
      </View>
    </View>
  );
};

