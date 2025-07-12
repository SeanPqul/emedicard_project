import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CustomButton, EmptyState } from '../../../src/components';

const { width } = Dimensions.get('window');

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function PaymentScreen() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { id: 'gcash', name: 'Gcash', description: 'Pay with GCash', icon: 'wallet' },
    { id: 'maya', name: 'Maya', description: 'Pay with Maya', icon: 'card' },
    { id: 'barangay_hall', name: 'Barangay Hall', description: 'Pay at the Barangay Hall', icon: 'home' },
    { id: 'city_hall', name: 'City Hall', description: 'Pay at the City Hall', icon: 'business' },
  ];

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Select a Payment Method', 'Please select a payment method before proceeding.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitting(false);
      Alert.alert('Payment Successful', 'Your payment has been processed successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Payment error:', error);
      Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <BaseScreenLayout>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {paymentMethods.map(method => (
          <TouchableOpacity 
            key={method.id} 
            style={styles.paymentOption} 
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Ionicons 
              name={method.icon} 
              size={24} 
              color={selectedPaymentMethod === method.id ? '#2E86AB' : '#6C757D'} 
            />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentName}>{method.name}</Text>
              <Text style={styles.paymentDescription}>{method.description}</Text>
            </View>
            {selectedPaymentMethod === method.id && (
              <Ionicons name="checkmark" size={20} color="#28A745" />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.submitContainer}>
          <CustomButton 
            title={isSubmitting ? 'Processing...' : 'Proceed to Pay'}
            onPress={handlePayment}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </BaseScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  submitContainer: {
    paddingVertical: 20,
  },
});

