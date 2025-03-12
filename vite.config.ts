import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/lib'],
      exclude: ['src/demo', '**/tests/**', '**/*.test.ts', '**/*.test.tsx']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "ReactOLChoropleth",
      fileName: (format) => `react-ol-choropleth.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "ol"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          ol: "ol",
        },
        assetFileNames: (assetInfo) => {
          return assetInfo.name === 'style.css' ? 'style.css' : `assets/${assetInfo.name}`;
        }
      }
    },
    sourcemap: true,
    minify: true,
    cssCodeSplit: false
  },
  server: {
    open: true
  }
})
