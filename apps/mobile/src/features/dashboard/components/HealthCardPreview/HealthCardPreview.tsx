import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient'; // Disabled due to native module issues
import QRCode from 'react-native-qrcode-svg';
import { format, differenceInDays, addYears } from 'date-fns';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { styles } from './HealthCardPreview.styles';
import { getJobCategoryColor, getJobCategoryIcon, getCardTypeLabel } from '@entities/jobCategory';

interface HealthCardPreviewProps {
  healthCard?: {
    id: string;
    cardNumber: string;
    issueDate: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'pending';
    type: string;
    fullName: string;
    qrCodeData: string;
  };
  currentApplication?: any;
  userProfile?: any;
  isNewUser?: boolean;
}

export const HealthCardPreview: React.FC<HealthCardPreviewProps> = ({
  healthCard,
  currentApplication,
  userProfile,
  isNewUser,
}) => {
  // If no health card, show application status card instead
  if (!healthCard && currentApplication) {
    return <ApplicationStatusCard application={currentApplication} />;
  }

// If no health card and no application, suppress CTA here — WelcomeBanner owns the new-user CTA
  if (!healthCard) {
    return null;
  }

  const daysUntilExpiry = differenceInDays(new Date(healthCard.expiryDate), new Date());
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  const getCardColor = (): string => {
    if (healthCard.type.toLowerCase().includes('food')) {
      return theme.colors.orange[500];
    }
    if (healthCard.type.toLowerCase().includes('dental')) {
      return theme.colors.blue[500];
    }
    return theme.colors.primary[500];
  };

  const getStatusColor = () => {
    if (isExpired) return theme.colors.semantic.error;
    if (isExpiringSoon) return theme.colors.semantic.warning;
    return theme.colors.semantic.success;
  };

  const getStatusText = () => {
    if (isExpired) return 'Expired';
    if (isExpiringSoon) return `Expires in ${daysUntilExpiry} days`;
    return 'Active';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(screens)/(shared)/health-card-details')}
      activeOpacity={0.8}
    >
      <View
        style={[styles.gradientBackground, { backgroundColor: getCardColor() }]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>eMediCard</Text>
            <Text style={styles.cardType}>{healthCard.type}</Text>
          </View>
          <View style={styles.qrContainer}>
            <QRCode
              value={healthCard.qrCodeData}
              size={moderateScale(50)}
              color="white"
              backgroundColor="transparent"
            />
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <Text style={styles.cardNumber}>{healthCard.cardNumber}</Text>
          <Text style={styles.holderName}>{healthCard.fullName}</Text>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.labelText}>Valid Until</Text>
            <Text style={styles.dateText}>
              {format(new Date(healthCard.expiryDate), 'MMM yyyy')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      {/* View Details Button */}
      <View style={styles.actionRow}>
        <Text style={styles.actionText}>Tap to view details</Text>
        <Ionicons 
          name="chevron-forward" 
          size={moderateScale(20)} 
          color={theme.colors.text.secondary}
        />
      </View>
    </TouchableOpacity>
  );
};

// Component for when there's an application in progress
const ApplicationStatusCard: React.FC<{ application: any }> = ({ application }) => {
  const getStatusColor = () => {
    switch (application.status) {
      case 'Pending Payment':
        return theme.colors.orange[500];
      case 'Submitted':
        return theme.colors.blue[500];
      case 'Under Review':
        return theme.colors.orange[500];
      case 'Approved':
        return theme.colors.semantic.success;
      default:
        return theme.colors.gray[500];
    }
  };

  // Calculate step info (Step X of 3 • Next: ...)
  const steps = ['Submitted', 'Under Review', 'Approved'];
  const status: string = application.status || '';
  const isPendingPayment = status === 'Pending Payment';
  const currentIndex = isPendingPayment ? -1 : steps.indexOf(status);
  const totalSteps = steps.length;
  const currentStep = Math.max(0, currentIndex + 1);
  const nextStep = currentIndex < totalSteps - 1 ? (steps[currentIndex + 1] ?? null) : null;

  const getProgressWidth = () => {
    if (isPendingPayment) return '25%';
    switch (status) {
      case 'Submitted': return '33%';
      case 'Under Review': return '66%';
      case 'Approved': return '100%';
      default: return '25%';
    }
  };

  // Job category info
  const categoryName = application?.jobCategory?.name || '';
  const categoryColor = getJobCategoryColor(categoryName);
  const categoryIcon = getJobCategoryIcon(categoryName) as any;
  const categoryLabel = getCardTypeLabel(categoryName);
  const shortId = `#${String(application._id).slice(-6).toUpperCase()}`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(tabs)/application')}
      activeOpacity={0.8}
    >
      <View style={styles.applicationCard}>
        {/* ADD: Category chip and short ID at top */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(12) }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: moderateScale(12),
            paddingVertical: moderateScale(6),
            borderRadius: moderateScale(999),
            backgroundColor: categoryColor,
          }}>
            <Ionicons name={categoryIcon} size={moderateScale(14)} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', marginLeft: moderateScale(6), fontSize: moderateScale(12) }}>
              {categoryLabel}
            </Text>
          </View>
          <Text style={{ color: theme.colors.text.secondary, fontSize: moderateScale(13), fontWeight: '600' }}>
            {shortId}
          </Text>
        </View>

        {/* KEEP: existing header with icon, title, and status dot */}
        <View style={styles.applicationHeader}>
          <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons 
              name="document-text" 
              size={moderateScale(32)} 
              color={getStatusColor()}
            />
          </View>
          <View style={styles.applicationInfo}>
            <Text style={styles.applicationTitle}>Health Card Application</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={styles.statusLabel}>{application.status}</Text>
            </View>
          </View>
          {/* ADD: Status chip (SUBMITTED) to the right of the header */}
          <View style={{ paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(4), borderRadius: moderateScale(8), backgroundColor: getStatusColor() + '20' }}>
            <Text style={{ color: getStatusColor(), fontWeight: '700', fontSize: moderateScale(11), textTransform: 'uppercase' }}>
              {status || 'PENDING'}
            </Text>
          </View>
        </View>
        
        {/* KEEP: progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: getProgressWidth(),
                  backgroundColor: categoryColor
                }
              ]} 
            />
          </View>
          {/* ADD: Step X of 3 • Next: ... */}
          <Text style={[styles.progressText, { fontWeight: '600', marginBottom: moderateScale(4) }]}>
            {`Step ${Math.max(1, currentStep)} of ${totalSteps}`}
            {nextStep ? ` • Next: ${nextStep}` : ''}
          </Text>
          {/* KEEP: existing descriptive text */}
          <Text style={styles.progressText}>
            {application.status === 'Pending Payment'
              ? 'Complete payment to proceed'
              : application.status === 'Submitted'
              ? 'Waiting for verification'
              : application.status === 'Under Review'
              ? 'Medical review in progress'
              : application.status === 'Approved'
              ? 'Approved'
              : 'Processing your application'}
          </Text>
        </View>

        {/* KEEP: existing CTA */}
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>View application status</Text>
          <Ionicons 
            name="chevron-forward" 
            size={moderateScale(20)} 
            color={theme.colors.text.secondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

