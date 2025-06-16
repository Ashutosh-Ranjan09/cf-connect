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
  // typescript: {
  //   // ⚠️ allows `next build` to succeed even with TS errors
  //   ignoreBuildErrors: true,
  // },
  images: {
    domains: [
      'userpic.codeforces.org',
      // add other domains if needed
    ],
  },
};

export default nextConfig;
