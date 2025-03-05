import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createPlugins } from './vite'
import removeConsole from "vite-plugin-remove-console";
// const isMobile = process.env.BUILD_TARGET === 'mobile'

export default defineConfig({
  plugins: [vue(), ...createPlugins(),removeConsole()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/_variables.scss" as *;`
      }
    },
  }
})
