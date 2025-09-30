import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobCategoryStepProps } from './JobCategoryStep.types';
import styles from './JobCategoryStep.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';

export const JobCategoryStep: React.FC<JobCategoryStepProps> = ({
  formData,
  setFormData,
  errors,
  jobCategoriesData,
}) => {
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
          {jobCategoriesData.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                formData.jobCategory === category._id && styles.categoryCardSelected
              ]}
              onPress={() => setFormData({ ...formData, jobCategory: category._id })}
              activeOpacity={0.7}
            >
              <View style={[
                styles.colorIndicator,
                { backgroundColor: category.colorCode }
              ]} />
              
              <Text style={[
                styles.categoryName,
                formData.jobCategory === category._id && styles.categoryNameSelected
              ]}>
                {category.name}
              </Text>

              {(category.requireOrientation === true || category.requireOrientation === 'yes') && (
                <View style={styles.orientationBadge}>
                  <Ionicons 
                    name="school-outline" 
                    size={moderateScale(12)} 
                    color={theme.colors.semantic.warning} 
                  />
                  <Text style={styles.orientationText}>Orientation</Text>
                </View>
              )}

              <View style={[
                styles.checkmark,
                formData.jobCategory === category._id && styles.checkmarkSelected
              ]}>
                {formData.jobCategory === category._id && (
                  <Ionicons 
                    name="checkmark" 
                    size={moderateScale(16)} 
                    color={theme.colors.background.primary} 
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {jobCategoriesData.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="briefcase-outline" 
              size={moderateScale(48)} 
              color={theme.colors.text.secondary} 
            />
            <Text style={styles.emptyText}>No job categories available</Text>
          </View>
        )}
      </ScrollView>
      
      {errors.jobCategory && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
          <Text style={styles.errorText}>
            {errors.jobCategory}
          </Text>
        </View>
      )}
    </View>
  );
};
