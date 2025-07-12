# eMediCard UI/UX Implementation Guide

## Quick Start

### 1. Setting Up the Error Boundary

Wrap your app's root component with the ErrorBoundary:

```tsx
// app/_layout.tsx
import { ErrorBoundary } from '@/src/components';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack>
        {/* Your routes */}
      </Stack>
    </ErrorBoundary>
  );
}
```

### 2. Using Toast Notifications

Create a toast context for global access:

```tsx
// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastType } from '@/src/components';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as ToastType });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        {...toast}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
```

### 3. Implementing Page Transitions

Wrap your screen content with PageTransition:

```tsx
import { PageTransition } from '@/src/components';

export default function DashboardScreen() {
  return (
    <PageTransition type="fade">
      <View style={styles.container}>
        {/* Your screen content */}
      </View>
    </PageTransition>
  );
}
```

### 4. Using Skeleton Loaders

Replace loading states with skeletons:

```tsx
import { SkeletonGroup, SkeletonLoader } from '@/src/components';

// In your component
{isLoading ? (
  <SkeletonGroup count={3} spacing={16}>
    <View>
      <SkeletonLoader height={60} variant="rectangular" />
      <SkeletonLoader height={16} width="60%" variant="text" style={{ marginTop: 8 }} />
    </View>
  </SkeletonGroup>
) : (
  <YourDataComponent data={data} />
)}
```

### 5. Accessibility Best Practices

Always include accessibility props:

```tsx
// ❌ Bad
<TouchableOpacity onPress={handlePress}>
  <Text>Delete</Text>
</TouchableOpacity>

// ✅ Good
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Delete application"
  accessibilityHint="Double tap to permanently delete this application"
  accessibilityRole="button"
>
  <Text>Delete</Text>
</TouchableOpacity>
```

### 6. Using Animated Cards

Replace static cards with AnimatedCard:

```tsx
import { AnimatedCard } from '@/src/components';

<AnimatedCard
  onPress={() => handleCardPress(item.id)}
  elevation={4}
  accessibilityLabel={`${item.title} card`}
>
  <Text style={theme.typography.h3}>{item.title}</Text>
  <Text style={theme.typography.bodySmall}>{item.description}</Text>
</AnimatedCard>
```

### 7. Form Validation with Feedback

Example of a complete form with validation:

```tsx
import { CustomTextInput, CustomButton, useToast } from '@/src/components';
import { theme } from '@/src/styles/theme';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please fix the errors', 'error');
      return;
    }

    setLoading(true);
    try {
      // Your login logic
      await login(email, password);
      showToast('Login successful!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <CustomTextInput
        placeholder="Email"
        leftIcon="mail"
        value={email}
        onChangeText={setEmail}
        error={!!errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email address"
      />
      {errors.email && <ErrorText>{errors.email}</ErrorText>}

      <CustomTextInput
        placeholder="Password"
        leftIcon="lock-closed"
        rightIcon={showPassword ? "eye" : "eye-off"}
        onRightIconPress={() => setShowPassword(!showPassword)}
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        error={!!errors.password}
        accessibilityLabel="Password"
        rightIconAccessibilityLabel="Toggle password visibility"
      />
      {errors.password && <ErrorText>{errors.password}</ErrorText>}

      <CustomButton
        title="Login"
        variant="primary"
        size="large"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        accessibilityLabel="Login button"
      />
    </View>
  );
};
```

### 8. Responsive Layout Example

```tsx
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { theme } from '@/src/styles/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  card: {
    width: wp('90%'),
    alignSelf: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  gridItem: {
    width: wp('45%'),
    marginBottom: theme.spacing.md,
  },
});
```

## Common Patterns

### Loading Pattern
```tsx
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

// In your render
if (loading) return <SkeletonLoader />;
if (error) return <EmptyState icon="alert-circle" title="Error" description={error.message} />;
return <YourComponent data={data} />;
```

### Error Handling Pattern
```tsx
try {
  const result = await apiCall();
  showToast('Success!', 'success');
} catch (error) {
  showToast(error.message || 'Something went wrong', 'error');
}
```

### Animation Pattern
```tsx
<StaggerChildren staggerDelay={100} animationType="fade">
  {items.map(item => (
    <AnimatedCard key={item.id}>
      {/* Content */}
    </AnimatedCard>
  ))}
</StaggerChildren>
```

## Performance Tips

1. **Use React.memo for complex components**
   ```tsx
   export const ComplexComponent = React.memo(({ data }) => {
     // Component logic
   });
   ```

2. **Lazy load screens**
   ```tsx
   const ProfileScreen = React.lazy(() => import('./screens/Profile'));
   ```

3. **Optimize images**
   ```tsx
   import { Image } from 'expo-image';
   
   <Image
     source={{ uri: imageUrl }}
     placeholder={blurhash}
     contentFit="cover"
     transition={1000}
   />
   ```

4. **Use FlatList for long lists**
   ```tsx
   <FlatList
     data={items}
     renderItem={({ item }) => <AnimatedCard>{/* Item */}</AnimatedCard>}
     keyExtractor={item => item.id}
     showsVerticalScrollIndicator={false}
     initialNumToRender={10}
     maxToRenderPerBatch={10}
     windowSize={10}
   />
   ```

## Testing Accessibility

1. **Enable TalkBack (Android) or VoiceOver (iOS)**
2. **Test navigation with screen reader**
3. **Verify all interactive elements are accessible**
4. **Check color contrast ratios**
5. **Test with reduced motion enabled**

## Troubleshooting

### Common Issues

1. **Animations not working**
   - Check if reduce motion is enabled
   - Ensure `useNativeDriver` is properly set

2. **Toast not showing**
   - Verify ToastProvider is wrapping your app
   - Check z-index conflicts

3. **Accessibility labels not reading**
   - Ensure `accessible={true}` for custom components
   - Check if parent components are blocking accessibility

4. **Performance issues**
   - Profile with React DevTools
   - Check for unnecessary re-renders
   - Optimize heavy computations with useMemo

---

*For detailed documentation, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)*
