import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../styles/screens/tabs-apply-forms';

type ApplicationType = 'New' | 'Renew';

interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
}

interface ApplicationTypeStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
}

export const ApplicationTypeStep: React.FC<ApplicationTypeStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Select Application Type</Text>
      <Text style={styles.stepDescription}>
        Choose whether this is a new application or renewal of an existing health card.
      </Text>
      
      <View style={styles.radioGroup}>
        {(['New', 'Renew'] as ApplicationType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.radioOption}
            onPress={() => setFormData({ ...formData, applicationType: type })}
          >
            <View style={[
              styles.radioCircle,
              formData.applicationType === type && styles.radioCircleSelected
            ]}>
              {formData.applicationType === type && (
                <View style={styles.radioInner} />
              )}
            </View>
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>{type} Application</Text>
              <Text style={styles.radioSubtitle}>
                {type === 'New' 
                  ? 'Apply for a new health card' 
                  : 'Renew your existing health card'
                }
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};