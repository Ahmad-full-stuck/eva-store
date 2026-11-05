import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const appRoot = path.resolve(import.meta.dirname, '../client-platform')

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(appRoot, 'src'),
      '@assets': path.resolve(import.meta.dirname, '..', '..', 'attached_assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: appRoot,
  publicDir: path.resolve(appRoot, 'brand-public'),
  build: {
    outDir: path.resolve(appRoot, 'dist'),
    emptyOutDir: true,
  },
})
