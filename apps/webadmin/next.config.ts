import type { NextConfig } from "next";
import path from "path";

// Only import bundle analyzer when needed
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: true,
    })
  : (config: NextConfig) => config;

const nextConfig: NextConfig = {
  // Disable ESLint during builds for quick deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Enable static optimization
  reactStrictMode: true,

  webpack: (config) => {
    // Alias configuration
    config.resolve.alias["@backend/convex"] = path.resolve(__dirname, "../../backend/convex");
    
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        pathname: "/api/storage/**",
      },
    ],
  },

  // Add caching headers for static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  experimental: {
    // allow imports from outside of webadmin/
    externalDir: true,
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
  },

  turbopack: {
    resolveAlias: {
      "@backend/convex": path.resolve(__dirname, "../../backend/convex"),
    },
  },

};

export default withBundleAnalyzer(nextConfig);
