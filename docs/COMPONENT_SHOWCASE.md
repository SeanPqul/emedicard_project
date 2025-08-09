# eMediCard Component Showcase

This showcase demonstrates all components in the eMediCard design system with real-world examples.

## Core Components

### 1. Buttons

#### Primary Button
```tsx
<CustomButton
  title="Apply for Health Card"
  variant="primary"
  size="large"
  onPress={handleApply}
  accessibilityLabel="Apply for health card"
  accessibilityHint="Opens the application form"
/>
```

#### Secondary Button
```tsx
<CustomButton
  title="View Requirements"
  variant="secondary"
  size="medium"
  leftIcon="document-text"
  onPress={showRequirements}
/>
```

#### Outline Button
```tsx
<CustomButton
  title="Cancel"
  variant="outline"
  size="medium"
  onPress={handleCancel}
/>
```

#### Loading Button
```tsx
<CustomButton
  title="Submit"
  variant="primary"
  loading={isSubmitting}
  loadingText="Submitting..."
  disabled={!isFormValid}
/>
```

### 2. Text Inputs

#### Basic Input
```tsx
<CustomTextInput
  placeholder="Enter your full name"
  value={name}
  onChangeText={setName}
  accessibilityLabel="Full name"
/>
```

#### Email Input with Validation
```tsx
<CustomTextInput
  placeholder="Email address"
  leftIcon="mail"
  value={email}
  onChangeText={setEmail}
  error={!isValidEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  accessibilityLabel="Email address"
/>
```

#### Password Input
```tsx
<CustomTextInput
  placeholder="Password"
  leftIcon="lock-closed"
  rightIcon={showPassword ? "eye" : "eye-off"}
  onRightIconPress={() => setShowPassword(!showPassword)}
  secureTextEntry={!showPassword}
  value={password}
  onChangeText={setPassword}
  rightIconAccessibilityLabel="Toggle password visibility"
/>
```

### 3. Cards

#### Interactive Card
```tsx
<AnimatedCard
  onPress={() => navigation.navigate('ApplicationDetails', { id })}
  elevation={4}
  accessibilityLabel="Health card application"
  accessibilityHint="Tap to view details"
>
  <View style={styles.cardContent}>
    <Text style={theme.typography.h3}>Food Handler's Card</Text>
    <Text style={theme.typography.bodySmall}>Applied on Jan 15, 2025</Text>
    <View style={styles.statusBadge}>
      <Text style={styles.statusText}>Pending Review</Text>
    </View>
  </View>
</AnimatedCard>
```

#### Stat Card
```tsx
<StatCard
  title="Total Applications"
  value="12"
  icon="document-text"
  color={theme.colors.primary[500]}
  trend="up"
  trendValue="+20%"
/>
```

### 4. Loading States

#### Content Skeleton
```tsx
<SkeletonGroup count={3} spacing={16}>
  <View>
    <SkeletonLoader height={20} width="60%" variant="text" />
    <SkeletonLoader height={16} width="40%" variant="text" style={{ marginTop: 8 }} />
  </View>
</SkeletonGroup>
```

#### Card Skeleton
```tsx
<SkeletonLoader
  height={120}
  variant="rectangular"
  animation="wave"
  borderRadius={theme.borderRadius.lg}
/>
```

#### Avatar Skeleton
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <SkeletonLoader
    height={48}
    variant="circular"
    animation="pulse"
  />
  <View style={{ marginLeft: 12 }}>
    <SkeletonLoader height={16} width={100} variant="text" />
    <SkeletonLoader height={14} width={150} variant="text" style={{ marginTop: 4 }} />
  </View>
</View>
```

### 5. Feedback Components

#### Success Toast
```tsx
<Toast
  visible={showSuccessToast}
  message="Application submitted successfully!"
  type="success"
  duration={4000}
  onHide={() => setShowSuccessToast(false)}
  position="top"
/>
```

#### Error Toast with Action
```tsx
<Toast
  visible={showErrorToast}
  message="Failed to submit application"
  type="error"
  actionLabel="Retry"
  onActionPress={retrySubmission}
  duration={5000}
  onHide={() => setShowErrorToast(false)}
/>
```

#### Empty State
```tsx
<EmptyState
  icon="document-text-outline"
  title="No Applications Yet"
  description="Start your health card application journey today"
  actionLabel="Apply Now"
  onAction={() => navigation.navigate('Apply')}
