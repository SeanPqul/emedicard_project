import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { format } from 'date-fns';

export default function SelectCardForRenewalScreen() {
  const healthCards = useQuery(api.healthCards.getUserCards.getUserCardsQuery);
  const eligibility = useQuery(api.applications.checkRenewalEligibility.checkRenewalEligibilityQuery);

  if (healthCards === undefined || eligibility === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text style={styles.loadingText}>Loading health cards...</Text>
      </View>
    );
  }

  if (!healthCards || healthCards.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Card to Renew</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={moderateScale(64)} color={theme.colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Health Cards Found</Text>
          <Text style={styles.emptyText}>
            You need an existing health card before you can renew.
          </Text>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => router.push('/(tabs)/apply')}
          >
            <Text style={styles.applyButtonText}>Apply for New Card</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!eligibility?.isEligible) {
    Alert.alert(
      'Cannot Renew',
      eligibility?.reason || 'You are not eligible for renewal at this time.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
    return null;
  }

  const handleSelectCard = (healthCardId: string, cardDetails: any) => {
    const expiryDate = cardDetails.expiryDate || cardDetails.expiresAt;
    const daysUntilExpiry = Math.ceil(
      (expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry > 30) {
      Alert.alert(
        'Confirm Renewal',
        `This card is still valid for ${daysUntilExpiry} days. Are you sure you want to renew now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => navigateToRenewalForm(healthCardId) },
        ]
      );
    } else {
      navigateToRenewalForm(healthCardId);
    }
  };

  const navigateToRenewalForm = (healthCardId: string) => {
    router.push({
      pathname: '/(tabs)/apply',
      params: { action: 'renew', healthCardId },
    });
  };

  const getCardColor = (colorCode: string) => {
    const color = colorCode?.toLowerCase() || '';
    if (color.includes('yellow')) return theme.colors.jobCategories.foodHandler;
    if (color.includes('green')) return theme.colors.green[500];
    if (color.includes('pink')) return theme.colors.jobCategories.pink;
    return theme.colors.blue[500];
  };

  const getUrgencyInfo = (expiryDate: number) => {
    const daysUntilExpiry = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) {
      return { label: 'EXPIRED', color: theme.colors.red[600], bgColor: theme.colors.red[50], urgent: true };
    } else if (daysUntilExpiry <= 7) {
      return { label: 'URGENT', color: theme.colors.orange[700], bgColor: theme.colors.orange[50], urgent: true };
    } else if (daysUntilExpiry <= 30) {
      return { label: 'RENEW SOON', color: theme.colors.orange[600], bgColor: theme.colors.orange[50], urgent: true };
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Card to Renew</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Choose which health card you want to renew:</Text>

        {healthCards.map((card: any) => {
          const expiryDate = card.expiryDate || (card as any).expiresAt;
          const issuedDate = card.issuedDate || (card as any).issuedAt;
          const urgency = getUrgencyInfo(expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <TouchableOpacity
              key={card._id}
              style={[styles.cardItem, urgency?.urgent && styles.cardItemUrgent]}
              onPress={() => handleSelectCard(card._id, card)}
              activeOpacity={0.7}
            >
              {urgency && (
                <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
                  <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
                </View>
              )}

              <View style={[styles.cardIcon, { backgroundColor: getCardColor((card as any).jobCategory?.colorCode || '') }]}>
                <Ionicons name="card" size={moderateScale(32)} color={theme.colors.ui.white} />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{(card as any).jobCategory?.name || 'Health Card'}</Text>
                <Text style={styles.cardSubtitle}>
                  Registration: {card.registrationNumber || 'N/A'}
                </Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={moderateScale(14)} color={theme.colors.gray[500]} />
                    <Text style={styles.metaText}>
                      Issued: {format(new Date(issuedDate), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={moderateScale(14)} color={theme.colors.gray[500]} />
                    <Text style={styles.metaText}>
                      {daysUntilExpiry < 0 
                        ? `Expired ${Math.abs(daysUntilExpiry)} days ago` 
                        : `Expires in ${daysUntilExpiry} days`}
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={moderateScale(24)} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={moderateScale(20)} color={theme.colors.blue[600]} />
          <Text style={styles.infoText}>
            Renewal requires updated medical documents and payment. Your personal information will be pre-filled.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background.primary 
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: moderateScale(16), 
    paddingVertical: verticalScale(16),
    backgroundColor: theme.colors.ui.white,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: { 
    padding: moderateScale(8), 
    marginRight: moderateScale(8) 
  },
  headerTitle: { 
    fontSize: moderateScale(20), 
    fontWeight: '600', 
    color: theme.colors.text.primary 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    padding: moderateScale(16) 
  },
  subtitle: { 
    fontSize: moderateScale(16), 
    color: theme.colors.text.secondary, 
    marginBottom: verticalScale(16) 
  },
  cardItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: theme.colors.ui.white, 
    borderRadius: moderateScale(12),
    padding: moderateScale(16), 
    marginBottom: verticalScale(12),
    borderWidth: 1, 
    borderColor: theme.colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardItemUrgent: { 
    borderColor: theme.colors.orange[300], 
    borderWidth: 2 
  },
  urgencyBadge: {
    position: 'absolute', 
    top: moderateScale(8), 
    right: moderateScale(8),
    paddingHorizontal: moderateScale(8), 
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(4),
  },
  urgencyText: { 
    fontSize: moderateScale(10), 
    fontWeight: '700' 
  },
  cardIcon: {
    width: moderateScale(56), 
    height: moderateScale(56),
    borderRadius: moderateScale(28), 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  cardContent: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: moderateScale(16), 
    fontWeight: '600', 
    color: theme.colors.text.primary, 
    marginBottom: verticalScale(4) 
  },
  cardSubtitle: { 
    fontSize: moderateScale(13), 
    color: theme.colors.text.secondary, 
    marginBottom: verticalScale(8) 
  },
  cardMeta: { 
    gap: verticalScale(4) 
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: moderateScale(4) 
  },
  metaText: { 
    fontSize: moderateScale(12), 
    color: theme.colors.text.tertiary 
  },
  infoBox: {
    flexDirection: 'row', 
    backgroundColor: theme.colors.blue[50],
    padding: moderateScale(12), 
    borderRadius: moderateScale(8),
    marginTop: verticalScale(16), 
    gap: moderateScale(8),
  },
  infoText: { 
    flex: 1, 
    fontSize: moderateScale(13), 
    color: theme.colors.blue[700], 
    lineHeight: moderateScale(18) 
  },
  emptyContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: moderateScale(32) 
  },
  emptyTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '600', 
    color: theme.colors.text.primary, 
    marginTop: verticalScale(16), 
    marginBottom: verticalScale(8) 
  },
  emptyText: { 
    fontSize: moderateScale(14), 
    color: theme.colors.text.secondary, 
    textAlign: 'center', 
    marginBottom: verticalScale(24) 
  },
  applyButton: { 
    backgroundColor: theme.colors.primary[600], 
    paddingHorizontal: moderateScale(24), 
    paddingVertical: verticalScale(12), 
    borderRadius: moderateScale(8) 
  },
  applyButtonText: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    color: theme.colors.ui.white 
  },
});
