import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles/screens/tabs-apply-forms';
import { getBorderRadius, getColor, getSpacing, getTypography, getShadow } from '../../../styles/theme';
import { CustomTextInput } from '../../../shared/ui/CustomTextInput';

type PaymentMethod = 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall' | '';

interface ApplicationFormData {
  applicationType: 'New' | 'Renew';
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
}

interface PaymentMethodStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const paymentMethods = [
    {
      id: 'Gcash' as const,
      name: 'GCash',
      icon: 'card-outline',
      description: 'Pay instantly with GCash',
      requiresReference: true,
      bgColor: getColor('accent.primaryGreen') + '10',
      iconColor: getColor('accent.primaryGreen'),
    },
    {
      id: 'Maya' as const,
      name: 'Maya',
      icon: 'card-outline', 
      description: 'Pay instantly with Maya',
      requiresReference: true,
      bgColor: getColor('accent.medicalBlue') + '10',
      iconColor: getColor('accent.medicalBlue'),
    },
    {
      id: 'BaranggayHall' as const,
      name: 'Barangay Hall',
      icon: 'business-outline',
      description: 'Pay in person at your local Barangay Hall',
      requiresReference: false,
      bgColor: getColor('accent.warningOrange') + '10',
      iconColor: getColor('accent.warningOrange'),
    },
    {
      id: 'CityHall' as const,
      name: 'City Hall',
      icon: 'library-outline',
      description: 'Pay in person at Davao City Hall',
      requiresReference: false,
      bgColor: getColor('accent.safetyGreen') + '10',
      iconColor: getColor('accent.safetyGreen'),
    },
  ];

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Payment Method</Text>
      <Text style={styles.stepDescription}>
        Choose how you'd like to pay the ₱60 application fee (₱50 + ₱10 processing fee).
      </Text>

      {/* Fee Breakdown */}
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
        }}>Fee Breakdown:</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ ...getTypography('bodySmall'), color: getColor('text.secondary') }}>Application Fee:</Text>
          <Text style={{ ...getTypography('bodySmall'), color: getColor('text.primary') }}>₱50.00</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ ...getTypography('bodySmall'), color: getColor('text.secondary') }}>Processing Fee:</Text>
          <Text style={{ ...getTypography('bodySmall'), color: getColor('text.primary') }}>₱10.00</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: getSpacing('xs'), borderTopWidth: 1, borderTopColor: getColor('border.light') }}>
          <Text style={{ ...getTypography('bodyMedium'), color: getColor('text.primary'), fontWeight: '700' }}>Total:</Text>
          <Text style={{ ...getTypography('bodyMedium'), color: getColor('text.primary'), fontWeight: '700' }}>₱60.00</Text>
        </View>
      </View>

      {/* Payment Method Options */}
      <View style={{ gap: getSpacing('md') }}>
        {paymentMethods.map((method) => {
          const isSelected = formData.paymentMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={{
                backgroundColor: getColor('background.primary'),
                borderWidth: isSelected ? 3 : 1,
                borderColor: isSelected ? method.iconColor : getColor('border.light'),
                borderRadius: getBorderRadius('lg'),
                padding: getSpacing('md'),
                ...getShadow('small'),
                transform: isSelected ? [{ scale: 1.02 }] : [{ scale: 1 }],
              }}
              onPress={() => {
                setFormData({ 
                  ...formData, 
                  paymentMethod: method.id,
                  paymentReference: method.requiresReference ? '' : `MANUAL-${Date.now()}`
                });
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: getBorderRadius('full'),
                  backgroundColor: method.iconColor + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: getSpacing('md'),
                }}>
                  <Ionicons name={method.icon as any} size={24} color={method.iconColor} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    ...getTypography('bodyMedium'),
                    color: getColor('text.primary'),
                    fontWeight: '600',
                    marginBottom: 2,
                  }}>{method.name}</Text>
                  <Text style={{
                    ...getTypography('bodySmall'),
                    color: getColor('text.secondary'),
                    lineHeight: 16,
                  }}>{method.description}</Text>
                </View>

                {isSelected && (
                  <View style={{
                    backgroundColor: method.iconColor,
                    borderRadius: getBorderRadius('full'),
                    padding: 4,
                  }}>
                    <Ionicons name="checkmark" size={16} color={getColor('text.inverse')} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reference Number Input for Digital Payments */}
      {(formData.paymentMethod === 'Gcash' || formData.paymentMethod === 'Maya') && (
        <View style={{ marginTop: getSpacing('lg') }}>
          <Text style={styles.label}>Payment Reference Number</Text>
          <CustomTextInput
            value={formData.paymentReference || ''}
            onChangeText={(text) => setFormData({ ...formData, paymentReference: text })}
            placeholder={`Enter your ${formData.paymentMethod} reference number`}
            style={styles.input}
            autoCapitalize="none"
          />
          <Text style={{
            ...getTypography('caption'),
            color: getColor('text.secondary'),
            marginTop: getSpacing('xs'),
          }}>
            Complete your payment on {formData.paymentMethod} first, then enter the reference number here.
          </Text>
        </View>
      )}

      {/* Manual Payment Instructions */}
      {(formData.paymentMethod === 'BaranggayHall' || formData.paymentMethod === 'CityHall') && (
        <View style={{
          backgroundColor: getColor('accent.warningOrange') + '10',
          padding: getSpacing('md'),
          borderRadius: getBorderRadius('md'),
          borderLeftWidth: 4,
          borderLeftColor: getColor('accent.warningOrange'),
          marginTop: getSpacing('lg'),
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle" size={20} color={getColor('accent.warningOrange')} />
            <View style={{ flex: 1, marginLeft: getSpacing('sm') }}>
              <Text style={{
                ...getTypography('bodySmall'),
                color: getColor('accent.warningOrange'),
                fontWeight: '600',
                marginBottom: getSpacing('xs'),
              }}>Payment Instructions:</Text>
              <Text style={{
                ...getTypography('bodySmall'),
                color: getColor('accent.warningOrange'),
                lineHeight: 18,
              }}>
                After submitting this application, visit {formData.paymentMethod === 'BaranggayHall' ? 'your local Barangay Hall' : 'Davao City Hall'} to complete your ₱60 payment. Bring your application reference number.
              </Text>
            </View>
          </View>
        </View>
      )}

      {errors.paymentMethod && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: getSpacing('md') }}>
          <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
          <Text style={[styles.errorText, { marginLeft: getSpacing('xs') }]}>{errors.paymentMethod}</Text>
        </View>
      )}
    </View>
  );
};