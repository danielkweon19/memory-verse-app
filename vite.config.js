import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// How to deploy to git: https://www.youtube.com/watch?v=yo2bMGnIKE8&ab_channel=LearnVue
// npm run build
// git add dist -f 
// git commit -m "..."
// git subtree push --prefix dist origin gh-pages
export default defineConfig({
  base: '/memory-verse-app/',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
