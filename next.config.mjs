/** @type {import('next').NextConfig} */
const webpack = (config) => {
  // Grab the existing rule that handles SVG imports
  const fileLoaderRule = config.module.rules.find((rule) =>
    rule.test?.test?.('.svg'),
  );

  config.module.rules.push(
    // Reapply the existing rule, but only for svg imports ending in ?url
    {
      ...fileLoaderRule,
      test: /\.svg$/i,
      resourceQuery: /url/, // *.svg?url
    },
    // Convert all other *.svg imports to React components
    {
      test: /\.svg$/i,
      issuer: fileLoaderRule.issuer,
      resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
      use: ['@svgr/webpack'],
    },
  );

  // Modify the file loader rule to ignore *.svg, since we have it handled now.
  fileLoaderRule.exclude = /\.svg$/i;

  return config;
};

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      '@/app',
      '@/pages-flat',
      '@/widgets',
      '@/features',
      '@/entities',
      '@/shared',
    ],
  },
  rewrites: async () => {
    return [
      {
        source: `${process.env.NEXT_PUBLIC_FRONTEND_API_URL || ''}/:path*`,
        destination: `${process.env.BACKEND_API_URL || ''}/:path*`,
      },
    ];
  },
  webpack: webpack,
};

export default nextConfig;
