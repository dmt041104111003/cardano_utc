import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import NodePolyfills from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    NodePolyfills(), // Polyfill cho các module Node.js như Buffer, process
    inject({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser' // Thêm process để tránh lỗi import
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    }
  },
  define: {
    global: 'globalThis', // Giúp hỗ trợ các thư viện yêu cầu global
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true, // Bật source map để debug dễ hơn
    rollupOptions: {
      output: {
        manualChunks: undefined, // Giúp tối ưu hóa chunk khi build
      },
    },
  },
  worker: {
    format: 'es',
  },
  experimental: {
    wasm: true,
  },
});
