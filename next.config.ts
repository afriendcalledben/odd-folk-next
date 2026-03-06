import type { NextConfig } from "next";

const minioUrl = process.env.MINIO_ENDPOINT ? new URL(process.env.MINIO_ENDPOINT) : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: minioUrl ? [
      {
        protocol: minioUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: minioUrl.hostname,
        ...(minioUrl.port ? { port: minioUrl.port } : {}),
        pathname: '/**',
      },
    ] : [],
  },
};

export default nextConfig;
