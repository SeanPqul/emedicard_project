import { StyleSheet } from 'react-native';
import { getColor, theme } from '../theme';

export const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: getColor('background.paper'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('divider'),
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: getColor('text.primary'),
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll view
  scrollView: {
    flex: 1,
    backgroundColor: getColor('background.default'),
  },

  // Summary Card
  summaryCard: {
    margin: theme.spacing.lg,
    backgroundColor: getColor('background.paper'),
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    borderBottomWidth: 1,
    borderBottomColor: getColor('divider'),
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: getColor('primary.main'),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryDescription: {
    fontSize: 14,
    color: getColor('text.secondary'),
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },

  // Fee Breakdown
  feeBreakdown: {
    backgroundColor: getColor('background.subtle'),
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  feeLabel: {
    fontSize: 14,
    color: getColor('text.secondary'),
  },
  feeValue: {
    fontSize: 14,
    color: getColor('text.primary'),
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: getColor('divider'),
    marginVertical: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: getColor('primary.main'),
    fontWeight: '700',
  },

  // Payment Methods Section
  methodsSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: theme.spacing.md,
  },

  // Payment Option
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.paper'),
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    borderColor: getColor('primary.main'),
    backgroundColor: getColor('primary.light'),
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: getColor('background.subtle'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  paymentIconContainerSelected: {
    backgroundColor: getColor('primary.lighter'),
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: 2,
  },
  paymentNameSelected: {
    color: getColor('primary.main'),
  },
  paymentDescription: {
    fontSize: 13,
    color: getColor('text.secondary'),
  },
  checkIconContainer: {
    marginLeft: theme.spacing.sm,
  },

  // Details Section
  detailsSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },

  // Input Container
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    backgroundColor: getColor('background.paper'),
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: getColor('divider'),
    overflow: 'hidden',
  },
  textInput: {
    fontSize: 16,
    color: getColor('text.primary'),
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    height: 48,
  },
  inputHelper: {
    fontSize: 12,
    color: getColor('text.secondary'),
    marginTop: theme.spacing.xs,
  },

  // Upload Container
  uploadContainer: {
    marginBottom: theme.spacing.lg,
  },
  uploadButton: {
    backgroundColor: getColor('background.paper'),
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: getColor('primary.lighter'),
    borderStyle: 'dashed',
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: getColor('primary.lighter'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('primary.main'),
    marginBottom: theme.spacing.xs,
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: getColor('text.secondary'),
  },

  // Uploaded File
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('success.lighter'),
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: getColor('success.light'),
  },
  uploadedFileIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: getColor('success.light'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  uploadedFileInfo: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('success.dark'),
    marginBottom: 2,
  },
  uploadedFileSize: {
    fontSize: 12,
    color: getColor('success.main'),
  },
  removeButton: {
    padding: theme.spacing.xs,
  },

  // Instructions Card
  instructionsCard: {
    backgroundColor: getColor('info.lighter'),
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: getColor('info.light'),
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('info.dark'),
    marginLeft: theme.spacing.sm,
  },
  instructionsList: {
    marginTop: theme.spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: getColor('info.main'),
    color: getColor('background.paper'),
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: theme.spacing.md,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: getColor('info.dark'),
    lineHeight: 20,
  },

  // Existing Payment Card
  existingPaymentCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: getColor('success.lighter'),
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: getColor('success.light'),
  },
  existingPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  existingPaymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('success.dark'),
    marginLeft: theme.spacing.sm,
  },
  existingPaymentDetails: {
    marginTop: theme.spacing.sm,
  },
  existingPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  existingPaymentLabel: {
    fontSize: 14,
    color: getColor('success.main'),
  },
  existingPaymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('success.dark'),
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Submit Container
  submitContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  submitButton: {
    height: 56,
    borderRadius: theme.borderRadius.md,
    shadowColor: getColor('primary.main'),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitHelper: {
    fontSize: 13,
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
