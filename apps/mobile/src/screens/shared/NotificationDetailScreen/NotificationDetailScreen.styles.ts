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

  // Header Section
  header: {
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(24),
    paddingHorizontal: scale(20),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
  },
  headerBackButton: {
    position: 'absolute',
    top: verticalScale(50),
    left: scale(20),
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: verticalScale(12),
  },
  iconBackground: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  // Content Section
  content: {
    padding: scale(20),
  },
  titleSection: {
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  time: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },

  // Message Card
  messageCard: {
    backgroundColor: 'white',
    padding: moderateScale(20),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  message: {
    fontSize: moderateScale(16),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(24),
  },

  // Application Card
  applicationCard: {
    backgroundColor: 'white',
    padding: moderateScale(20),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(16),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
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
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
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
    borderRadius: moderateScale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
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
    gap: verticalScale(12),
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
  },
  primaryButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: 'white',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
});
