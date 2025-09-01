import InitialLayout from "@/src/layouts/InitialLayout";
import ClerkAndConvexProvider from "@/src/provider/ClerkAndConvexProvider";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ToastProvider } from "@/src/contexts/ToastContext";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ClerkAndConvexProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="#10B981" barStyle="dark-content" />
            <ToastProvider>
              <InitialLayout />
            </ToastProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </ClerkAndConvexProvider>
    </ErrorBoundary>
  );
}
