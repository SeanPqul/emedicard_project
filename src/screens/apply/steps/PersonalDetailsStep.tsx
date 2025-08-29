import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../../../styles/screens/tabs-apply-forms';
import { CustomTextInput } from '../../../components/';

type ApplicationType = 'New' | 'Renew';
type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

interface PersonalDetailsStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
}

const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Personal Details</Text>
      <Text style={styles.stepDescription}>
        Provide your job position, organization, and civil status.
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Position/Job Title</Text>
        <CustomTextInput
          value={formData.position}
          onChangeText={(text) => setFormData({ ...formData, position: text })}
          placeholder="e.g., Food Server, Security Guard"
          style={styles.input}
        />
        {errors.position && (
          <Text style={styles.errorText}>{errors.position}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Organization/Company</Text>
        <CustomTextInput
          value={formData.organization}
          onChangeText={(text) => setFormData({ ...formData, organization: text })}
          placeholder="e.g., ABC Restaurant, XYZ Security Agency"
          style={styles.input}
        />
        {errors.organization && (
          <Text style={styles.errorText}>{errors.organization}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Civil Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.civilStatusContainer}>
          {CIVIL_STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.civilStatusOption,
                formData.civilStatus === status && styles.civilStatusOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, civilStatus: status })}
            >
              <Text style={[
                styles.civilStatusText,
                formData.civilStatus === status && styles.civilStatusTextSelected
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};