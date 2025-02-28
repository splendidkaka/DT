<!-- components/PlaylistPanel.vue -->
<template>
    <div class="playlist-panel" :class="{ 'is-visible': playlistVisible  }">
      <div class="header">
        <h3>播放队列 ({{ totalTracks }})</h3>
        <div class="controls">
          <button @click="clearPlaylist" title="清空列表">
            <svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
          <button @click="togglePanel">
            <svg viewBox="0 0 24 24"><path :d="isOpen ? 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' : 'M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z'"/></svg>
          </button>
        </div>
      </div>
  
      <div class="playlist-items" ref="listContainer">
        <div 
          v-for="(track, index) in musicStore.currentPlayer.queue" 
          :key="track.id"
          class="playlist-item"
          :class="{ 'is-current': index === musicStore.currentPlayer.currentIndex }"
          @click="playTrack(index)"
        >
          <div class="track-info">
            <span class="track-number">{{ index + 1 }}.</span>
            <img 
              :src="getAlbumCover(track.albumId)" 
              class="track-cover"
              alt="专辑封面"
            />
            <div class="track-details">
              <div class="track-title">{{ track.title }}</div>
              <div class="track-artist">{{ getArtistName(track.artists) }}</div>
            </div>
          </div>
  
          <div class="track-controls">
            <button 
              @click.stop="removeFromQueue(index)"
              class="remove-btn"
              title="移除"
            >
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <span class="track-duration">{{ formatDuration(track.duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useMusicStore } from '@/store/modules/music'
  import { useSidebarStore } from '@/store/modules/sidebar'

const sidebarStore = useSidebarStore()
const { playlistVisible } = storeToRefs(sidebarStore)
  const musicStore = useMusicStore()
  // const { queue, currentIndex } = storeToRefs(musicStore)
  const isOpen = ref(true)
  
  const totalTracks = computed(() =>  musicStore.currentPlayer.queue.length)
  

  const getAlbumCover = (albumId: string) => 
    musicStore.getAlbumCover(albumId) || '/default-cover.jpg'
  
  const getArtistName = (artistId: string) => 
    musicStore.getArtist(artistId)?.name || '未知艺术家'
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const togglePanel = () => {
    isOpen.value = !isOpen.value
  }
  
  const playTrack = (index: number) => {
    musicStore.setCurrentIndex(index)
    if (!musicStore.currentPlayer.isPlaying) {
      musicStore.togglePlayback()
    }
  }
  
  const removeFromQueue = (index: number) => {
    if (index === musicStore.currentPlayer.currentIndex) {
      musicStore.nextTrack()
    }
    musicStore.removeFromQueue(index)
  }
  
  const clearPlaylist = () => {
    musicStore.clearQueue()
  }
  </script>
  
  <style lang="scss" scoped>
  .playlist-panel {
    position: fixed;
    right: -400px;
    top: 0;
    bottom: 80px; // 播放器高度
    width: 400px;
    background: rgba(255, 255, 255, 0.97);
    box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    z-index: 90;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &.is-visible {
      transform: translateX(0);
    }
  
    .header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
  
      h3 {
        margin: 0;
        font-size: 1.2rem;
        color: #333;
      }
  
      .controls {
        display: flex;
        gap: 0.8rem;
  
        button {
          background: none;
          border: none;
          padding: 0.4rem;
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.2s;
  
          &:hover {
            background: rgba(0, 0, 0, 0.05);
          }
  
          svg {
            width: 24px;
            height: 24px;
            fill: #666;
          }
        }
      }
    }
  
    .playlist-items {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
  
      .playlist-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        margin-bottom: 0.5rem;
        border-radius: 8px;
        transition: all 0.2s;
        cursor: pointer;
  
        &:hover {
          background: rgba(0, 0, 0, 0.03);
        }
  
        &.is-current {
          background: rgba($accent-color, 0.1);
          border-left: 3px solid $accent-color;
        }
  
        .track-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 0;
  
          .track-number {
            color: #666;
            font-feature-settings: "tnum";
          }
  
          .track-cover {
            width: 40px;
            height: 40px;
            border-radius: 4px;
            object-fit: cover;
          }
  
          .track-details {
            min-width: 0;
            .track-title {
              font-weight: 500;
            //   @include text-ellipsis;
            }
  
            .track-artist {
              font-size: 0.9em;
              color: #666;
            //   @include text-ellipsis;
            }
          }
        }
  
        .track-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 1rem;
  
          .remove-btn {
            opacity: 0;
            transition: opacity 0.2s;
            background: none;
            border: none;
            padding: 0.2rem;
            cursor: pointer;
  
            svg {
              width: 18px;
              height: 18px;
              fill: #999;
            }
  
            &:hover svg {
              fill: #ff4d4d;
            }
          }
  
          .track-duration {
            color: #666;
            font-feature-settings: "tnum";
            font-size: 0.9em;
          }
        }
  
        &:hover .track-controls .remove-btn {
          opacity: 1;
        }
      }
    }
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    .playlist-panel {
      width: 100%;
      bottom: 0;
      right: -100%;
  
      &.is-open {
        transform: translateX(-100%);
      }
  
      .header {
        padding: 1rem;
      }
    }
  }
  </style>