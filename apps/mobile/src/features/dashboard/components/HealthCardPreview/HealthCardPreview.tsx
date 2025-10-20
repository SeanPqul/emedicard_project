import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { format, differenceInDays, addYears } from 'date-fns';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { styles } from './HealthCardPreview.styles';
import { getJobCategoryColor, getJobCategoryIcon, getCardTypeLabel } from '@entities/jobCategory';
import { ApplicationStatusChecklist } from '../ApplicationStatusChecklist';

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
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 }
      ]}
      onPress={() => router.push('/(screens)/(shared)/health-card-details')}
    >
      <LinearGradient
        colors={[getCardColor(), getCardColor() + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
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
      </LinearGradient>

      {/* View Details Button */}
      <View style={styles.actionRow}>
        <Text style={styles.actionText}>Tap to view details</Text>
        <Ionicons 
          name="chevron-forward" 
          size={moderateScale(20)} 
          color={theme.colors.text.secondary}
        />
      </View>
    </Pressable>
  );
};

// Component for when there's an application in progress
const ApplicationStatusCard: React.FC<{ application: any }> = ({ application }) => {
  const getStatusColor = () => {
    switch (application.status) {
      case 'Pending Payment':
        return theme.colors.orange[500];
      case 'For Payment Validation':
        return theme.colors.orange[600];
      case 'For Orientation':
        return theme.colors.blue[500];
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

  // Determine if orientation is required for this application
  const status: string = application.status || '';
  
  // Job category info
  const categoryName = application?.jobCategory?.name || '';
  const isFoodHandler = categoryName.toLowerCase().includes('food');
  const requiresOrientation = isFoodHandler && (application?.jobCategory?.requireOrientation === 'Yes' || application?.jobCategory?.requireOrientation === true);
  const categoryColor = getJobCategoryColor(categoryName);
  const categoryIcon = getJobCategoryIcon(categoryName) as any;
  const categoryLabel = getCardTypeLabel(categoryName);
  const shortId = `#${String(application._id).slice(-6).toUpperCase()}`;

  // Get action-oriented CTA text based on status
  const getActionText = () => {
    switch (status) {
      case 'Pending Payment':
        return 'Complete payment';
      case 'For Payment Validation':
        return 'View payment status';
      case 'For Orientation':
        return 'Schedule orientation';
      case 'Under Review':
      case 'Submitted':
        return 'View progress';
      case 'Approved':
        return 'View details';
      default:
        return 'View application';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.applicationCard}>
        {/* Top metadata row: Category badge + ID - optimized spacing */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: moderateScale(18) 
        }}>
          {/* Category badge with icon - elevated hierarchy */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: moderateScale(15),
            paddingVertical: moderateScale(9),
            borderRadius: moderateScale(20),
            backgroundColor: categoryColor,
            shadowColor: categoryColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Ionicons name={categoryIcon} size={moderateScale(17)} color="#FFFFFF" />
            <Text style={{ 
              color: '#FFFFFF', 
              fontWeight: '700', 
              marginLeft: moderateScale(8), 
              fontSize: moderateScale(13.5),
              letterSpacing: 0.3,
            }}>
              {categoryLabel}
            </Text>
          </View>
          {/* Application ID - subtle but scannable */}
          <Text style={{ 
            color: theme.colors.text.tertiary, 
            fontSize: moderateScale(13), 
            fontWeight: '600',
            letterSpacing: 0.5,
            opacity: 0.7,
          }}>
            {shortId}
          </Text>
        </View>

        {/* Status section with checklist */}
        <View style={{ marginBottom: moderateScale(16) }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: moderateScale(12),
          }}>
            <View style={[styles.statusDot, { 
              backgroundColor: getStatusColor(), 
              width: moderateScale(8), 
              height: moderateScale(8), 
              marginRight: moderateScale(10) 
            }]} />
            <Text style={{ 
              fontSize: moderateScale(17), 
              fontWeight: '700',
              color: theme.colors.text.primary,
              letterSpacing: -0.3,
            }}>
              {application.status}
            </Text>
          </View>
          
          {/* Application Status Checklist */}
          <ApplicationStatusChecklist
            currentStatus={status}
            requiresOrientation={requiresOrientation}
            categoryColor={categoryColor}
            orientationCompleted={application?.orientationCompleted || false}
            documentsVerified={application?.documentsVerified || false}
          />
        </View>

        {/* CTA - enhanced affordance with optimized spacing */}
        <Pressable
          style={({ pressed }) => [
            styles.actionRow, 
            { 
              paddingTop: moderateScale(16),
              marginTop: moderateScale(2),
              borderTopWidth: 1,
              borderTopColor: theme.colors.gray[100],
            },
            pressed && { opacity: 0.6 }
          ]}
          onPress={() => router.push(`/(screens)/(application)/${application._id}`)}
          accessibilityLabel={getActionText()}
          accessibilityHint="Double tap to view application details"
        >
          <Text style={[
            styles.actionText,
            {
              fontSize: moderateScale(15),
              fontWeight: '600',
              color: theme.colors.primary[600],
              lineHeight: moderateScale(20),
            }
          ]}>
            {getActionText()}
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={moderateScale(20)} 
            color={theme.colors.primary[600]}
          />
        </Pressable>
      </View>
    </View>
  );
};

