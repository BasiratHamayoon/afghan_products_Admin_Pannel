/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  strictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-afghanproduct.sanzylimited.com",
      },
    ],
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api-afghanproduct.sanzylimited.com/v1/:path*",
      },
    ];
  },
};

export default nextConfig;