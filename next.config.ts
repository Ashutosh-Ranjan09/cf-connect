import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@radix-ui'],
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
