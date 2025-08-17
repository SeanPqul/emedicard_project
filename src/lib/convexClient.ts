import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL as string;

if (!convexUrl) {
  throw new Error("EXPO_PUBLIC_CONVEX_URL is required");
}

export const convex = new ConvexReactClient(convexUrl);
