// stores/modules/player.ts
import { defineStore } from 'pinia'
import type { Song } from '@/types/music'

interface PlayerState {
    currentSong: Song | null
    volume: number
    isPlaying: boolean
}

export const usePlayerStore = defineStore('player', {
    state: (): PlayerState => ({
        currentSong: null,
        volume: 0.8,
        isPlaying: false
    }),
    actions: {
        async playSong(song: Song) {
            // 播放逻辑...
        },
        togglePlay() {
            this.isPlaying = !this.isPlaying
        }
    },
    getters: {
        formattedVolume: (state) => `${Math.round(state.volume * 100)}%`
    }
})