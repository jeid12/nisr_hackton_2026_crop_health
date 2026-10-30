/** @type {import('next').NextConfig} */
// Static export: the dashboard fetches data from the API in the browser, so it can be hosted as a static site.
// The API address is not a secret (the browser must call it), so it is mapped into the build from the
// `Config` environment variable. Next.js inlines only the variables mapped here.
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  env: {
    CROPHEALTH_API_BASE: process.env.Config || process.env.API_BASE || '',
  },
};

module.exports = nextConfig;
