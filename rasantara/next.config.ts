import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading remote images from Wikimedia (and add more as needed)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
