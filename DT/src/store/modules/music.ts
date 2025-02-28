// stores/music.ts
import { defineStore } from 'pinia'
import type { Artist, Album, Song, Playlist } from '@/types/music'
import {
    mockArtists,
    mockAlbums,
    mockSongs,
    mockPlaylists
} from '@/mock/api/mockData'

interface MusicState {
    artists: Record<string, Artist>
    albums: Record<string, Album>
    songs: Record<string, Song>
    playlists: Record<string, Playlist>
    currentPlayer: {
        queue: string[]
        currentIndex: number
        isPlaying: boolean
        progress: number
        duration: number
    }
    selectedArtistId: string | null
}

export const useMusicStore = defineStore('music', {
    state: (): MusicState => ({
        artists: {},
        albums: {},
        songs: {},
        playlists: {},
        currentPlayer: {
            queue: [],
            currentIndex: -1,
            isPlaying: false,
            progress: 0,
            duration: 0
        },
        selectedArtistId: 'dt'
    }),

    getters: {
        // // 精选专辑列表
        // featuredPlaylists(): Album[] {
        //     return Object.values(this.albums).filter(a => a.featured)
        // },

        // // 热门歌曲（播放量前10）
        // hotSongs(): Song[] {
        //     return Object.values(this.songs)
        //         .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
        //         .slice(0, 10)
        // },

        getArtist: (state) => (id: string) => state.artists[id],

        getArtistAlbums: (state) => (artistId: string) => {
            const artist = state.artists[artistId]
            return artist ? artist.albums.map(id => state.albums[id]) : []
        },
        getSongsByAlbum: (state) => (albumId: string) => {
            const album = state.albums[albumId]
            console.log('getSongsByAlbum', album)
            return album ? album.songs.map(id => state.songs[id]) : []
        },
        getAlbumDetails: (state) => (albumId: string) => {
            const album = state.albums[albumId]
            return album ? {
                ...album,
                artist: state.artists[album.artistId],
                songs: album.songs.map(id => state.songs[id])
            } : null
        },
        getAlbumCover: (state) => (albumId: string) => {
            return state.albums[albumId]?.cover || '/default-cover.jpg'
        },
        getArtistBySong: (state) => (songId: string) => {
            return Object.values(state.artists).find(artist => artist.id === state.songs[songId]?.artists[0])?.name || null
        },
        currentSong(state): Song | null {
            console.log('currentSong', state.currentPlayer.queue[state.currentPlayer.currentIndex])
            return this.songs[state.currentPlayer.queue[state.currentPlayer.currentIndex]] || null
        },
        // 获取当前播放进度百分比
        progressPercent(state): number {
            return (state.currentPlayer.progress / state.currentPlayer.duration) * 100 || 0
        },
        getselectedArtistId(state): string | null {
            return state.selectedArtistId
        }
    },

    actions: {
        // 初始化本地mock数据
        initMockData() {
            // 转换artist数据
            this.artists = mockArtists.reduce((acc, artist) => {
                acc[artist.id] = {
                    ...artist,
                    albums: artist.albums || []
                }
                return acc
            }, {} as Record<string, Artist>)

            // 转换album数据
            this.albums = mockAlbums.reduce((acc, album) => {
                acc[album.id] = {
                    ...album,
                    songs: album.songs || []
                }
                return acc
            }, {} as Record<string, Album>)

            // 转换song数据
            this.songs = mockSongs.reduce((acc, song) => {
                acc[song.id] = song
                return acc
            }, {} as Record<string, Song>)

            // 转换playlist数据
            this.playlists = mockPlaylists.reduce((acc, playlist) => {
                acc[playlist.id] = {
                    ...playlist,
                    songs: playlist.songs || []
                }
                return acc
            }, {} as Record<string, Playlist>)
        },

        // 播放控制
        playAlbum(albumId: string) {
            const album = this.albums[albumId]
            if (album) {
                this.currentPlayer.queue = [...album.songs]
                this.currentPlayer.currentIndex = 0
                this.currentPlayer.isPlaying = true
            }
        },
        // 新增：播放单曲
        playSong(songId: string) {
            console.log('playSong', songId)
            this.currentPlayer.queue = [songId]
            this.currentPlayer.currentIndex = 0
            this.currentPlayer.isPlaying = true
            this.currentPlayer.progress = 0
        },

        // 新增：播放指定歌曲队列
        playQueue(songIds: string[], index = 0) {
            this.currentPlayer.queue = songIds
            this.currentPlayer.currentIndex = index
            this.currentPlayer.isPlaying = true
            this.currentPlayer.progress = 0
        },

        // 修改：切换播放状态
        togglePlayback() {
            this.currentPlayer.isPlaying = !this.currentPlayer.isPlaying
        },

        // 新增：更新播放进度
        updateProgress(progress: number) {
            this.currentPlayer.progress = progress
        },

        // 新增：更新总时长
        updateDuration(duration: number) {
            this.currentPlayer.duration = duration
        },
        nextTrack() {
            if (this.currentPlayer.currentIndex < this.currentPlayer.queue.length - 1) {
                this.currentPlayer.currentIndex++
            } else {
                this.currentPlayer.currentIndex = 0 // 循环播放
            }
        },

        prevTrack() {
            if (this.currentPlayer.currentIndex > 0) {
                this.currentPlayer.currentIndex--
            }
        },
        // 新增队列操作方法
        setCurrentIndex(index: number) {
            if (index >= 0 && index < this.currentPlayer.queue.length) {
                this.currentPlayer.currentIndex = index
            }
        },

        removeFromQueue(index: number) {
            if (index === this.currentPlayer.currentIndex) {
                this.nextTrack()
            }
            this.currentPlayer.queue.splice(index, 1)
            if (this.currentPlayer.currentIndex >= this.currentPlayer.queue.length) {
                this.currentPlayer.currentIndex = Math.max(this.currentPlayer.queue.length - 1, 0)
            }
        },

        clearQueue() {
            this.currentPlayer.queue = []
            this.currentPlayer.currentIndex = -1
            this.currentPlayer.isPlaying = false
        },
        setSelectedArtistId(id: string) {
            this.selectedArtistId = id
        }
    }
})