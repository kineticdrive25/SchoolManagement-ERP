/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.pexels.com" },

      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // allow all paths
      },
    ],

  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
