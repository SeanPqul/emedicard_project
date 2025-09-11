import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles/screens/tabs-apply-forms';
import { JobCategory } from '../../../types/domain/application';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../../styles/theme';

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
      <Text style={styles.stepHeading}>Select Your Health Card Type</Text>
      <Text style={styles.stepDescription}>
        Based on your job, you need a specific health card color. Choose the one that matches your work.
      </Text>

      {/* Color Guide */}
      <View style={{
        backgroundColor: getColor('background.secondary'),
        padding: getSpacing('md'),
        borderRadius: getBorderRadius('md'),
        marginBottom: getSpacing('lg'),
      }}>
        <Text style={{
          ...getTypography('bodySmall'),
          color: getColor('text.primary'),
          fontWeight: '600',
          marginBottom: getSpacing('sm'),
        }}>Health Card Color Guide:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: getSpacing('sm') }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#F1C40F', marginRight: 6 }} />
            <Text style={{ ...getTypography('caption'), color: getColor('text.secondary') }}>Yellow - Food</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#27AE60', marginRight: 6 }} />
            <Text style={{ ...getTypography('caption'), color: getColor('text.secondary') }}>Green - Non-Food</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#E91E63', marginRight: 6 }} />
            <Text style={{ ...getTypography('caption'), color: getColor('text.secondary') }}>Pink - Skin Contact</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.categoryGrid}>
        {jobCategoriesData?.map((category, index) => {
          const isSelected = formData.jobCategory === category._id;
          const cardColor = category.name.toLowerCase().includes('food') ? 'Yellow' :
                           category.name.toLowerCase().includes('security') || category.name.toLowerCase().includes('non-food') ? 'Green' : 'Pink';
          
          return (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
                { 
                  borderColor: isSelected ? category.colorCode : getColor('border.light'),
                  borderWidth: isSelected ? 3 : 1,
                  backgroundColor: getColor('background.primary'),
                  transform: isSelected ? [{ scale: 1.02 }] : [{ scale: 1 }],
                },
                // Center the third card if there are 3 categories total
                jobCategoriesData.length === 3 && index === 2 && styles.categoryCardCentered
              ]}
              onPress={() => {
                setFormData({ ...formData, jobCategory: category._id });
              }}
            >
              {/* Card Color Indicator */}
              <View style={{
                position: 'absolute',
                top: getSpacing('sm'),
                right: getSpacing('sm'),
                backgroundColor: category.colorCode,
                paddingHorizontal: getSpacing('xs'),
                paddingVertical: 2,
                borderRadius: getBorderRadius('xs'),
              }}>
                <Text style={{
                  ...getTypography('caption'),
                  color: getColor('text.inverse'),
                  fontWeight: '700',
                  fontSize: 10,
                }}>{cardColor}</Text>
              </View>

              <View style={[
                styles.categoryIcon,
                { 
                  backgroundColor: isSelected ? category.colorCode + '30' : category.colorCode + '15',
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? category.colorCode : 'transparent',
                }
              ]}>
                <Ionicons 
                  name={(() => {
                    const name = category.name.toLowerCase();
                    if (name.includes('food handler') || name.includes('food service')) {
                      return 'restaurant';
                    } else if (name.includes('skin') || name.includes('contact')) {
                      return 'hand-left';
                    } else if (name.includes('non-food') || name.includes('security') || name.includes('office')) {
                      return 'business-outline';
                    } else {
                      return 'briefcase';
                    }
                  })()} 
                  size={28} 
                  color={category.colorCode} 
                />
              </View>
              
              <Text style={[styles.categoryName, isSelected && { color: category.colorCode }]}>
                {category.name}
              </Text>
              
              {/* Job Examples */}
              <Text style={{
                ...getTypography('caption'),
                color: getColor('text.secondary'),
                textAlign: 'center',
                marginTop: getSpacing('xs'),
                lineHeight: 14,
              }}>
                {category.name.toLowerCase().includes('food handler') ? 'Restaurant staff, kitchen workers, food servers' :
                 category.name.toLowerCase().includes('skin') ? 'Barbers, massage therapists, tattoo artists' :
                 'Security guards, office workers, retail staff'}
              </Text>
              
              {category.requireOrientation === 'Yes' && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: getColor('accent.warningOrange') + '20',
                  padding: getSpacing('xs'),
                  borderRadius: getBorderRadius('xs'),
                  marginTop: getSpacing('sm'),
                }}>
                  <Ionicons name="school-outline" size={12} color={getColor('accent.warningOrange')} />
                  <Text style={{
                    ...getTypography('caption'),
                    color: getColor('accent.warningOrange'),
                    fontWeight: '600',
                    marginLeft: 4,
                    fontSize: 10,
                  }}>Orientation Required</Text>
                </View>
              )}
              
              {isSelected && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: category.colorCode,
                  borderRadius: getBorderRadius('full'),
                  padding: 4,
                }}>
                  <Ionicons name="checkmark" size={16} color={getColor('text.inverse')} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {errors.jobCategory && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: getSpacing('md') }}>
          <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
          <Text style={[styles.errorText, { marginLeft: getSpacing('xs') }]}>{errors.jobCategory}</Text>
        </View>
      )}

      {/* Help text based on selected category */}
      {formData.jobCategory && (
        <View style={{
          backgroundColor: getColor('accent.medicalBlue') + '10',
          padding: getSpacing('md'),
          borderRadius: getBorderRadius('md'),
          borderLeftWidth: 4,
          borderLeftColor: getColor('accent.medicalBlue'),
          marginTop: getSpacing('sm'),
        }}>
          <Text style={{
            ...getTypography('bodySmall'),
            color: getColor('accent.medicalBlue'),
            fontWeight: '600',
          }}>
            {(() => {
              const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
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