/>
```

### 6. Form Components

#### Complete Form Example
```tsx
<PageTransition type="slideUp">
  <ScrollView style={styles.container}>
    <Text style={theme.typography.h2}>Personal Information</Text>
    
    <CustomTextInput
      placeholder="First Name"
      value={firstName}
      onChangeText={setFirstName}
      accessibilityLabel="First name"
      style={styles.input}
    />
    
    <CustomTextInput
      placeholder="Last Name"
      value={lastName}
      onChangeText={setLastName}
      accessibilityLabel="Last name"
      style={styles.input}
    />
    
    <CustomTextInput
      placeholder="Email"
      leftIcon="mail"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      error={emailError}
      accessibilityLabel="Email address"
      style={styles.input}
    />
    
    <CustomTextInput
      placeholder="Phone Number"
      leftIcon="call"
      value={phone}
      onChangeText={setPhone}
      keyboardType="phone-pad"
      accessibilityLabel="Phone number"
      style={styles.input}
    />
    
    <CustomButton
      title="Continue"
      variant="primary"
      size="large"
      onPress={handleContinue}
      disabled={!isFormValid}
      loading={isSubmitting}
      style={styles.button}
    />
  </ScrollView>
</PageTransition>
```

### 7. Lists and Grids

#### Activity List
```tsx
<StaggerChildren staggerDelay={50} animationType="slide">
  {activities.map((activity) => (
    <ActivityItem
      key={activity.id}
      icon={activity.icon}
      title={activity.title}
      description={activity.description}
      timestamp={activity.timestamp}
      onPress={() => handleActivityPress(activity)}
    />
  ))}
</StaggerChildren>
```

#### Profile Links
```tsx
<View style={styles.profileSection}>
  <ProfileLink
    icon="person-outline"
    title="Personal Information"
    onPress={() => navigation.navigate('PersonalInfo')}
  />
  <ProfileLink
    icon="document-text-outline"
    title="My Applications"
    badge="3"
    onPress={() => navigation.navigate('Applications')}
  />
  <ProfileLink
    icon="notifications-outline"
    title="Notifications"
    badge="New"
    onPress={() => navigation.navigate('Notifications')}
  />
</View>
```

### 8. Animated Components

#### Page with Transition
```tsx
const ApplicationDetailsScreen = () => {
  return (
    <PageTransition type="fade" duration={400}>
      <View style={styles.container}>
        <AnimatedCard
          elevation={6}
          accessibilityLabel="Application details"
        >
          {/* Card content */}
        </AnimatedCard>
      </View>
    </PageTransition>
  );
};
```

#### Loading Screen
```tsx
const LoadingScreen = () => {
  return (
    <View style={styles.centered}>
      <SkeletonLoader
        height={200}
        width={200}
        variant="circular"
        animation="pulse"
      />
      <SkeletonLoader
        height={20}
        width="60%"
        variant="text"
        animation="pulse"
        style={{ marginTop: 24 }}
      />
    </View>
  );
};
```

## Complex Patterns

### 1. Multi-Step Form with Progress
```tsx
const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Personal Info', 'Documents', 'Review'];

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepActive
              ]}
            >
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Form Content */}
      <PageTransition type="slide" key={currentStep}>
        {currentStep === 0 && <PersonalInfoStep />}
        {currentStep === 1 && <DocumentsStep />}
        {currentStep === 2 && <ReviewStep />}
      </PageTransition>

      {/* Navigation */}
      <View style={styles.navigation}>
        <CustomButton
          title="Previous"
          variant="outline"
          onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        />
        <CustomButton
          title={currentStep === steps.length - 1 ? "Submit" : "Next"}
          variant="primary"
          onPress={() => {
            if (currentStep === steps.length - 1) {
              handleSubmit();
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
        />
      </View>
    </View>
  );
};
```

### 2. Error Handling Pattern
```tsx
const DataFetchingComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <SkeletonGroup count={5}>
        <SkeletonLoader height={80} variant="rectangular" />
      </SkeletonGroup>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-circle"
        title="Failed to Load Data"
        description={error.message}
        actionLabel="Try Again"
        onAction={fetchData}
      />
    );
  }

  return (
    <StaggerChildren staggerDelay={100}>
      {data.map(item => (
        <AnimatedCard key={item.id}>
          {/* Render item */}
        </AnimatedCard>
      ))}
    </StaggerChildren>
  );
};
```

### 3. Accessible Modal
```tsx
const AccessibleModal = ({ visible, onClose, children }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <PageTransition type="slideUp">
              <View
                style={styles.modalContent}
                accessibilityRole="dialog"
                accessibilityLabel="Modal dialog"
                accessibilityViewIsModal
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={24} />
                </TouchableOpacity>
                {children}
              </View>
            </PageTransition>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
```

## Styling Patterns

### Consistent Spacing
```tsx
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm, // React Native 0.71+
  },
  item: {
    marginHorizontal: theme.spacing.xs,
    marginVertical: theme.spacing.sm,
  },
});
```

### Responsive Layouts
```tsx
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  card: {
    width: wp('90%'),
    minHeight: hp('20%'),
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: wp('45%'),
    marginBottom: theme.spacing.md,
  },
});
```

---

*For more examples and patterns, see the [Design System Documentation](./DESIGN_SYSTEM.md)*
