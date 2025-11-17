import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(20),
  },

  // Schedule List
  scheduleList: {
    flex: 1,
  },
  scheduleListContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(120), // Extra space for confirm button + safe area
  },

  // Schedule Card
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleCardSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  scheduleCardDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.gray[50],
  },

  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },

  // Date Container (Calendar-like)
  dateContainer: {
    width: moderateScale(70),
    backgroundColor: theme.colors.primary[500],
    borderRadius: moderateScale(8),
    padding: moderateScale(8),
    alignItems: 'center',
    marginRight: scale(12),
  },
  dateMonth: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: moderateScale(32),
  },
  dateYear: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // Schedule Info
  scheduleInfo: {
    flex: 1,
  },
  scheduleDayName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  scheduleTime: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginLeft: scale(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleVenue: {
    fontSize: moderateScale(13),
    color: theme.colors.text.tertiary,
    marginLeft: scale(4),
    flex: 1,
  },

  // Selected Badge
  selectedBadge: {
    marginLeft: scale(8),
  },

  // Schedule Footer
  scheduleFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    paddingTop: verticalScale(12),
  },

  // Slots Indicator
  slotsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    backgroundColor: theme.colors.semantic.success + '20',
    borderRadius: moderateScale(6),
    alignSelf: 'flex-start',
  },
  slotsIndicatorLow: {
    backgroundColor: theme.colors.semantic.warning + '20',
  },
  slotsIndicatorFull: {
    backgroundColor: theme.colors.semantic.error + '20',
  },
  slotsText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.semantic.success,
    marginLeft: scale(6),
  },
  slotsTextLow: {
    color: theme.colors.semantic.warning,
  },
  slotsTextFull: {
    color: theme.colors.semantic.error,
  },

  // Confirm Container
  confirmContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40), // Extra padding for easier thumb reach
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    gap: scale(8),
  },
  confirmButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Booked Session Card
  bookedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    margin: scale(20),
    borderWidth: 2,
    borderColor: theme.colors.semantic.success,
    shadowColor: theme.colors.semantic.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  bookedHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.semantic.success + '20',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(20),
    gap: scale(8),
  },
  successBadgeText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.semantic.success,
  },

  bookedDetails: {
    gap: verticalScale(16),
  },
  bookedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookedIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  bookedInfo: {
    flex: 1,
  },
  bookedLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  bookedValue: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    lineHeight: moderateScale(22),
  },
  bookedAddress: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(2),
    lineHeight: moderateScale(20),
  },

  importantNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.semantic.info + '10',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(16),
    gap: scale(8),
  },
  importantNoteText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(18),
  },

  statusInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.blue[50],
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(16),
    gap: scale(8),
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.blue[600],
  },
  statusInfoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(18),
  },

  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(10),
    backgroundColor: theme.colors.primary[600],
    marginTop: verticalScale(16),
    gap: scale(8),
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  qrButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: theme.colors.semantic.error,
    marginTop: verticalScale(16),
    gap: scale(6),
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.semantic.error,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(12),
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(40),
    paddingVertical: verticalScale(60),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});

