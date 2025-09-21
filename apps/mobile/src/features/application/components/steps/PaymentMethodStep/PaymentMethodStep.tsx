import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CustomTextInput } from '@/src/shared/components';
import { getBorderRadius, getColor, getSpacing, getTypography, getShadow } from '@/src/styles/theme';

import { PaymentMethodStepProps, PaymentMethodOption, PaymentMethod } from './PaymentMethodStep.types';
import { styles } from './PaymentMethodStep.styles';

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const paymentMethods: PaymentMethodOption[] = [
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

  const handleMethodSelect = (method: PaymentMethod) => {
    const selectedMethod = paymentMethods.find(m => m.id === method);
    setFormData({ 
      ...formData, 
      paymentMethod: method,
      paymentReference: selectedMethod?.requiresReference ? '' : `MANUAL-${Date.now()}`
    });
  };

  const handleReferenceChange = (text: string) => {
    setFormData({ ...formData, paymentReference: text });
  };

  const renderPaymentMethodCard = (method: PaymentMethodOption) => {
    const isSelected = formData.paymentMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.methodCard,
          isSelected && { ...styles.selectedCard, borderColor: method.iconColor },
          { transform: isSelected ? [{ scale: 1.02 }] : [{ scale: 1 }] }
        ]}
        onPress={() => handleMethodSelect(method.id)}
      >
        <View style={styles.methodCardContent}>
          <View style={[styles.methodIcon, { backgroundColor: method.iconColor + '20' }]}>
            <Ionicons name={method.icon as any} size={24} color={method.iconColor} />
          </View>
          
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{method.name}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>
          </View>

          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: method.iconColor }]}>
              <Ionicons name="checkmark" size={16} color={getColor('text.inverse')} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Payment Method</Text>
      <Text style={styles.description}>
        Choose how you'd like to pay the ₱60 application fee (₱50 + ₱10 processing fee).
      </Text>

      {/* Fee Breakdown */}
      <View style={styles.feeBreakdownContainer}>
        <Text style={styles.feeBreakdownTitle}>Fee Breakdown:</Text>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Application Fee:</Text>
          <Text style={styles.feeValue}>₱50.00</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Processing Fee:</Text>
          <Text style={styles.feeValue}>₱10.00</Text>
        </View>
        <View style={styles.feeRowTotal}>
          <Text style={styles.feeTotalLabel}>Total:</Text>
          <Text style={styles.feeTotalValue}>₱60.00</Text>
        </View>
      </View>

      {/* Payment Method Options */}
      <View style={styles.methodsContainer}>
        {paymentMethods.map(renderPaymentMethodCard)}
      </View>

      {/* Reference Number Input for Digital Payments */}
      {(formData.paymentMethod === 'Gcash' || formData.paymentMethod === 'Maya') && (
        <View style={styles.referenceContainer}>
          <Text style={styles.referenceLabel}>Payment Reference Number</Text>
          <CustomTextInput
            value={formData.paymentReference || ''}
            onChangeText={handleReferenceChange}
            placeholder={`Enter your ${formData.paymentMethod} reference number`}
            style={styles.referenceInput}
            autoCapitalize="none"
          />
          <Text style={styles.referenceNote}>
            Complete your payment on {formData.paymentMethod} first, then enter the reference number here.
          </Text>
        </View>
      )}

      {/* Manual Payment Instructions */}
      {(formData.paymentMethod === 'BaranggayHall' || formData.paymentMethod === 'CityHall') && (
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsContent}>
            <Ionicons name="information-circle" size={20} color={getColor('accent.warningOrange')} />
            <View style={styles.instructionsText}>
              <Text style={styles.instructionsTitle}>Payment Instructions:</Text>
              <Text style={styles.instructionsBody}>
                After submitting this application, visit {formData.paymentMethod === 'BaranggayHall' ? 'your local Barangay Hall' : 'Davao City Hall'} to complete your ₱60 payment. Bring your application reference number.
              </Text>
            </View>
          </View>
        </View>
      )}

      {errors.paymentMethod && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
          <Text style={styles.errorText}>{errors.paymentMethod}</Text>
        </View>
      )}
    </View>
  );
};
