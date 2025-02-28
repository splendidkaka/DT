import { defineStore } from 'pinia'
import { mockPlaylists, mockSongs } from '@/mock/api/mockData'
import type { Playlist, Song } from '@/types/music'

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    playlists: mockPlaylists,
    hotSongs: mockSongs
  }),
  actions: {
    async getFeaturedPlaylists(): Promise<Playlist[]> {
      return this.playlists
    },
    async getHotSongs(): Promise<Song[]> {
      return this.hotSongs
    },
    async getPlaylistById(id: string): Promise<Playlist | undefined> {
      return this.playlists.find(p => p.id === id)
    },
    async getArtistAlbums(artistId: string): Promise<Playlist[]> {
      return this.playlists.filter(p => p.id.includes(artistId))
    }
  }
})