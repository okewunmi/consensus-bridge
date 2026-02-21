// module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,  // Disable Strict Mode to fix double-mounting
  images:{unoptimized: true} // Disable image optimization to fix image loading issues
}

module.exports = nextConfig