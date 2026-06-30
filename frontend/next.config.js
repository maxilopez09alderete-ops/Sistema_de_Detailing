/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Sistema_de_Detailing',
  images: {
    unoptimized: true, // Required for static export hosting like GitHub Pages
  },
};

module.exports = nextConfig;
