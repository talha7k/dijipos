import withPWA from 'next-pwa';

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

// Only apply PWA configuration in production
const withPWAConfig = process.env.NODE_ENV === 'production' 
  ? withPWA({
      dest: "public",
      register: true,
      skipWaiting: true,
    })
  : (config: any) => config;

export default withPWAConfig(nextConfig);