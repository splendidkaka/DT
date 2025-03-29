<!-- components/PlaylistPanel.vue -->
<template>
  <div class="playlist-panel" :class="{ 'is-visible': playlistVisible }">
    <div class="header">
      <h3>播放队列 ({{ totalTracks }})</h3>
      <div class="controls">
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

    <draggable 
      v-model="musicStore.currentPlayer.queue"
      class="playlist-items"
      item-key="id"
      handle=".drag-handle"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      :animation="200"
      @end="onDragEnd"
    >
      <template #item="{ element: track, index }">
        <div 
          class="playlist-item"
          :class="{ 'is-current': index === musicStore.currentPlayer.currentIndex }"
          @click="playTrack(index)"
        >
          <!-- 拖拽手柄 -->
          <div class="drag-handle">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3v4h-3v3l5 5 5-5v-3h-3v-4h-4z"/>
            </svg>
          </div>

          <!-- 原有内容保持不变 -->
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
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMusicStore } from '@/store/modules/music'
import { useSidebarStore } from '@/store/modules/sidebar'
import draggable from 'vuedraggable'

const sidebarStore = useSidebarStore()
const musicStore = useMusicStore()
const { playlistVisible } = storeToRefs(sidebarStore)
const isOpen = ref(true)

const totalTracks = computed(() => musicStore.currentPlayer.queue.length)

// 原有工具函数
const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

// 原有方法保持不变
const togglePanel = () => sidebarStore.togglePlaylistVisibility()
const playTrack = (index: number) => {
  musicStore.setCurrentIndex(index)
  if (!musicStore.currentPlayer.isPlaying) musicStore.togglePlayback()
}
const removeFromQueue = (index: number) => {
  if (index === musicStore.currentPlayer.currentIndex) musicStore.nextTrack()
  musicStore.removeFromQueue(index)
}
const clearPlaylist = () => musicStore.clearQueue()

// 新增拖拽处理方法
const onDragEnd = (evt: any) => {
  const { oldIndex, newIndex } = evt
  adjustCurrentIndex(oldIndex, newIndex)
}

const adjustCurrentIndex = (oldIndex: number, newIndex: number) => {
  const current = musicStore.currentPlayer.currentIndex
  console.log(current, oldIndex, newIndex)
  if (current === oldIndex) {
    musicStore.currentPlayer.currentIndex = newIndex
  } else if (current > oldIndex && current <= newIndex) {
    musicStore.currentPlayer.currentIndex--
  } else if (current < oldIndex && current >= newIndex) {
    musicStore.currentPlayer.currentIndex++
  }
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
/* 原有样式保持不变，新增以下拖拽相关样式 */
.drag-handle {
  cursor: grab;
  padding: 0 12px;
  opacity: 0.4;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  
  svg {
    fill: #666;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    cursor: grabbing;
  }
}

.drag-ghost {
  opacity: 0.6;
  background: rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.drag-chosen {
  background: rgba(0, 0, 0, 0.03);
}

.playlist-item {
  /* 添加拖拽相关交互效果 */
  transition: transform 0.2s ease;
  user-select: none;
  
  &:hover .drag-handle {
    opacity: 0.6;
  }
}

/* 调整原有样式保持布局一致 */
.track-info {
  flex: 1;
  /* 保持原有flex布局 */
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

/* 响应式设计保持原有样式 */
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