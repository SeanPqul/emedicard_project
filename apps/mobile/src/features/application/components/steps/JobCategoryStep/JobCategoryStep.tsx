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
  const getCardColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('food handler') || name.includes('food service')) {
      return 'Yellow';
    } else if (name.includes('skin') || name.includes('contact')) {
      return 'Pink';
    } else if (name.includes('non-food') || name.includes('security') || name.includes('office')) {
      return 'Green';
    }
    return 'Green';
  };

  const getIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('food handler') || name.includes('food service')) {
      return 'restaurant';
    } else if (name.includes('skin') || name.includes('contact')) {
      return 'hand-left';
    } else if (name.includes('non-food') || name.includes('security') || name.includes('office')) {
      return 'business-outline';
    }
    return 'briefcase';
  };

  const getJobExamples = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('food handler')) {
      return 'Restaurant staff, kitchen workers, food servers';
    } else if (name.includes('skin')) {
      return 'Barbers, massage therapists, tattoo artists';
    }
    return 'Security guards, office workers, retail staff';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Health Card Type</Text>
      <Text style={styles.subtitle}>
        Based on your job, you need a specific health card color. Choose the one that matches your work.
      </Text>

      {/* Color Guide */}
      <View style={styles.colorGuide}>
        <Text style={styles.colorGuideTitle}>Health Card Color Guide:</Text>
        <View style={styles.colorGuideRow}>
          <View style={styles.colorGuideItem}>
            <View style={[styles.colorDot, { backgroundColor: '#F1C40F' }]} />
            <Text style={styles.colorGuideText}>Yellow - Food</Text>
          </View>
          <View style={styles.colorGuideItem}>
            <View style={[styles.colorDot, { backgroundColor: '#27AE60' }]} />
            <Text style={styles.colorGuideText}>Green - Non-Food</Text>
          </View>
          <View style={styles.colorGuideItem}>
            <View style={[styles.colorDot, { backgroundColor: '#E91E63' }]} />
            <Text style={styles.colorGuideText}>Pink - Skin Contact</Text>
          </View>
        </View>
      </View>

      {/* Category Grid - 2 columns */}
      <View style={styles.categoriesGrid}>
        {jobCategoriesData.map((category, index) => {
          const isSelected = formData.jobCategory === category._id;
          const cardColor = getCardColor(category.name);
          
          return (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
                { 
                  borderColor: isSelected ? category.colorCode : '#E5E7EB',
                  borderWidth: isSelected ? moderateScale(3) : moderateScale(1),
                },
                // Center the third card if there are 3 categories total
                jobCategoriesData.length === 3 && index === 2 && styles.categoryCardCentered
              ]}
              onPress={() => setFormData({ ...formData, jobCategory: category._id })}
              activeOpacity={0.7}
            >
              {/* Card Color Indicator Badge */}
              <View style={[
                styles.colorBadge,
                { backgroundColor: category.colorCode }
              ]}>
                <Text style={styles.colorBadgeText}>{cardColor}</Text>
              </View>

              {/* Icon */}
              <View style={[
                styles.categoryIcon,
                { 
                  backgroundColor: isSelected ? `${category.colorCode}30` : `${category.colorCode}15`,
                  borderWidth: isSelected ? moderateScale(2) : 0,
                  borderColor: isSelected ? category.colorCode : 'transparent',
                }
              ]}>
                <Ionicons 
                  name={getIcon(category.name) as any} 
                  size={moderateScale(28)} 
                  color={category.colorCode} 
                />
              </View>
              
              {/* Category Name */}
              <Text style={[
                styles.categoryName,
                isSelected && { color: category.colorCode }
              ]}>
                {category.name}
              </Text>
              
              {/* Job Examples */}
              <Text style={styles.jobExamples}>
                {getJobExamples(category.name)}
              </Text>
              
              {/* Orientation Badge */}
              {(category.requireOrientation === 'Yes' || category.requireOrientation === true) && (
                <View style={styles.orientationBadge}>
                  <Ionicons name="school-outline" size={moderateScale(12)} color="#F18F01" />
                  <Text style={styles.orientationText}>Orientation Required</Text>
                </View>
              )}
              
              {/* Selected Checkmark */}
              {isSelected && (
                <View style={[
                  styles.selectedCheckmark,
                  { backgroundColor: category.colorCode }
                ]}>
                  <Ionicons name="checkmark" size={moderateScale(16)} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
      
      {errors.jobCategory && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
          <Text style={styles.errorText}>
            {errors.jobCategory}
          </Text>
        </View>
      )}

      {/* Help text for selected category */}
      {formData.jobCategory && (
        <View style={styles.helpTextContainer}>
          <Text style={styles.helpText}>
            {(() => {
              const selectedCategory = jobCategoriesData.find(cat => cat._id === formData.jobCategory);
              const categoryName = selectedCategory?.name?.toLowerCase() || '';
              
              if (selectedCategory?.requireOrientation === 'Yes' || categoryName.includes('food handler')) {
                return 'Note: Food handlers must complete a mandatory food safety orientation before card issuance.';
              } else if (categoryName.includes('non-food worker')) {
                return 'Note: Additional requirements for security guards: Neuro Exam and Drug Test.';
              } else if (categoryName.includes('skin-to-skin') || categoryName.includes('contact')) {
                return 'Note: Additional requirements for skin-to-skin contact workers: Hepatitis B Antibody Test.';
              }
              return null;
            })()}
          </Text>
        </View>
      )}
    </View>
  );
};
