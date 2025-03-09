import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [
    react(),
    inject({
      Buffer: ['buffer', 'Buffer']  
    })
  ],
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
  resolve: {
    alias: {
      buffer: 'buffer', 
    }
  }
});