import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Id } from '@backend/convex/_generated/dataModel';

// Features
import { usePayments } from '@features/payment';
import { useApplications } from '@features/application';
import {
  PAYMENT_METHODS,
  DIGITAL_PAYMENT_METHODS,
  MANUAL_PAYMENT_METHODS,
  type PaymentMethodId,
  type UploadedReceipt,
} from '@features/payment/constants';
import { CustomButton } from '@shared/components';
import { getColor } from '@shared/styles/theme';
import { styles } from './PaymentWidget.styles';

interface PaymentWidgetProps {
  formId: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export function PaymentWidget({
  formId,
  onPaymentSuccess,
  onPaymentError,
}: PaymentWidgetProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [uploadedReceipt, setUploadedReceipt] = useState<UploadedReceipt | null>(null);

  const { 
    data: { existingPayment }, 
    mutations: { createPayment, updatePaymentStatus, generateUploadUrl },
    isLoadingApplicationPayment 
  } = usePayments(formId);

  const { data: { form }, isLoadingForm } = useApplications(formId);

  const getSelectedMethodDetails = () => {
    return PAYMENT_METHODS.find(method => method.id === selectedPaymentMethod);
  };

  const calculateTotal = () => {
    const method = getSelectedMethodDetails();
    if (!method) return 0;
    return method.fee + (method.serviceFee || 0);
  };

  const uploadReceiptToStorage = async (receipt: UploadedReceipt) => {
    try {
      const uploadUrl = await generateUploadUrl();
      
      const formData = new FormData();
      formData.append('file', {
        uri: receipt.uri,
        name: receipt.name,
        type: receipt.type,
      } as any);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await response.json();
      return storageId;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Select a Payment Method', 'Please select a payment method before proceeding.');
      return;
    }

    const method = getSelectedMethodDetails();
    if (!method) {
      Alert.alert('Error', 'Invalid payment method selected.');
      return;
    }

    // Validate requirements for different payment methods
    if (MANUAL_PAYMENT_METHODS.includes(method.id as any)) {
      if (!uploadedReceipt) {
        Alert.alert('Receipt Required', 'Please upload a receipt for manual payment methods.');
        return;
      }
    }

    if (DIGITAL_PAYMENT_METHODS.includes(method.id as any) && !referenceNumber.trim()) {
      Alert.alert('Reference Number Required', 'Please enter the reference number for your payment.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let receiptId: Id<"_storage"> | undefined;
      
      // Upload receipt if provided
      if (uploadedReceipt) {
        receiptId = await uploadReceiptToStorage(uploadedReceipt);
      }

      // Generate reference number if not provided
      const finalReferenceNumber = referenceNumber.trim() || `${method.id}-${Date.now()}`;

      // Create payment record
      const paymentId = await createPayment({
        applicationId: formId as Id<"applications">,
        amount: method.fee,
        serviceFee: method.serviceFee || 0,
        netAmount: calculateTotal(),
        paymentMethod: method.id as any,
        referenceNumber: finalReferenceNumber,
        receiptStorageId: receiptId,
      });

      // For digital payments, mark as complete immediately
      if (DIGITAL_PAYMENT_METHODS.includes(method.id as any)) {
        await updatePaymentStatus(paymentId, 'Complete');
      }

      setIsSubmitting(false);
      
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      
      // Navigate to application details instead of using back()
      // This prevents navigation errors when there's no previous screen
      setTimeout(() => {
        router.replace(`/(screens)/(application)/${formId}`);
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Payment error:', error);
      
      if (onPaymentError) {
        onPaymentError(error instanceof Error ? error.message : 'Payment failed');
      }
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Payment Method Selection */}
      <Text style={styles.sectionTitle}>Select Payment Method</Text>
      <View style={styles.paymentGrid}>
        {PAYMENT_METHODS.map(method => (
          <TouchableOpacity 
            key={method.id} 
            style={[
              styles.paymentOption,
              selectedPaymentMethod === method.id && styles.paymentOptionSelected
            ]} 
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Ionicons 
              name={method.icon as any} 
              size={32} 
              color={selectedPaymentMethod === method.id ? getColor('success.main') : getColor('text.secondary')} 
            />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentName}>{method.name}</Text>
              <Text style={styles.paymentDescription}>{method.description}</Text>
              <Text style={styles.paymentFee}>₱{method.fee}</Text>
            </View>
            {selectedPaymentMethod === method.id && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={getColor('success.main')} 
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment Details */}
      {selectedPaymentMethod && (
        <View style={styles.paymentDetailsContainer}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.feeBreakdown}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Base Fee:</Text>
              <Text style={styles.feeValue}>₱{getSelectedMethodDetails()?.fee}</Text>
            </View>
            {getSelectedMethodDetails()?.serviceFee && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Processing Fee:</Text>
                <Text style={styles.feeValue}>₱{getSelectedMethodDetails()?.serviceFee}</Text>
              </View>
            )}
            <View style={[styles.feeRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₱{calculateTotal()}</Text>
            </View>
          </View>
          
          {/* Reference Number Input for Digital Payments */}
          {selectedPaymentMethod && DIGITAL_PAYMENT_METHODS.includes(selectedPaymentMethod as any) && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reference Number *</Text>
              <TextInput
                style={styles.textInput}
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                placeholder="Enter transaction reference number"
                placeholderTextColor={getColor('text.secondary')}
              />
            </View>
          )}

          {/* Payment Instructions */}
          <PaymentInstructions 
            paymentMethod={selectedPaymentMethod} 
            amount={calculateTotal()}
          />
        </View>
      )}
      
      {/* Existing Payment Display */}
      {existingPayment && (
        <View style={styles.existingPaymentContainer}>
          <Text style={styles.sectionTitle}>Existing Payment</Text>
          <View style={styles.paymentStatusCard}>
            <View style={styles.paymentStatusHeader}>
              <Text style={styles.paymentStatusText}>Status: {existingPayment.paymentStatus}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: existingPayment.paymentStatus === 'Complete' ? getColor('success.main') : getColor('warning.main') }
              ]}>
                <Text style={styles.statusBadgeText}>{existingPayment.paymentStatus}</Text>
              </View>
            </View>
            <Text style={styles.paymentReference}>Reference: {existingPayment.referenceNumber}</Text>
            <Text style={styles.paymentAmount}>Amount: ₱{existingPayment.netAmount}</Text>
          </View>
        </View>
      )}

      <View style={styles.submitContainer}>
        <CustomButton 
          title={isSubmitting ? 'Processing...' : 'Proceed to Pay'}
          onPress={handlePayment}
          disabled={isSubmitting || !selectedPaymentMethod || !!existingPayment}
          size="large"
          buttonStyle={styles.paymentButton}
        />
      </View>
    </ScrollView>
  );
}

function PaymentInstructions({ 
  paymentMethod, 
  amount 
}: { 
  paymentMethod: string; 
  amount: number;
}) {
  return (
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionsTitle}>Payment Instructions:</Text>
      {paymentMethod === 'Maya' && (
        <Text style={styles.instructionsText}>
          1. Open your Maya app{"\n"}
          2. Send ₱{amount} to 09123456789{"\n"}
          3. Enter the reference number above
        </Text>
      )}
      {paymentMethod === 'BaranggayHall' && (
        <Text style={styles.instructionsText}>
          1. Visit your Barangay Hall{"\n"}
          2. Pay ₱{amount} for health card processing{"\n"}
          3. Upload the receipt using the button above
        </Text>
      )}
      {paymentMethod === 'CityHall' && (
        <Text style={styles.instructionsText}>
          1. Visit the Sanggunian Hall{"\n"}
          2. Pay ₱{amount} for health card processing{"\n"}
          3. Upload the receipt using the button above
        </Text>
      )}
    </View>
  );
}
