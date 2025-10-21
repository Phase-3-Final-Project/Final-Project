import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'asset-2.tribunnews.com',
      },
      {
        protocol: 'https',
        hostname: 'asset.kompas.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn0-production-images-kly.akamaized.net',
      },
      {
        protocol: 'https',
        hostname: 'www.dapurkobe.co.id',
      },
      {
        protocol: 'https',
        hostname: 'cdn.rri.co.id',
      },
      {
        protocol: 'https',
        hostname: 'image.idn.media',
      },
      {
        protocol: 'https',
        hostname: 'awsimages.detik.net.id',
      },
      {
        protocol: 'https',
        hostname: 'assets.unileversolutions.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      // Add more hostnames as needed from your data.json photo URLs
      {
        protocol: 'https',
        hostname: '**.akamaized.net',
      },
      {
        protocol: 'https',
        hostname: '**.tribunnews.com',
      },
      {
        protocol: 'https',
        hostname: '**.detik.net.id',
      },
    ],
  },
};

export default nextConfig;
