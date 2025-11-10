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
      onPress={() => router.push('/(screens)/(shared)/health-cards')}
    >
      {/* Official CHO Davao Style Health Card */}
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(16),
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}>
        {/* Header - CHO Davao */}
        <View style={{ alignItems: 'center', marginBottom: moderateScale(12), borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingBottom: moderateScale(10) }}>
          <Text style={{ fontSize: moderateScale(10), color: '#666', fontWeight: '600' }}>EHS Form No. 102-A</Text>
          <Text style={{ fontSize: moderateScale(9), color: '#888', marginTop: moderateScale(2) }}>REPUBLIC of the PHILIPPINES</Text>
          <Text style={{ fontSize: moderateScale(13), color: '#DC2626', fontWeight: '800', marginTop: moderateScale(4) }}>CITY HEALTH OFFICE</Text>
          <Text style={{ fontSize: moderateScale(11), color: '#444', fontWeight: '600' }}>Davao City</Text>
        </View>

        {/* Registration Number */}
        <View style={{ alignItems: 'center', marginBottom: moderateScale(8) }}>
          <Text style={{ fontSize: moderateScale(10), color: '#666', fontWeight: '600' }}>Reg. No. {healthCard.cardNumber}</Text>
        </View>

        {/* Certificate Title */}
        <View style={{ alignItems: 'center', marginBottom: moderateScale(10) }}>
          <Text style={{ fontSize: moderateScale(16), color: '#DC2626', fontWeight: '800', letterSpacing: 1 }}>HEALTH CERTIFICATE</Text>
          <Text style={{ fontSize: moderateScale(8), color: '#666', marginTop: moderateScale(4), textAlign: 'center' }}>Pursuant to P.D. 522, P.D. 856, and City Ord. No. 078 s. 2000</Text>
        </View>

        {/* Card Body - Key Info */}
        <View style={{ marginBottom: moderateScale(12) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: moderateScale(6) }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: moderateScale(9), color: '#666', marginBottom: moderateScale(2) }}>Name:</Text>
              <Text style={{ fontSize: moderateScale(11), color: '#1F2937', fontWeight: '700' }} numberOfLines={1}>{healthCard.fullName}</Text>
            </View>
            <View style={{ width: moderateScale(50), height: moderateScale(50), backgroundColor: '#F3F4F6', borderRadius: moderateScale(8), borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginLeft: moderateScale(8) }}>
              <Ionicons name="person" size={moderateScale(24)} color="#9CA3AF" />
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: moderateScale(4) }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: moderateScale(9), color: '#666' }}>Occupation:</Text>
              <Text style={{ fontSize: moderateScale(10), color: '#374151', fontWeight: '600' }} numberOfLines={1}>{healthCard.type}</Text>
            </View>
          </View>
        </View>

        {/* Footer - Validity & Status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: moderateScale(10), borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
          <View>
            <Text style={{ fontSize: moderateScale(8), color: '#888' }}>Valid Until</Text>
            <Text style={{ fontSize: moderateScale(11), color: '#1F2937', fontWeight: '700', marginTop: moderateScale(2) }}>
              {format(new Date(healthCard.expiryDate), 'MMM yyyy')}
            </Text>
          </View>
          <View style={[{ paddingHorizontal: moderateScale(12), paddingVertical: moderateScale(6), borderRadius: moderateScale(12) }, { backgroundColor: getStatusColor() }]}>
            <Text style={{ fontSize: moderateScale(10), color: '#FFFFFF', fontWeight: '700' }}>{getStatusText()}</Text>
          </View>
        </View>
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

        {/* CTA - Subtle text link */}
        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            {
              paddingTop: moderateScale(16),
              marginTop: moderateScale(4),
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
            }
          ]}>
            {getActionText()}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={moderateScale(20)} 
            color={theme.colors.primary[600]}
          />
        </Pressable>
      </View>
    </View>
  );
};

