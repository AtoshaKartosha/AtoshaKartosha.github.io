import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "26.222.75.8"],
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
