import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@radix-ui'],
  experimental: {
    optimizeCss: false,
  },
  eslint: {
    // ⚠️ Allows builds to succeed even with lint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
