import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // getSerie() lê os JSON de fallback com import estático (resolveJsonModule),
  // então nenhum outputFileTracingIncludes é necessário aqui — diferente da
  // S3, que lia CSV em runtime com fs.readFileSync.
};

export default nextConfig;
