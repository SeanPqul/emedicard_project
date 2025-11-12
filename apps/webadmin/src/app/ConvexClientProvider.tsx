// app/ConvexClientProvider.tsx
"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import React from "react";

// Import the hook we just created
import { useStoreUser } from "./hooks/useStoreUser";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// This is a new component that calls our hook
function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  // This hook will now run for any authenticated user
  useStoreUser(); 
  return <>{children}</>;
}

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* Wrap the children with our new provider component */}
        <ConvexClerkProvider>
          {children}
        </ConvexClerkProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
