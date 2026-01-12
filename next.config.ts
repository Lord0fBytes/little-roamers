import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '10.0.0.18', // Development mode (external Garage)
        port: '3900',
        pathname: '/little-roamers/**',
      },
      {
        protocol: 'http',
        hostname: 'garage', // Docker mode (internal service name)
        port: '3900',
        pathname: '/little-roamers/**',
      },
    ],
  },
};

export default nextConfig;
