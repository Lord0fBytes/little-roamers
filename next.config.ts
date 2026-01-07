import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '10.0.0.18',
        port: '3900',
        pathname: '/little-roamers/**',
      },
    ],
  },
};

export default nextConfig;
