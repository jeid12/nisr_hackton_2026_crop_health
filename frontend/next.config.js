/** @type {import('next').NextConfig} */
// Static export: the dashboard fetches data from the API in the browser, so it can be hosted as a Render static site.
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
};

module.exports = nextConfig;
