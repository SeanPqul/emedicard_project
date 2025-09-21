import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobCategoryStepProps } from './JobCategoryStep.types';
import styles from './JobCategoryStep.styles';
import { getColor } from '@/src/styles/theme';

export const JobCategoryStep: React.FC<JobCategoryStepProps> = ({ 
  value, 
  onChange, 
  categories = [],
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={getColor('primary.500')} />
        <Text style={styles.loadingText}>Loading job categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Job Category</Text>
      <Text style={styles.subtitle}>
        Choose the category that best matches your occupation
      </Text>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                value === category._id && styles.categoryCardSelected
              ]}
              onPress={() => onChange(category._id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.colorIndicator,
                { backgroundColor: category.colorCode }
              ]} />
              
              <Text style={[
                styles.categoryName,
                value === category._id && styles.categoryNameSelected
              ]}>
                {category.name}
              </Text>

              {category.requireOrientation === 'Yes' && (
                <View style={styles.orientationBadge}>
                  <Ionicons 
                    name="school-outline" 
                    size={12} 
                    color={getColor('accent.warningOrange')} 
                  />
                  <Text style={styles.orientationText}>Orientation</Text>
                </View>
              )}

              <View style={[
                styles.checkmark,
                value === category._id && styles.checkmarkSelected
              ]}>
                {value === category._id && (
                  <Ionicons 
                    name="checkmark" 
                    size={16} 
                    color={getColor('white')} 
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {categories.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="briefcase-outline" 
              size={48} 
              color={getColor('text.secondary')} 
            />
            <Text style={styles.emptyText}>No job categories available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
