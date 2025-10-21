import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '@shared/utils/responsive';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { styles } from './ApplicationListHeader.styles';
import Svg, { Path } from 'react-native-svg';

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
    <View style={styles.headerContainer}>
      {/* Title Row */}
      <View style={styles.headerContent}>
        {/* Applications Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={HEADER_CONSTANTS.ICON_SIZE} color={HEADER_CONSTANTS.WHITE} />
        </View>

        {/* Header Title and Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Applications</Text>
          <Text style={styles.subtitle}>
            {totalCount} {totalCount === 1 ? 'application' : 'applications'} total
          </Text>
        </View>

        {/* Filter Button */}
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={onToggleFilters}
          accessibilityLabel="Toggle filters"
        >
          <Ionicons 
            name={showFilters ? 'funnel' : 'funnel-outline'} 
            size={HEADER_CONSTANTS.ACTION_BUTTON_ICON_SIZE} 
            color={showFilters ? HEADER_CONSTANTS.PRIMARY_GREEN : HEADER_CONSTANTS.WHITE}
          />
        </TouchableOpacity>
      </View>

      {/* Integrated Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={moderateScale(20)} 
          color="rgba(255, 255, 255, 0.9)" 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search applications..."
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons 
              name="close-circle" 
              size={moderateScale(20)} 
              color="rgba(255, 255, 255, 0.9)" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Curved Wave Bottom */}
      <Svg height="30" width="100%" viewBox="0 0 1440 100" style={styles.wave}>
        <Path
          fill="#F7F7F7"
          d="M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,64,960,58.7C1120,53,1280,43,1360,37.3L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
        />
      </Svg>
    </View>
  );
};
