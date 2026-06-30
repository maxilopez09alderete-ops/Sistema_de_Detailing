/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export hosting like GitHub Pages
  },
};

module.exports = nextConfig;
