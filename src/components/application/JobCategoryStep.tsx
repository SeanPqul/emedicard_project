import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../../styles/theme';
import { JobCategory } from '../../types/domain/application';

interface JobCategoryStepProps {
  jobCategories: JobCategory[];
  selectedJobCategory: string;
  onJobCategorySelect: (categoryId: string) => void;
}

const JobCategoryStepComponent: React.FC<JobCategoryStepProps> = ({
  jobCategories,
  selectedJobCategory,
  onJobCategorySelect,
}) => {
  return (
    <View style={{ flex: 1, padding: getSpacing('lg') }}>
      <Text style={{
        ...getTypography('h3'),
        color: getColor('text.primary'),
        marginBottom: getSpacing('sm'),
        textAlign: 'center',
      }}>
        Job Category
      </Text>
      <Text style={{
        ...getTypography('body'),
        color: getColor('text.secondary'),
        marginBottom: getSpacing('xl'),
        textAlign: 'center',
        lineHeight: 24,
      }}>
        Choose the category that best describes your job. Yellow for Food Handlers, Green for Non-Food Workers, and Pink for Skin-to-Skin Contact Jobs
      </Text>
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: getSpacing('md'),
        }}
      >
        {jobCategories?.map((category, index) => (
          <TouchableOpacity
            key={category._id}
            style={{
              width: '47%',
              backgroundColor: selectedJobCategory === category._id 
                ? getColor('primary.50')
                : getColor('background.primary'),
              borderWidth: 2,
              borderColor: selectedJobCategory === category._id 
                ? getColor('primary.500')
                : category.colorCode || getColor('border.light'),
              borderRadius: getBorderRadius('lg'),
              padding: getSpacing('lg'),
              alignItems: 'center',
              minHeight: 120,
              marginBottom: getSpacing('md'),
              ...getShadow('medium'),
            }}
            onPress={() => onJobCategorySelect(category._id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedJobCategory === category._id }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: getBorderRadius('full'),
              backgroundColor: category.colorCode || getColor('primary.500'),
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: getSpacing('sm'),
              opacity: selectedJobCategory === category._id ? 1 : 0.7,
            }}>
              <Ionicons name="briefcase" size={24} color={getColor('text.inverse')} />
            </View>
            
            <Text style={{
              ...getTypography('bodySmall'),
              fontWeight: '600',
              color: selectedJobCategory === category._id 
                ? getColor('primary.500')
                : getColor('text.primary'),
              textAlign: 'center',
              marginBottom: getSpacing('xs'),
            }}>
              {category.name}
            </Text>
            
            {category.requireOrientation && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: getColor('semantic.warning') + '20',
                paddingHorizontal: getSpacing('xs'),
                paddingVertical: getSpacing('xs') / 2,
                borderRadius: getBorderRadius('sm'),
              }}>
                <Ionicons 
                  name="school-outline" 
                  size={12} 
                  color={getColor('semantic.warning')} 
                  style={{ marginRight: getSpacing('xs') / 2 }} 
                />
                <Text style={{
                  ...getTypography('caption'),
                  color: getColor('semantic.warning'),
                  fontSize: 10,
                }}>
                  Orientation Required
                </Text>
              </View>
            )}
            
            {selectedJobCategory === category._id && (
              <View style={{
                position: 'absolute',
                top: getSpacing('sm'),
                right: getSpacing('sm'),
              }}>
                <Ionicons name="checkmark-circle" size={20} color={getColor('primary.500')} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

JobCategoryStepComponent.displayName = 'JobCategoryStep';

export const JobCategoryStep = React.memo(JobCategoryStepComponent);