import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApplicationDetails, PaymentMethod } from '@entities/application';
import { CustomButton } from '@shared/components';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './ApplicationDetailWidget.styles';
import { theme } from '@shared/styles/theme';

// UI constants for status colors
const STATUS_COLORS = {
  'Pending Payment': '#FFA500',
  'Submitted': '#2E86AB',
  'Under Review': '#F18F01',
  'Approved': '#28A745',
  'Rejected': '#DC3545',
} as const;

interface ApplicationDetailWidgetProps {
  application: ApplicationDetails;
  refreshing: boolean;
  onRefresh: () => void;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  isPaymentProcessing: boolean;
  isPaymentStatusProcessing: boolean;
  getStatusIcon: (status: string) => string;
  getUrgencyColor: (daysLeft: number | null) => string;
}

export function ApplicationDetailWidget({
  application,
  refreshing,
  onRefresh,
  onPaymentMethodSelect,
  isPaymentProcessing,
  isPaymentStatusProcessing,
  getStatusIcon,
  getUrgencyColor,
}: ApplicationDetailWidgetProps) {
  const statusColor = STATUS_COLORS[application.status as keyof typeof STATUS_COLORS];
  
  const getDaysUntilDeadline = (deadline?: number) => {
    if (!deadline) return null;
    const now = Date.now();
    const diff = deadline - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };
  
  const daysUntilDeadline = getDaysUntilDeadline(application.paymentDeadline);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Details</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIconContainer, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={getStatusIcon(application.status) as any} size={moderateScale(24)} color={statusColor} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, { color: statusColor }]}>{application.status}</Text>
            <Text style={styles.applicationId}>ID: {application._id.slice(-8)}</Text>
          </View>
        </View>

        {application.status === 'Pending Payment' && daysUntilDeadline !== null && (
          <View style={[styles.urgencyBanner, { backgroundColor: getUrgencyColor(daysUntilDeadline) + '20' }]}>
            <Text style={[styles.urgencyText, { color: getUrgencyColor(daysUntilDeadline) }]}>
              {daysUntilDeadline <= 0
                ? 'Payment deadline expired'
                : `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left to pay`}
            </Text>
          </View>
        )}

        {application.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksLabel}>Remarks</Text>
            <Text style={styles.remarksText}>{application.remarks}</Text>
          </View>
        )}
      </View>

      {/* Application Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Application Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type</Text>
          <Text style={styles.infoValue}>{application.form?.applicationType}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Job Category</Text>
          <View style={styles.jobCategoryBadge}>
            <View style={[styles.jobCategoryDot, { backgroundColor: application.jobCategory?.colorCode }]} />
            <Text style={styles.infoValue}>{application.jobCategory?.name}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Position</Text>
          <Text style={styles.infoValue}>{application.form?.position}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Organization</Text>
          <Text style={styles.infoValue}>{application.form?.organization}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Submitted</Text>
          <Text style={styles.infoValue}>
            {new Date(application._creationTime).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Payment Section */}
      {application.status === 'Pending Payment' && (
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Required</Text>
          <Text style={styles.paymentAmount}>₱60.00</Text>
          <Text style={styles.paymentBreakdown}>Application Fee: ₱50.00 | Service Fee: ₱10.00</Text>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity 
              style={styles.paymentMethodButton}
              onPress={() => onPaymentMethodSelect('Maya')}
              disabled={isPaymentProcessing || isPaymentStatusProcessing}
            >
              <Text style={styles.paymentMethodText}>Pay with Maya</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.paymentMethodButton}
              onPress={() => onPaymentMethodSelect('Gcash')}
            >
              <Text style={styles.paymentMethodText}>Pay with GCash</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paymentMethodButton, styles.manualPaymentButton]}
              onPress={() => onPaymentMethodSelect('BaranggayHall')}
            >
              <Text style={styles.paymentMethodText}>Pay at Barangay Hall</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paymentMethodButton, styles.manualPaymentButton]}
              onPress={() => onPaymentMethodSelect('CityHall')}
            >
              <Text style={styles.paymentMethodText}>Pay at City Hall</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {application.status === 'Approved' && (
          <CustomButton
            title="View Health Card"
            onPress={() => router.push('/(screens)/(shared)/health-cards')}
            variant="primary"
          />
        )}
        
        <CustomButton
          title="View Documents"
          onPress={() => router.push(`/(screens)/(shared)/(screens)/(shared)/application/${application._id}/documents`)}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}
