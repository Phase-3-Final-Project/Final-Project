import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Major News Networks (wildcards to cover all subdomains)
      { protocol: 'https', hostname: '**.kompas.com' },
      { protocol: 'https', hostname: '**.tribunnews.com' },
      { protocol: 'https', hostname: '**.grid.id' },
      { protocol: 'https', hostname: '**.detik.net.id' },
      { protocol: 'https', hostname: '**.akamaized.net' },
      { protocol: 'https', hostname: '**.idn.media' },
      { protocol: 'https', hostname: '**.idntimes.com' },
      
      // RRI & Government
      { protocol: 'https', hostname: '**.rri.co.id' },
      { protocol: 'https', hostname: '**.myhuaweicloud.com' },
      { protocol: 'https', hostname: '**.polri.go.id' },
      { protocol: 'https', hostname: '**.go.id' },
      { protocol: 'https', hostname: '**.ac.id' },
      
      // Food & Recipe Sites
      { protocol: 'https', hostname: '**.yummy.co.id' },
      { protocol: 'https', hostname: '**.dapurkobe.co.id' },
      { protocol: 'https', hostname: '**.unileversolutions.com' },
      { protocol: 'https', hostname: '**.unileverfoodsolutions.co.id' },
      { protocol: 'https', hostname: '**.cpcdn.com' },
      { protocol: 'https', hostname: '**.sasa.co.id' },
      { protocol: 'https', hostname: '**.primarasa.co.id' },
      
      // Media & CDN
      { protocol: 'https', hostname: '**.gumlet.io' },
      { protocol: 'https', hostname: '**.pikiran-rakyat.com' },
      { protocol: 'https', hostname: '**.bacakoran.co' },
      { protocol: 'https', hostname: '**.telkomsel.com' },
      { protocol: 'https', hostname: '**.promediateknologi.id' },
      
      // Tourism & Travel
      { protocol: 'https', hostname: 'indonesia.travel' },
      { protocol: 'https', hostname: 'pariwisataindonesia.id' },
      { protocol: 'https', hostname: '**.topwisata.info' },
      
      // E-commerce & Business (wildcards)
      { protocol: 'https', hostname: '**.co.id' },
      { protocol: 'https', hostname: '**.id' },
      { protocol: 'https', hostname: '**.com' },
      
      // CDN & Cloud Storage (wildcards)
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.b-cdn.net' },
      { protocol: 'https', hostname: '**.neo.id' },
      
      // General Image Hosts
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '**.gstatic.com' },
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: '**.pinimg.com' },
      { protocol: 'https', hostname: 'mediapijar.com' },
      { protocol: 'https', hostname: 'rottebakery.com' },
      { protocol: 'https', hostname: 'rajominang.id' },
      { protocol: 'https', hostname: 'kilkennybookcentre.com' },
      { protocol: 'https', hostname: '**.kotabukittinggi.com' },
    ],
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
