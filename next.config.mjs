/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Pasted Booking.com page source can be large; the wizard condenses it
      // client-side first, but allow headroom for the fallback.
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Booking.com listing photos (cf.bstatic.com, q-cf.bstatic.com, …)
      {
        protocol: "https",
        hostname: "**.bstatic.com",
      },
      // Wikimedia Commons location photos (the keyless image search)
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
};

export default nextConfig;
