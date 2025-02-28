// stores/player.ts
import { defineStore } from 'pinia'
import type { Song } from '@/types/music'

interface PlayerState {
    currentSong: Song | null
    isPlaying: boolean
    volume: number
    progress: number
    playlist: Song[]
}

export const usePlayerStore = defineStore('player', {
    state: (): PlayerState => ({
        currentSong: null,
        isPlaying: false,
        volume: 80,
        progress: 0,
        playlist: []
    }),
    actions: {
        async playSong(song: Song) {
            this.currentSong = song
            this.isPlaying = true
            // 这里可以添加音频播放逻辑
        },
        togglePlay() {
            this.isPlaying = !this.isPlaying
        },
        nextSong() {
            // 实现切歌逻辑
        }
    }
})