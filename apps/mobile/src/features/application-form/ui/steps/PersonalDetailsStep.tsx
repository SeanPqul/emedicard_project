import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CustomTextInput } from '../CustomTextInput';
import { getSpacing, getTypography, getColor } from '../../styles/theme';

type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

interface PersonalDetailsStepProps {
  position: string;
  organization: string;
  civilStatus: CivilStatus;
  errors: {
    position?: string;
    organization?: string;
    civilStatus?: string;
  };
  onPositionChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onCivilStatusChange: (value: CivilStatus) => void;
}

const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = React.memo(({
  position,
  organization,
  civilStatus,
  errors,
  onPositionChange,
  onOrganizationChange,
  onCivilStatusChange,
}) => {
  return (
    <ScrollView style={{ flex: 1, padding: getSpacing('lg') }}>
      <Text style={{
        ...getTypography('h3'),
        color: getColor('text.primary'),
        marginBottom: getSpacing('sm'),
        textAlign: 'center',
      }}>
        Personal Details
      </Text>
      <Text style={{
        ...getTypography('body'),
        color: getColor('text.secondary'),
        marginBottom: getSpacing('xl'),
        textAlign: 'center',
        lineHeight: 24,
      }}>
        Please provide your job position and organization details
      </Text>

      <View style={{ gap: getSpacing('lg') }}>
        <CustomTextInput
          label="Position/Job Title"
          placeholder="e.g., Food Handler, Security Guard"
          value={position}
          onChangeText={onPositionChange}
          error={errors.position}
          required
        />

        <CustomTextInput
          label="Organization/Company"
          placeholder="e.g., ABC Restaurant, XYZ Mall"
          value={organization}
          onChangeText={onOrganizationChange}
          error={errors.organization}
          required
        />

        <View>
          <Text style={{
            ...getTypography('bodySmall'),
            fontWeight: '600',
            color: getColor('text.primary'),
            marginBottom: getSpacing('sm'),
          }}>
            Civil Status
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: getSpacing('sm'),
          }}>
            {CIVIL_STATUS_OPTIONS.map((status) => (
              <CustomTextInput
                key={status}
                label={status}
                value={civilStatus}
                onChangeText={() => onCivilStatusChange(status)}
                variant="radio"
                selected={civilStatus === status}
                style={{ flex: 1, minWidth: '45%' }}
              />
            ))}
          </View>
          {errors.civilStatus && (
            <Text style={{
              ...getTypography('caption'),
              color: getColor('semantic.error'),
              marginTop: getSpacing('xs'),
            }}>
              {errors.civilStatus}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
});