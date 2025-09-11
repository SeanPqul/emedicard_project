import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    // allow imports from outside of webadmin/
    externalDir: true,
  },

  turbopack: {
    resolveAlias: {
      "@/convex": path.resolve(__dirname, "../../backend/convex"),
      "@emedicard/types": path.resolve(__dirname, "../packages/types/src"),
      "@emedicard/utils": path.resolve(__dirname, "../packages/utils/src"),
      "@emedicard/validation": path.resolve(__dirname, "../packages/validation/src"),
      "@emedicard/constants": path.resolve(__dirname, "../packages/constants/src"),
    },
  },
  
  webpack: (config) => {
    config.resolve.alias["@/convex"] = path.resolve(__dirname, "../../backend/convex");
    config.resolve.alias["@emedicard/types"] = path.resolve(__dirname, "../packages/types/src");
    config.resolve.alias["@emedicard/utils"] = path.resolve(__dirname, "../packages/utils/src");
    config.resolve.alias["@emedicard/validation"] = path.resolve(__dirname, "../packages/validation/src");
    config.resolve.alias["@emedicard/constants"] = path.resolve(__dirname, "../packages/constants/src");
    return config;
  },

};

export default nextConfig;