import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string
);

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function ClerkAndConvexProvider({children}: {children: React.ReactNode}) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
<<<<<<< HEAD
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkLoaded>
            {children}
        </ClerkLoaded>
      </ConvexProviderWithClerk>
=======
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkLoaded>
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
    </ClerkProvider>
  );
}
