import { ErrorBoundary } from "@/src/shared/ui/ErrorBoundary";
import { ToastProvider } from "@/src/contexts/ToastContext";
import ClerkAndConvexProvider from "@/src/provider/ClerkAndConvexProvider";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { layoutStyles } from "@/src/styles/layouts/root-layout";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { startAutomaticCleanup, stopAutomaticCleanup } from "@/src/utils/storage";

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
