import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: false,
  },
  server: {
    sourcemapIgnoreList(sourcePath) {
      return sourcePath.includes('node_modules')
    },
  },
})
