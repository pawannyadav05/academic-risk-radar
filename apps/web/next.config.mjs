/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@academic-risk-radar/shared-types", "@academic-risk-radar/scoring-engine"],
};

export default nextConfig;
