<!-- components/PlaylistPanel.vue -->
<template>
  <div class="playlist-panel" :class="{ 'is-visible': playlistVisible }">
    <div class="header">
      <h3>播放队列 ({{ totalTracks }})</h3>
      <div class="controls">
        <button @click="shufflePlaylist" title="随机打乱">
          <svg viewBox="0 0 24 24">
            <path
              d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.92l-1.41 1.41 3.13 3.13-1.41 1.41 3.14 3.14L20 19.5l-5.17-5.17 1.42-1.41z" />
          </svg>
        </button>
        <button @click="clearPlaylist" title="清空列表">
          <svg viewBox="0 0 24 24">
            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
        <button @click="togglePanel">
          <svg viewBox="0 0 24 24">
            <path
              :d="isOpen ? 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' : 'M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z'" />
          </svg>
        </button>
      </div>
    </div>

    <div class="playlist-items" ref="listContainer">
      <div v-for="(track, index) in musicStore.currentPlayer.queue" :key="track" class="playlist-item"
        :class="{ 'is-current': index === musicStore.currentPlayer.currentIndex }" @click="playTrack(index)">
        <div class="track-info">
          <span class="track-number">{{ index + 1 }}.</span>
          <img :src="musicStore.getSongCover(track)" class="track-cover" alt="专辑封面" />
          <div class="track-details">
            <div class="track-title">{{ musicStore.getSongName(track) }}</div>
            <div class="track-artist">{{ musicStore.getSongArtist(track) }}</div>
          </div>
        </div>

        <div class="track-controls">
          <button @click.stop="removeFromQueue(index)" class="remove-btn" title="移除">
            <svg viewBox="0 0 24 24">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
          <span class="track-duration">{{ formatTime(musicStore.getSongDuration(track)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMusicStore } from '@/store/modules/music'
import { useSidebarStore } from '@/store/modules/sidebar'
import { useDevice } from '@/hooks/useDevice'


const { isMobile } = useDevice()
const sidebarStore = useSidebarStore()
const { playlistVisible } = storeToRefs(sidebarStore)
const musicStore = useMusicStore()
// const { queue, currentIndex } = storeToRefs(musicStore)
const isOpen = ref(true)

const totalTracks = computed(() => musicStore.currentPlayer.queue.length)

// const currentSong = computed(() => musicStore.currentSong)
// const isPlaying = computed(() => musicStore.currentPlayer.isPlaying)
// const progress = computed(() => musicStore.currentPlayer.progress)



// 工具函数
const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

// const getAlbumCover = (albumId: string) =>
//   musicStore.getAlbumCover(albumId) || '/default-cover.jpg'

// const getArtistName = (artistId: string) =>
//   musicStore.getArtist(artistId)?.name || '未知艺术家'

// const formatDuration = (seconds: number) => {
//   const mins = Math.floor(seconds / 60)
//   const secs = seconds % 60
//   return `${mins}:${secs.toString().padStart(2, '0')}`
// }




const togglePanel = () => {
  sidebarStore.togglePlaylistVisibility()
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

const shufflePlaylist = () => {
  const currentIndex = musicStore.currentPlayer.currentIndex
  const queue = [...musicStore.currentPlayer.queue]

  if (queue.length < 2) return

  // 保留当前歌曲
  const currentTrack = queue[currentIndex]

  // 创建不包括当前歌曲的新数组
  const filtered = queue.filter((_, i) => i !== currentIndex)

  // Fisher-Yates 洗牌算法
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]]
  }

  // 重新插入当前歌曲到原位置
  filtered.splice(currentIndex, 0, currentTrack)

  // 更新队列（保持响应式）
  musicStore.currentPlayer.queue = filtered

  // 维持当前播放状态
  // if (musicStore.currentPlayer.isPlaying) {
  //   musicStore.currentPlayer.audioElement?.play()
  // }
}
</script>

<style lang="scss" scoped>
.playlist-panel {
  position: fixed;
  right: 0px;
  top: 100px;
  bottom: 100px; // 播放器高度
  width: 400px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 99990;
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

// 修改现有媒体查询部分
@media (max-width: 768px) {
  .playlist-panel {
    width: 100%;
    top: 0;
    bottom: 0;
    right: 0;
    transform: translateX(100%); // 始终从右侧进入
    border-radius: 0;

    // 移动端全屏高度
    &.is-visible {
      transform: translateX(0);
      box-shadow: none;
    }

    .header {
      padding: 1rem;
      position: sticky;
      top: 0;
      background: rgba(255, 255, 255, 0.97);
      z-index: 1;

      h3 {
        font-size: 1.1rem;
      }

      // 缩小按钮间距
      .controls {
        gap: 0.6rem;

        button {
          padding: 0.3rem;

          svg {
            width: 20px;
            height: 20px;
          }
        }
      }
    }

    .playlist-items {
      padding: 0.5rem;

      // 优化触摸体验
      -webkit-overflow-scrolling: touch;

      .playlist-item {
        padding: 0.75rem;
        margin-bottom: 0.25rem;

        .track-info {
          gap: 0.75rem;

          .track-cover {
            width: 36px;
            height: 36px;
          }

          .track-details {
            .track-title {
              font-size: 0.95rem;
            }

            .track-artist {
              font-size: 0.85rem;
            }
          }
        }

        .track-controls {
          .track-duration {
            font-size: 0.85rem;
          }
        }
      }
    }
  }
}

// 添加横屏适配
@media (max-width: 768px) and (orientation: landscape) {
  .playlist-panel {
    top: 50px; // 给顶部栏留出空间

    .header {
      padding: 0.75rem;
    }
  }
}

// 添加小屏幕手机适配
@media (max-width: 480px) {
  .playlist-panel {
    .header {
      h3 {
        font-size: 1rem;
      }
    }

    .playlist-item {
      .track-number {
        display: none; // 小屏幕隐藏序号
      }

      .track-controls {
        margin-left: 0.5rem;
        gap: 0.5rem;

        .remove-btn {
          opacity: 1 !important; // 始终显示删除按钮
        }
      }
    }
  }
}
</style>