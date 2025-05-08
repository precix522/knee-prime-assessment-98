
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import apiMiddleware from './src/server-middleware'
import { componentTagger } from 'lovable-tagger'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    apiMiddleware()
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 8080,
    host: '::'
  }
}))
