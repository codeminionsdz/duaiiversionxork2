const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['nbdytzfnzccwshagzpeu.supabase.co'],
  },
  // Keep source maps in production builds to aid Sentry debugging (upload maps to Sentry for best results)
  productionBrowserSourceMaps: true,
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  silent: true, // Suppresses source map uploading logs during build
  org: "duaii", // TODO: Replace with your Sentry organization
  project: "duaii-app", // TODO: Replace with your Sentry project
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

