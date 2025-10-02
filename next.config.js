/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
};

module.exports = nextConfig;