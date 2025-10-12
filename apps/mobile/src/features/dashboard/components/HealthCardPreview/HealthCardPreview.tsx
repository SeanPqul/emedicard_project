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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(tabs)/application')}
      activeOpacity={0.8}
    >
      <View style={styles.applicationCard}>
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
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: application.status === 'Approved' ? '100%' : '66%',
                  backgroundColor: getStatusColor()
                }
              ]} 
            />
          </View>
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

