import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  CustomButton,
  CustomTextInput,
  AnimatedCard,
  SkeletonLoader,
  SkeletonGroup,
  PageTransition,
  StaggerChildren,
  Toast,
  EmptyState,
  AccessibleView,
} from '@/src/components';
import { theme } from '@/src/styles/theme';

export default function UIShowcase() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const cards = [
    { id: 1, title: 'Food Handler Card', status: 'Active', date: 'Jan 15, 2025' },
    { id: 2, title: 'Security Guard Card', status: 'Pending', date: 'Jan 10, 2025' },
    { id: 3, title: 'Health Worker Card', status: 'Expired', date: 'Dec 20, 2024' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <PageTransition type="fade">
        <ScrollView showsVerticalScrollIndicator={false}>
          <AccessibleView
            label="UI Components Showcase"
            role="header"
            style={styles.header}
          >
            <Text style={styles.title}>UI/UX Components</Text>
            <Text style={styles.subtitle}>eMediCard Design System</Text>
          </AccessibleView>

          {/* Buttons Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Buttons</Text>
            
            <CustomButton
              title="Primary Button"
              variant="primary"
              onPress={() => showNotification('Primary button pressed!', 'success')}
              accessibilityLabel="Primary action button"
              style={styles.button}
            />

            <CustomButton
              title="Secondary Button"
              variant="secondary"
              onPress={() => showNotification('Secondary button pressed!', 'info')}
              accessibilityLabel="Secondary action button"
              style={styles.button}
            />

            <CustomButton
              title="Outline Button"
              variant="outline"
              onPress={() => showNotification('Outline button pressed!', 'warning')}
              accessibilityLabel="Outline action button"
              style={styles.button}
            />

            <CustomButton
              title="Loading Button"
              variant="primary"
              loading={loading}
              onPress={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 2000);
              }}
              loadingText="Processing..."
              accessibilityLabel="Loading button example"
              style={styles.button}
            />
          </View>

          {/* Input Fields Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Input Fields</Text>
            
            <CustomTextInput
              placeholder="Email Address"
              leftIcon="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email input field"
              containerStyle={styles.input}
            />

            <CustomTextInput
              placeholder="Password"
              leftIcon="lock-closed"
              rightIcon={showPassword ? "eye" : "eye-off"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              accessibilityLabel="Password input field"
              rightIconAccessibilityLabel="Toggle password visibility"
              containerStyle={styles.input}
            />

            <CustomTextInput
              placeholder="Error State Example"
              leftIcon="alert-circle"
              error={true}
              value="Invalid input"
              accessibilityLabel="Error state input example"
              containerStyle={styles.input}
            />
          </View>

          {/* Animated Cards Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Animated Cards</Text>
            
            <StaggerChildren staggerDelay={100} animationType="fade">
              {cards.map((card) => (
                <AnimatedCard
                  key={card.id}
                  onPress={() => showNotification(`${card.title} selected`, 'info')}
                  elevation={4}
                  accessibilityLabel={`${card.title} card`}
                  style={styles.card}
                >
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>Applied on {card.date}</Text>
                  <View style={[styles.statusBadge, styles[`status${card.status}`]]}>
                    <Text style={styles.statusText}>{card.status}</Text>
                  </View>
                </AnimatedCard>
              ))}
            </StaggerChildren>
          </View>

          {/* Skeleton Loaders Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skeleton Loaders</Text>
            
            <SkeletonGroup count={3} spacing={16}>
              <View>
                <SkeletonLoader height={60} variant="rectangular" animation="wave" />
                <View style={styles.skeletonTextGroup}>
                  <SkeletonLoader height={16} width="60%" variant="text" style={{ marginTop: 8 }} />
                  <SkeletonLoader height={14} width="40%" variant="text" style={{ marginTop: 4 }} />
                </View>
              </View>
            </SkeletonGroup>
          </View>

          {/* Empty State Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Empty State</Text>
            
            <CustomButton
              title={showEmptyState ? "Hide Empty State" : "Show Empty State"}
              variant="outline"
              onPress={() => setShowEmptyState(!showEmptyState)}
              style={styles.button}
            />

            {showEmptyState && (
              <EmptyState
                icon="document-text-outline"
                title="No Applications Yet"
                description="Start your health card application journey today"
                actionLabel="Apply Now"
                onAction={() => {
                  setShowEmptyState(false);
                  showNotification('Apply action triggered!', 'success');
                }}
              />
            )}
          </View>
        </ScrollView>
      </PageTransition>

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onHide={() => setShowToast(false)}
        position="bottom"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary[50],
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.primary[600],
  },
  section: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: theme.colors.semantic.success + '20',
  },
  statusPending: {
    backgroundColor: theme.colors.semantic.warning + '20',
  },
  statusExpired: {
    backgroundColor: theme.colors.semantic.error + '20',
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  skeletonTextGroup: {
    marginTop: theme.spacing.sm,
  },
});
