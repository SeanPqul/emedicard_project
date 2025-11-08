/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tangible-pika-290.convex.cloud',
      },
    ],
  },
};

module.exports = nextConfig;
