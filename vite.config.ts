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
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'ol',
        'chroma-js'
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          ol: "ol",
          "chroma-js": "chroma"
        },
        assetFileNames: 'style.css',
        manualChunks: undefined,
        inlineDynamicImports: false,
        compact: true
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2
      },
      mangle: {
        properties: false
      },
      format: {
        comments: false
      }
    },
    cssCodeSplit: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500
  },
  server: {
    open: true
  }
})
