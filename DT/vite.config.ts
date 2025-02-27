import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createPlugins } from './vite'


export default defineConfig({
  plugins: [vue(), ...createPlugins()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  }


})
