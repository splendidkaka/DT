// stores/sidebar.ts
import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    playlistVisible: false
  }),

  actions: {
    togglePlaylistVisibility() {
      this.playlistVisible = !this.playlistVisible
    }
  }
})