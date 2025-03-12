import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/lib'],
      exclude: ['src/demo', 'dist', 'node_modules'],
    })
  ],
  build: {
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "ReactOLChoropleth",
      formats: ["es", "umd"],
      fileName: (format) => {
        return format === 'umd' ? 'react-ol-choropleth.umd.cjs' : 'react-ol-choropleth.js';
      }
    },
    rollupOptions: {
      external: ["react", "react-dom", "ol"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          ol: "ol",
        },
        assetFileNames: 'style.css'
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    cssCodeSplit: false
  },
  server: {
    open: true
  }
})
