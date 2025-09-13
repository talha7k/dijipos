import withPWA from 'next-pwa';

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  turbopack: {
    // Turbopack configuration
    rules: {
      // Add any custom loader rules here if needed
    },
    resolveAlias: {
      // Add any module aliases here if needed
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
};

export default withPWAConfig(nextConfig);