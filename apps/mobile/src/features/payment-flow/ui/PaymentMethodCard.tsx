import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethodCardProps {
  method: 'BaranggayHall' | 'CityHall' | 'Gcash' | 'Maya';
  amount: number;
  serviceFee: number;
  selected?: boolean;
  onPress?: () => void;
}

export default function PaymentMethodCard({ 
  method, 
  amount, 
  serviceFee, 
  selected = false,
  onPress 
}: PaymentMethodCardProps) {
  
  const getMethodDetails = () => {
    switch (method) {
      case 'BaranggayHall':
        return {
          title: 'Barangay Hall',
          subtitle: 'Pay in cash at your local Barangay Hall',
          description: 'Get Official Receipt (OR) - Upload required',
          icon: 'business-outline' as const,
          color: '#28A745'
        };
      case 'CityHall':
        return {
          title: 'City Hall (Sangunian)',
          subtitle: 'Pay in cash at City Hall Sangunian Office',
          description: 'Get Official Receipt (OR) - Upload required',
          icon: 'business-outline' as const,
          color: '#2E86AB'
        };
      case 'Gcash':
        return {
          title: 'GCash',
          subtitle: 'Mobile payment via GCash app',
          description: 'Instant payment processing',
          icon: 'phone-portrait-outline' as const,
          color: '#007CE2'
        };
      case 'Maya':
        return {
          title: 'Maya (PayMaya)',
          subtitle: 'Mobile payment via Maya app',
          description: 'Instant payment processing',
          icon: 'phone-portrait-outline' as const,
          color: '#00D4AA'
        };
      default:
        return {
          title: method,
          subtitle: '',
          description: '',
          icon: 'card-outline' as const,
          color: '#6C757D'
        };
    }
  };

  const details = getMethodDetails();
  const total = amount + serviceFee;

  return (
    <View style={[styles.container, selected && styles.selected]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: details.color + '20' }]}>
          <Ionicons name={details.icon} size={24} color={details.color} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{details.title}</Text>
          <Text style={styles.subtitle}>{details.subtitle}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>₱{total}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.description}>{details.description}</Text>
        
        {(method === 'BaranggayHall' || method === 'CityHall') && (
          <View style={styles.requirementNote}>
            <Ionicons name="information-circle-outline" size={16} color="#856404" />
            <Text style={styles.requirementText}>
              You must upload your Official Receipt (OR) after payment
            </Text>
          </View>
        )}
        
        <View style={styles.breakdown}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Application Fee:</Text>
            <Text style={styles.breakdownValue}>₱{amount}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Service Fee:</Text>
            <Text style={styles.breakdownValue}>₱{serviceFee}</Text>
          </View>
          <View style={[styles.breakdownItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₱{total}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selected: {
    borderColor: '#2E86AB',
    borderWidth: 2,
    backgroundColor: '#F8FBFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  details: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  description: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
  },
  requirementNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  breakdown: {
    marginTop: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  totalItem: {
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '700',
  },
});
