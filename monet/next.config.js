const withTM = require("next-transpile-modules")([]);

const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackPluginOptions = {
  silent: true, 
};


if (process.env.NEXT_PUBLIC_ENV !== 'dev') {
  /** @type {import('next').NextConfig} */
  module.exports = withSentryConfig({
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
        {
          protocol: "http",
          hostname: "**",
        }
      ],
      unoptimized: true
    },
    reactStrictMode: true,
    productionBrowserSourceMaps: false,
    webpack: (config, {isServer}) => {
      config.resolve.fallback = {
        fs: false,
        os: false,
        path: false,
        crypto: false,
      };


      return config;
    },
  }, sentryWebpackPluginOptions);
} else {
  module.exports = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
        {
          protocol: "http",
          hostname: "**",
        },
      ],
      unoptimized: true
    },
    reactStrictMode: true,
    productionBrowserSourceMaps: false,
    webpack: (config, {isServer}) => {
      config.resolve.fallback = {
        fs: false,
        os: false,
        path: false,
        crypto: false,
      };


      return config;
    },
  };
}
