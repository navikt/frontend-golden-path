/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://cdn.nav.no/frontend-golden-path"
      : undefined,
};

export default nextConfig;
