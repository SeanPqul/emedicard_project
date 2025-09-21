import { ErrorBoundary } from "@/src/shared/components/feedback/ErrorBoundary";
import { ToastProvider } from "@/src/core/providers/ToastProvider";
import ClerkAndConvexProvider from "@/src/core/providers/ClerkAndConvexProvider";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { layoutStyles } from "@/src/styles/layouts/root-layout";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { startAutomaticCleanup, stopAutomaticCleanup } from "@/src/shared/services/storage";

export default function RootLayout() {
  // Initialize automatic storage cleanup on app start
  useEffect(() => {
    startAutomaticCleanup();
    
    // Cleanup interval when app unmounts
    return () => {
      stopAutomaticCleanup();
    };
  }, []);

  return (
    <ErrorBoundary>
      <ClerkAndConvexProvider>
        <SafeAreaProvider>
          <SafeAreaView style={layoutStyles.safeAreaView} edges={['top', 'left', 'right']}>
            <StatusBar backgroundColor="#10B981" barStyle="dark-content" />
            <ToastProvider>
              <Slot />
            </ToastProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </ClerkAndConvexProvider>
    </ErrorBoundary>
  );
}
