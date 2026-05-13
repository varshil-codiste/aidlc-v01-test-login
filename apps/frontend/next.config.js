/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // BE is on a separate origin in dev; cookies cross only because both are localhost
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*` }];
  },
};
module.exports = nextConfig;
