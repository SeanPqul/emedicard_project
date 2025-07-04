import InitialLayout from "@/src/layouts/InitialLayout";
import ClerkAndConvexProvider from "@/src/provider/ClerkAndConvexProvider";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar backgroundColor="#10B981" barStyle="dark-content" />
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
