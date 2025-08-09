import { ConvexReactClient } from "convex/react";
import { config } from "../config";

if (!config.api.convexUrl) {
  throw new Error("EXPO_PUBLIC_CONVEX_URL is required");
}

export const convex = new ConvexReactClient(config.api.convexUrl);
