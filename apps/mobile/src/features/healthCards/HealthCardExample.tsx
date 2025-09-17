import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useHealthCardByToken } from './useHealthCard';
import { ErrorState } from '../../components/common';
import { SkeletonLoader } from '../../components/common/LoadingSpinner';
import { getColor, getTypography, getSpacing, getBorderRadius } from '../../styles/theme';

interface HealthCardExampleProps {
  token: string;
}

export const HealthCardExample: React.FC<HealthCardExampleProps> = ({ token }) => {
  const { loading, card, error, fetchCard } = useHealthCardByToken();

  useEffect(() => {
    if (token) {
      fetchCard(token);
    }
  }, [token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonContainer}>
          {/* Health card skeleton */}
          <View style={styles.cardSkeleton}>
            <SkeletonLoader count={1} height={200} style={styles.cardImageSkeleton} />
            
            <View style={styles.cardContentSkeleton}>
              <SkeletonLoader count={1} height={24} />
              <SkeletonLoader count={1} height={18} style={{ marginTop: 8 }} />
              
              <View style={styles.detailsSection}>
                <SkeletonGroup count={4}>
                  <SkeletonLoader count={1} height={16} />
                </SkeletonGroup>
              </View>
              
              <View style={styles.statusSection}>
                <SkeletonLoader count={1} height={32} />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState
          type="network"
          title="Failed to Load Health Card"
          message={error}
          onRetry={() => fetchCard(token)}
          retryText="Try Again"
          variant="card"
          showDetails={__DEV__}
        />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.container}>
        <ErrorState
          type="not_found"
          title="Health Card Not Found"
          message="No health card found with the provided verification token."
          variant="card"
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.cardContainer}>
        {/* Health Card Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Health Card</Text>
          <View style={[styles.statusBadge, getStatusBadgeStyle(card.status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(card.status)]}>
              {card.status?.toUpperCase() || 'ACTIVE'}
            </Text>
          </View>
        </View>

        {/* Card Details */}
        <View style={styles.cardContent}>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Card ID</Text>
            <Text style={styles.valueText}>{card._id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Holder Name</Text>
            <Text style={styles.valueText}>
              {card.holderName || card.formData?.personalInfo?.fullName || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Issue Date</Text>
            <Text style={styles.valueText}>
              {card.issueDate ? new Date(card.issueDate).toLocaleDateString() : 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Expiry Date</Text>
            <Text style={styles.valueText}>
              {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'N/A'}
            </Text>
          </View>

          {card.verificationToken && (
            <View style={styles.detailRow}>
              <Text style={styles.labelText}>Verification Token</Text>
              <Text style={[styles.valueText, styles.tokenText]} numberOfLines={1}>
                {card.verificationToken}
              </Text>
            </View>
          )}

          {card.metadata && Object.keys(card.metadata).length > 0 && (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              {Object.entries(card.metadata).map(([key, value]) => (
                <View key={key} style={styles.detailRow}>
                  <Text style={styles.labelText}>{formatKey(key)}</Text>
                  <Text style={styles.valueText}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            Last updated: {card._updatedTime ? new Date(card._updatedTime).toLocaleString() : 'Unknown'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Helper functions
const getStatusBadgeStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { backgroundColor: getColor('semantic.success') };
    case 'expired':
      return { backgroundColor: getColor('semantic.error') };
    case 'suspended':
      return { backgroundColor: getColor('semantic.warning') };
    default:
      return { backgroundColor: getColor('primary.500') };
  }
};

const getStatusTextStyle = (status: string) => {
  return { color: getColor('text.inverse') };
};

const formatKey = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  skeletonContainer: {
    padding: getSpacing('lg'),
  },
  cardSkeleton: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageSkeleton: {
    marginBottom: getSpacing('lg'),
  },
  cardContentSkeleton: {
    gap: getSpacing('md'),
  },
  detailsSection: {
    marginTop: getSpacing('lg'),
    gap: getSpacing('sm'),
  },
  statusSection: {
    marginTop: getSpacing('lg'),
    alignItems: 'flex-end',
  },
  cardContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    margin: getSpacing('lg'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getSpacing('lg'),
    backgroundColor: getColor('primary.50'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.primary'),
  },
  cardTitle: {
    ...getTypography('headingMedium'),
    color: getColor('text.primary'),
  },
  statusBadge: {
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
  },
  statusText: {
    ...getTypography('labelSmall'),
    fontWeight: '600',
  },
  cardContent: {
    padding: getSpacing('lg'),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.secondary'),
  },
  labelText: {
    ...getTypography('bodyMedium'),
    color: getColor('text.secondary'),
    fontWeight: '500',
    flex: 1,
  },
  valueText: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    flex: 2,
    textAlign: 'right',
  },
  tokenText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  metadataSection: {
    marginTop: getSpacing('xl'),
    paddingTop: getSpacing('lg'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.primary'),
  },
  sectionTitle: {
    ...getTypography('headingSmall'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
  },
  cardFooter: {
    padding: getSpacing('lg'),
    backgroundColor: getColor('background.secondary'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.secondary'),
  },
  footerText: {
    ...getTypography('bodySmall'),
    color: getColor('text.tertiary'),
    textAlign: 'center',
  },
});
