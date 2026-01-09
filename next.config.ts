import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Exclure certaines routes du build statique
  output: 'standalone',
};

export default nextConfig;
