import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../../styles/theme';

type ApplicationType = 'New' | 'Renew';

interface ApplicationTypeStepProps {
  selectedType: ApplicationType;
  onTypeSelect: (type: ApplicationType) => void;
}

const ApplicationTypeStepComponent: React.FC<ApplicationTypeStepProps> = ({
  selectedType,
  onTypeSelect,
}) => {
  const applicationTypes: { type: ApplicationType; title: string; description: string; icon: string }[] = [
    {
      type: 'New',
      title: 'New Application',
      description: 'Apply for your first health card',
      icon: 'add-circle-outline',
    },
    {
      type: 'Renew',
      title: 'Renewal',
      description: 'Renew your existing health card',
      icon: 'refresh-outline',
    },
  ];

  return (
    <View style={{ flex: 1, padding: getSpacing('lg') }}>
      <Text style={{
        ...getTypography('h3'),
        color: getColor('text.primary'),
        marginBottom: getSpacing('sm'),
        textAlign: 'center',
      }}>
        Application Type
      </Text>
      <Text style={{
        ...getTypography('body'),
        color: getColor('text.secondary'),
        marginBottom: getSpacing('xl'),
        textAlign: 'center',
        lineHeight: 24,
      }}>
        Choose whether you&apos;re applying for a new health card or renewing an existing one
      </Text>

      <View style={{ gap: getSpacing('md') }}>
        {applicationTypes.map((appType) => (
          <TouchableOpacity
            key={appType.type}
            style={{
              backgroundColor: selectedType === appType.type 
                ? getColor('primary.50') 
                : getColor('background.primary'),
              borderWidth: 2,
              borderColor: selectedType === appType.type 
                ? getColor('primary.500') 
                : getColor('border.light'),
              borderRadius: getBorderRadius('lg'),
              padding: getSpacing('lg'),
              flexDirection: 'row',
              alignItems: 'center',
              ...getShadow('medium'),
            }}
            onPress={() => onTypeSelect(appType.type)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedType === appType.type }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: getBorderRadius('full'),
              backgroundColor: selectedType === appType.type 
                ? getColor('primary.500') 
                : getColor('gray.200'),
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: getSpacing('md'),
            }}>
              <Ionicons 
                name={appType.icon as any} 
                size={24} 
                color={selectedType === appType.type 
                  ? getColor('text.inverse') 
                  : getColor('text.secondary')} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                ...getTypography('body'),
                fontWeight: '600',
                color: selectedType === appType.type 
                  ? getColor('primary.500') 
                  : getColor('text.primary'),
                marginBottom: getSpacing('xs'),
              }}>
                {appType.title}
              </Text>
              <Text style={{
                ...getTypography('bodySmall'),
                color: getColor('text.secondary'),
              }}>
                {appType.description}
              </Text>
            </View>
            {selectedType === appType.type && (
              <Ionicons name="checkmark-circle" size={24} color={getColor('primary.500')} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

ApplicationTypeStepComponent.displayName = 'ApplicationTypeStep';

export const ApplicationTypeStep = React.memo(ApplicationTypeStepComponent);