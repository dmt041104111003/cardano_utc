import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import nodePolyfills from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // 🔥 Đúng cách import (không dùng NodePolyfills)
    inject({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser' // 🔥 Fix lỗi process/browser
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    }
  },
  define: {
    global: 'globalThis', // 🔥 Fix lỗi global không tồn tại
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true, // 🔍 Giúp debug dễ hơn
    rollupOptions: {
      output: {
        manualChunks: undefined, // 🔥 Giúp tối ưu hóa chunk khi build
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
