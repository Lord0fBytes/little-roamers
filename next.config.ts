import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'garage', // Docker internal service name
        port: '3900',
        pathname: '/little-roamers/**',
      },
    ],
  },
};

export default nextConfig;
