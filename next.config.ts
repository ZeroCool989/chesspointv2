import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  output: phase === PHASE_PRODUCTION_BUILD ? "export" : undefined,
  trailingSlash: false,
  reactStrictMode: true,
  // Disable turbo for better compatibility with Three.js packages
  turbo: undefined,
  // Transpile React Three Fiber packages
  transpilePackages: ['@react-three/fiber', '@react-three/drei', 'three'],
  // Disable ISR dev indicators to fix HMR "isrManifest" errors in Pages Router
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false, // Disable to suppress HMR errors
    buildActivityPosition: 'bottom-left',
  },
  // Disable ISR indicator to prevent HMR errors
  experimental: {
    isrMemoryCacheSize: 0,
    // Suppress HMR isrManifest errors
    optimizeCss: false,
  },
  // Additional HMR fixes
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Exclude auth-backend from Next.js build
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/auth-backend/**'],
    };
    
    // Ensure Three.js and React Three Fiber work correctly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // Ensure proper module resolution for React Three Fiber packages
    // Don't set explicit aliases - let webpack resolve normally from node_modules
    // The transpilePackages option above handles transpilation
    const path = require('path');
    
    // Ensure node_modules is in the resolve path (should be default, but being explicit)
    if (!config.resolve.modules) {
      config.resolve.modules = ['node_modules', path.resolve(__dirname, 'node_modules')];
    } else if (Array.isArray(config.resolve.modules)) {
      // Ensure node_modules is included
      const nodeModulesPath = path.resolve(__dirname, 'node_modules');
      if (!config.resolve.modules.includes('node_modules')) {
        config.resolve.modules.unshift('node_modules');
      }
      if (!config.resolve.modules.includes(nodeModulesPath)) {
        config.resolve.modules.push(nodeModulesPath);
      }
    }
    
    return config;
  },
  images: {
    unoptimized: true,
  },
  headers:
    phase === PHASE_PRODUCTION_BUILD
      ? undefined
      : async () => [
          {
            source: "/",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "require-corp",
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin",
              },
            ],
          },
          {
            source: "/engines/:blob*",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "require-corp",
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin",
              },
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
              },
              {
                key: "Age",
                value: "181921",
              },
            ],
          },
          {
            source: "/play",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "require-corp",
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin",
              },
            ],
          },
          {
            source: "/database",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "require-corp",
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin",
              },
            ],
          },
        ],
});

export default withSentryConfig(nextConfig, {
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  org: process.env.SENTRY_ORG,
  project: "javascript-nextjs",
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  sourcemaps: {
    disable: true,
  },
  disableLogger: true,
});
