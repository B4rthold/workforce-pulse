/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Playwright must not be bundled by webpack — load from node_modules at runtime.
    serverComponentsExternalPackages: ["playwright-core"],
  },
};

module.exports = nextConfig;
