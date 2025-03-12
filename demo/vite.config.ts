import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/react-ol-choropleth/',
  resolve: {
    alias: {
      'react-ol-choropleth': resolve(__dirname, '../src/lib')
    }
  },
  server: {
    open: true
  }
});