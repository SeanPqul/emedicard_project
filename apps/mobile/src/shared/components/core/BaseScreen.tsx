// Core BaseScreen component
import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ViewStyle,
  StatusBar,
  RefreshControl
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface BaseScreenProps {
  children: ReactNode;
  // Layout options
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  safeArea?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  
  // Styling
  backgroundColor?: string;
  padding?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  
  // ScrollView props (when scrollable is true)
  showsVerticalScrollIndicator?: boolean;
  refreshControl?: React.ReactElement<React.ComponentProps<typeof RefreshControl>>;
  onScroll?: (event: any) => void;
  
  // Status bar
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarColor?: string;
}

export function BaseScreen({
  children,
  scrollable = false,
  keyboardAvoiding = true,
  safeArea = true,
  edges = ['top', 'bottom'],
  backgroundColor = '#FFFFFF',
  padding = 0,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  refreshControl,
  onScroll,
  statusBarStyle = 'dark-content',
  statusBarColor,
}: BaseScreenProps) {
  const insets = useSafeAreaInsets();
  
  const Container = safeArea ? SafeAreaView : View;
  
  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: padding },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={refreshControl}
      onScroll={onScroll}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { padding }, contentContainerStyle]}>
      {children}
    </View>
  );
  
  const screenContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );
  
  return (
    <>
      <StatusBar 
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor || backgroundColor}
      />
      <Container 
        style={[
          styles.container, 
          { backgroundColor },
          style,
        ]}
        edges={edges as any}
      >
        {screenContent}
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
