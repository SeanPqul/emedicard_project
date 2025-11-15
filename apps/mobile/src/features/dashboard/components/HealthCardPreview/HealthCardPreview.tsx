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
  // Determine if we should show application status
  const terminalStatuses = ['Approved', 'Cancelled', 'Payment Rejected', 'Rejected'];
  const hasActiveApplication = currentApplication && !terminalStatuses.includes(currentApplication.status);
  const isRenewal = currentApplication?.applicationType === 'Renew';
  const showApplicationStatus = hasActiveApplication && (!healthCard || isRenewal);

  // If no health card and no application, suppress CTA here — WelcomeBanner owns the new-user CTA
  if (!healthCard && !currentApplication) {
    return null;
  }
  
  // If only application (no health card), show only application status
  if (!healthCard && hasActiveApplication) {
    return <ApplicationStatusCard application={currentApplication} />;
  }
  
  // If health card exists but no active application, show only health card
  if (healthCard && !showApplicationStatus) {
    return <HealthCardDisplay healthCard={healthCard} />;
  }
  
  // If both exist (renewal scenario), show both
  if (healthCard && showApplicationStatus) {
    return (
      <View>
        <ApplicationStatusCard application={currentApplication} />
        <View style={{ marginTop: moderateScale(16) }}>
          <HealthCardDisplay healthCard={healthCard} />
        </View>
      </View>
    );
  }
  
  return null;
};

// Component for displaying the health card
const HealthCardDisplay: React.FC<{ healthCard: any }> = ({ healthCard }) => {
  const daysUntilExpiry = differenceInDays(new Date(healthCard.expiryDate), new Date());
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  const getCardColor = (): string => {
    if (healthCard.type.toLowerCase().includes('food')) {
      return theme.colors.jobCategories.foodHandler; // Yellow/Gold (#FFD700)
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

  const cardColor = getCardColor();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }
      ]}
      onPress={() => router.push('/(screens)/(shared)/health-cards')}
    >
      {/* Modern Card with Gradient Header */}
      <LinearGradient
        colors={[cardColor, cardColor + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: moderateScale(16),
          padding: moderateScale(16),
          shadowColor: cardColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Header with Icon and Status Badge */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(16) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) }}>
            <View style={{ 
              width: moderateScale(40), 
              height: moderateScale(40), 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: moderateScale(12),
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="shield-checkmark" size={moderateScale(24)} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: moderateScale(10), color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Health Certificate</Text>
              <Text style={{ fontSize: moderateScale(13), color: '#FFFFFF', fontWeight: '700', marginTop: moderateScale(2) }}>{healthCard.type}</Text>
            </View>
          </View>
          <View style={{
            paddingHorizontal: moderateScale(12),
            paddingVertical: moderateScale(6),
            borderRadius: moderateScale(20),
            backgroundColor: isExpired ? theme.colors.semantic.error : isExpiringSoon ? theme.colors.semantic.warning : theme.colors.semantic.success
          }}>
            <Text style={{ fontSize: moderateScale(10), color: '#FFFFFF', fontWeight: '700', textTransform: 'uppercase' }}>{getStatusText()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Card Details Section */}
      <View style={{
        backgroundColor: '#FFFFFF',
        marginTop: moderateScale(-8),
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}>
        {/* Card ID */}
        <View style={{ marginBottom: moderateScale(12) }}>
          <Text style={{ fontSize: moderateScale(11), color: theme.colors.text.secondary, fontWeight: '500', marginBottom: moderateScale(4) }}>Card ID</Text>
          <Text style={{ fontSize: moderateScale(16), color: theme.colors.text.primary, fontWeight: '700', letterSpacing: 0.5 }}>{healthCard.cardNumber}</Text>
        </View>

        {/* Holder Name */}
        <View style={{ marginBottom: moderateScale(12) }}>
          <Text style={{ fontSize: moderateScale(11), color: theme.colors.text.secondary, fontWeight: '500', marginBottom: moderateScale(4) }}>Holder</Text>
          <Text style={{ fontSize: moderateScale(14), color: theme.colors.text.primary, fontWeight: '600' }} numberOfLines={1}>{healthCard.fullName}</Text>
        </View>

        {/* Expiry Info */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: isExpired ? theme.colors.red[50] : isExpiringSoon ? theme.colors.orange[50] : theme.colors.green[50],
          borderRadius: moderateScale(12),
          padding: moderateScale(12),
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) }}>
            <Ionicons 
              name={isExpired ? 'alert-circle' : isExpiringSoon ? 'time' : 'checkmark-circle'} 
              size={moderateScale(20)} 
              color={isExpired ? theme.colors.red[600] : isExpiringSoon ? theme.colors.orange[600] : theme.colors.green[600]} 
            />
            <View>
              <Text style={{ fontSize: moderateScale(10), color: theme.colors.text.secondary, fontWeight: '500' }}>Valid Until</Text>
              <Text style={{ 
                fontSize: moderateScale(13), 
                color: isExpired ? theme.colors.red[700] : isExpiringSoon ? theme.colors.orange[700] : theme.colors.green[700], 
                fontWeight: '700',
                marginTop: moderateScale(2)
              }}>
                {format(new Date(healthCard.expiryDate), 'MMM dd, yyyy')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={moderateScale(18)} color={theme.colors.text.tertiary} />
        </View>
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
      case 'Scheduled':
      case 'For Orientation':
        return theme.colors.blue[500];
      case 'Submitted':
        return theme.colors.blue[500];
      case 'Under Review':
        return theme.colors.orange[500];
      case 'Under Administrative Review':
      case 'Locked - Max Attempts': // Old status, backward compatibility
        return theme.colors.red[500]; // Red for locked/requires admin attention
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

  // Display professional status text
  const getDisplayStatus = () => {
    // Map internal status to user-friendly display text
    if (status === 'Under Administrative Review' || status === 'Locked - Max Attempts') {
      return 'Under Administrative Review';
    }
    return status;
  };

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
      case 'Under Administrative Review':
      case 'Locked - Max Attempts': // Old status, backward compatibility
        return 'Contact support';
      default:
        return 'View application';
    }
  };

  // Check if it's a renewal
  const isRenewal = application.applicationType === 'Renew';

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
          {/* Application ID with Renewal badge */}
          <View style={{ alignItems: 'flex-end', gap: moderateScale(4) }}>
            {isRenewal && (
              <View style={{
                paddingHorizontal: moderateScale(8),
                paddingVertical: moderateScale(3),
                borderRadius: moderateScale(10),
                backgroundColor: theme.colors.blue[500],
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: moderateScale(10),
                  fontWeight: '700',
                  letterSpacing: 0.3,
                }}>
                  RENEWAL
                </Text>
              </View>
            )}
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
              {getDisplayStatus()}
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
          onPress={() => {
            const actionText = getActionText();
            // Route to help center for contact support, otherwise to application details
            if (actionText === 'Contact support') {
              router.push({
                pathname: '/(screens)/(shared)/help-center',
                params: { scrollToContact: 'true' }
              });
            } else {
              router.push(`/(screens)/(application)/${application._id}`);
            }
          }}
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

