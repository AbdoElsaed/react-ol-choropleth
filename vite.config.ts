import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['src/demo']
    })
  ],
  build: command === 'build' ? {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactOLChoropleth',
      fileName: (format) => `react-ol-choropleth.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'ol'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          ol: 'ol'
        }
      }
    }
  } : undefined,
  server: {
    open: true
  }
}))
