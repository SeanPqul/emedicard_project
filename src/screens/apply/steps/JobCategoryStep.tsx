import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles/screens/tabs-apply-forms';
import { JobCategory } from '../../../types/domain/application';

type ApplicationType = 'New' | 'Renew';

interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
}

interface JobCategoryStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
  jobCategoriesData: JobCategory[];
}

export const JobCategoryStep: React.FC<JobCategoryStepProps> = ({
  formData,
  setFormData,
  errors,
  jobCategoriesData,
}) => {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Select Job Category</Text>
      <Text style={styles.stepDescription}>
        Choose the category that best describes your job. Yellow for Food Handlers, Green for Non-Food Workers, and Pink for Skin-to-Skin Contact Jobs
      </Text>
      
      <View style={styles.categoryGrid}>
        {jobCategoriesData?.map((category, index) => (
          <TouchableOpacity
            key={category._id}
            style={[
              styles.categoryCard,
              formData.jobCategory === category._id && styles.categoryCardSelected,
              { borderColor: category.colorCode || '#999' },
              // If it's the third item and there are 3 items total, center it
              jobCategoriesData.length === 3 && index === 2 && styles.categoryCardCentered
            ]}
            onPress={() => setFormData({ ...formData, jobCategory: category._id })}
          >
            <View style={[
              styles.categoryIcon,
              { backgroundColor: (category.colorCode || '#999') + '20' }
            ]}>
              <Ionicons 
                name={category.name?.toLowerCase().includes('food') ? 'restaurant' : 'shield'} 
                size={24} 
                color={category.colorCode || '#999'} 
              />
            </View>
            <Text style={styles.categoryName}>{category.name || 'Unknown Category'}</Text>
            {category.requireOrientation === 'Yes' && (
              <Text style={styles.categoryRequirement}>
                Food Safety Orientation Required
              </Text>
            )}
            {formData.jobCategory === category._id && (
              <View style={styles.categorySelected}>
                <Ionicons name="checkmark-circle" size={20} color={category.colorCode || '#999'} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {errors.jobCategory && (
        <Text style={styles.errorText}>{errors.jobCategory}</Text>
      )}
    </View>
  );
};