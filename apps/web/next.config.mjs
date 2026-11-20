/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@academic-risk-radar/shared-types", "@academic-risk-radar/scoring-engine"],
  async rewrites() {
    const rawTarget =
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      (process.env.NODE_ENV === "production"
        ? "https://academic-risk-api.onrender.com"
        : "http://localhost:4000");
    const apiTarget = rawTarget.trim().replace(/\/+$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
