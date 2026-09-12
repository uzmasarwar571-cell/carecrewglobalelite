import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        /**
         * Firebase is split by SDK, not as one bundle: naming a single
         * "firebase" chunk would force the public site to download the
         * full Firestore SDK that only the admin panel uses.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react';
          }
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
            return 'motion';
          }
          // The Lite client the marketing site uses.
          if (id.includes('@firebase/firestore/dist/lite')) return 'firestore-lite';
          // The full client, plus auth and storage — admin only.
          if (id.includes('@firebase/firestore')) return 'firestore';
          if (id.includes('@firebase/auth') || id.includes('@firebase/storage')) return 'firebase-admin-sdk';
          return undefined;
        },
      },
    },
  },
});
