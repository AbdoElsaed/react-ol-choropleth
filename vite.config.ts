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
        /^ol\/.*/,  // Mark all OpenLayers imports as external
        'chroma-js'
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "ol/Map.js": "ol.Map",
          "ol/View.js": "ol.View",
          "ol/layer/Tile.js": "ol.layer.Tile",
          "ol/layer/Vector.js": "ol.layer.Vector",
          "ol/source/Vector.js": "ol.source.Vector",
          "ol/source/OSM.js": "ol.source.OSM",
          "ol/source/XYZ.js": "ol.source.XYZ",
          "ol/format/GeoJSON.js": "ol.format.GeoJSON",
          "ol/style.js": "ol.style",
          "ol/Feature.js": "ol.Feature",
          "ol/geom.js": "ol.geom",
          "ol/geom/Polygon.js": "ol.geom.Polygon",
          "ol/Overlay.js": "ol.Overlay",
          "chroma-js": "chroma"
        },
        assetFileNames: 'style.css',
        inlineDynamicImports: true,
        manualChunks: undefined,
        compact: true
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
        module: true,
        toplevel: true
      },
      mangle: {
        properties: false,
        toplevel: true
      },
      format: {
        comments: false,
        ecma: 2020
      }
    },
    cssCodeSplit: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    target: 'es2020'
  },
  optimizeDeps: {
    exclude: ['ol']
  },
  server: {
    open: true
  }
})
