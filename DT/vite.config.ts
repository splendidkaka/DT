import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createPlugins } from './vite'
import removeConsole from "vite-plugin-remove-console";
// import VueMacros from 'vue-macros/vite'
// const isMobile = process.env.BUILD_TARGET === 'mobile'

export default defineConfig({

  plugins: [
    vue(), ...createPlugins(), removeConsole()
  ],
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
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://melodykira.glitch.me',
        // target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // '/video':{
      //   target: 'http://localhost:8000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/video/, '')
      // }
    }
  }
})
