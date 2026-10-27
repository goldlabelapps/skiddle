import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@skiddle/sdk', '@goldlabelapps/flash'],
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/events/:id',
        destination: '/promo/:id',
        permanent: false,
      },
    ];
  },
};

export default withPWA(nextConfig);
