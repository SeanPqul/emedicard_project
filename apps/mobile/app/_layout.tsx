import { ErrorBoundary, ToastProvider } from "@/src/shared/components/feedback";
import ClerkAndConvexProvider from "@/src/app-layer/providers/ClerkAndConvexProvider";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { layoutStyles } from "@/src/shared/styles/layouts/root-layout";
import { Slot } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { startAutomaticCleanup, stopAutomaticCleanup } from "@/src/shared/services/storage";
import * as SplashScreen from "expo-splash-screen";
import { AnimatedSplashScreen } from "@/src/shared/components/layout";

// Keep the native splash screen visible while we prepare the app
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Initialize automatic storage cleanup on app start
  useEffect(() => {
    startAutomaticCleanup();
    
    // Cleanup interval when app unmounts
    return () => {
      stopAutomaticCleanup();
    };
  }, []);

  // Prepare app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Add any initialization logic here (fonts, assets, etc.)
        // For now, we'll just wait a brief moment for providers to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Hide native splash when app is ready
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleAnimatedSplashComplete = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  // Show animated splash screen while app is not ready or animation is playing
  if (!appIsReady || showAnimatedSplash) {
    return <AnimatedSplashScreen onAnimationComplete={handleAnimatedSplashComplete} />;
  }

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
