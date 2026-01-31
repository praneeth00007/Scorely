import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'string_decoder', 'events', 'path', 'crypto', 'assert'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      'string_decoder/': 'string_decoder',
      'stream/': 'stream-browserify',
      'util/': 'util',
      'vm': path.resolve(__dirname, 'src/shims/vm-shim.js'),
    }
  },
  define: {
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'string_decoder',
      'util',
      'stream-browserify',
      'events',
      'assert',
      'joi',
      '@web3-onboard/core',
      '@web3-onboard/react',
      '@web3-onboard/injected-wallets',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'PURE_ANNOTATION' || warning.message.includes('PURE')) return;
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
      output: {
        interop: "auto",
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          web3: ['@web3-onboard/core', '@web3-onboard/react', '@web3-onboard/injected-wallets'],
          ethers: ['ethers'],
          iexec: ['@iexec/dataprotector', 'iexec']
        }
      }
    },
    chunkSizeWarningLimit: 2048,
  },
});
