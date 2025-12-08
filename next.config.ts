import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Tell Webpack to ignore the React Native specific module
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };

    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
