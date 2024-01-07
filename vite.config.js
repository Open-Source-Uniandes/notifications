import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copy({
      targets: [
        { src: 'src/assets/*', dest: 'dist/assets' },
        { src: 'service-worker.js', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ],
  base: '/notifications/',
  build: {
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    target: 'modules',
    assetsInclude: ['**/*.jpeg', '**/*.png', '**/*.svg', '**/*.jpg', 'service-worker.js'],
  },
})
