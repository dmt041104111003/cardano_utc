import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [
    react(),
    inject({
      Buffer: ['buffer', 'Buffer'], // Inject Buffer để sử dụng trong trình duyệt
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer', // Định nghĩa alias cho buffer
    },
  },
  define: {
    global: 'globalThis', // Giải quyết vấn đề thiếu `global`
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
  worker: {
    format: 'es',
  },
  experimental: {
    wasm: true,
  },
});
