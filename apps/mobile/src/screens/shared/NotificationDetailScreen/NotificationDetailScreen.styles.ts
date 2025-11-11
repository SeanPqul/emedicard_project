import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.tertiary,
  },
  contentContainer: {
    flexGrow: 1,
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(24),
  },
  errorText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(18),
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: verticalScale(24),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.colors.primary[500],
    borderRadius: moderateScale(8),
  },
  backButtonText: {
    fontSize: moderateScale(16),
    color: 'white',
    fontWeight: '600',
  },

  // Title Section (Inline Header)
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  inlineBackButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(-8),
    marginRight: scale(12),
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: verticalScale(4),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  time: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
  },

  // Content Section
  content: {
    padding: scale(20),
  },

  // Message Card
  messageCard: {
    backgroundColor: 'white',
    padding: moderateScale(20),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  message: {
    fontSize: moderateScale(15),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(24),
  },

  // Application Card
  applicationCard: {
    backgroundColor: 'white',
    padding: moderateScale(20),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(16),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  infoLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  categoryDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
  },
  statusText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: verticalScale(24),
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: verticalScale(8),
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(4),
  },

  // Action Section
  actionSection: {
    marginTop: verticalScale(20),
    paddingBottom: verticalScale(40),
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.primary[500],
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: 'white',
  },
});
