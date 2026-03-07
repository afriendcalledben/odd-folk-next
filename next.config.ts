import type { NextConfig } from "next";

function urlToRemotePattern(rawUrl: string) {
  const u = new URL(rawUrl);
  return {
    protocol: u.protocol.replace(':', '') as 'http' | 'https',
    hostname: u.hostname,
    ...(u.port ? { port: u.port } : {}),
    pathname: '/**',
  };
}

// Collect unique remote patterns from MINIO_ENDPOINT and MINIO_PUBLIC_URL
const minioPatterns = Array.from(
  new Set([process.env.MINIO_ENDPOINT, process.env.MINIO_PUBLIC_URL].filter(Boolean) as string[])
).map(urlToRemotePattern);

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: minioPatterns,
  },
};

export default nextConfig;
