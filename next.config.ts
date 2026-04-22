import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "cdn.myanimelist.net" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4gb",
    },
  },
};

export default nextConfig;
