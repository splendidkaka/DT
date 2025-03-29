<!-- components/SongList.vue -->
<script setup lang="ts">
import type { Song } from '@/types/music'
import { useMusicStore } from '@/store/modules/music'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus';
import { emitter}from '@/utils/eventBus'

const props = defineProps<{
  album: string
}>()

const musicStore = useMusicStore()
const addedSongs = ref<Set<string>>(new Set())
const isPlaying = computed(() => musicStore.currentPlayer.isPlaying)

// 播放/暂停切换
const togglePlayback = (song: Song) => {
  if (musicStore.currentSong?.id === song.id) {
    console.log('togglePlayback')
    emitter.emit('togglePlay', !isPlaying)

  } else {
    musicStore.playSong(song.id)
  }
}

// 队列操作
const handleQueueAction = (song: Song, event: Event) => {
  event.stopPropagation()
  console.log('song:', song)
  if (musicStore.isSongInQueue(song.id)) {
    musicStore.removeSong(song.id)
    ElMessage.success('删除成功')
  } else {
    musicStore.addToQueue(song.id)
    addedSongs.value.add(song.id)
    ElMessage.success('添加成功')
    setTimeout(() => addedSongs.value.delete(song.id), 1000)
  }
}

const albumSongs = computed(() => {
  return musicStore.getSongsByAlbum(props.album)
})



</script>

<template>
  <ul class="song-list">
    <li v-for="song in albumSongs" :key="song.id" class="song-item" @click.self="togglePlayback(song)">
      <!-- 专辑封面 -->
      <img :src="musicStore.getAlbumCover(song.albumId)" class="album-cover" @click="togglePlayback(song)" />

      <!-- 歌曲信息 -->
      <div class="song-info">
        <h3 :class="{ 'playing': musicStore.currentSong?.id === song.id }">
          {{ song.title }}
        </h3>
        <p>{{ musicStore.getArtistBySong(song.id) }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="song-actions" @click.stop>
        <!-- 播放/暂停按钮 -->
        <button class="play-button" @click="togglePlayback(song)"
          :aria-label="musicStore.currentSong?.id === song.id ? '暂停' : '播放'">
          <svg v-if="musicStore.currentSong?.id !== song.id || !musicStore.currentPlayer.isPlaying" class="play-icon"
            viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="pause-icon" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>

        <!-- 队列操作按钮 -->
        <button class="queue-button" :class="{
          'in-queue': musicStore.isSongInQueue(song.id),
          'added': addedSongs.has(song.id)
        }" @click="handleQueueAction(song, $event)" aria-label="队列操作">
          <svg class="add-icon" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <svg class="check-icon" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <svg class="remove-icon" viewBox="0 0 24 24">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
/* 强制覆盖样式 */
// :deep(.el-message) {
//   top: 50% !important;
//   left: 50% !important;
//   transform: translate(-50%, -50%) !important;
//   min-width: 380px;
//   box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
// }

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;

  .song-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 1.5rem;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--item-hover-bg);
    }

    .album-cover {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      object-fit: cover;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .song-info {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0 0 0.25rem;
        font-size: 1.1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &.playing {
          color: var(--primary-color);
        }
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
    }

    .song-actions {
      display: flex;
      gap: 1rem;
      margin-left: auto;

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.9);
        }

        svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        &.play-button {
          color: var(--text-primary);
          padding: 8px;

          &:hover {
            color: var(--primary-color);
          }

          .play-icon,
          .pause-icon {
            transition: transform 0.2s ease;
          }
        }

        &.queue-button {
          position: relative;
          width: 40px;
          height: 40px;
          color: var(--text-secondary);
          border: 2px solid var(--text-secondary);
          border-radius: 50%;

          svg {
            position: absolute;
            width: 20px;
            height: 20px;
            opacity: 0;
            transform: scale(0.5);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
          }

          .add-icon {
            opacity: 1;
            transform: scale(1);
          }

          &:hover {
            background-color: var(--el-color-success-light-5);
            transform: scale(1.1);
          }

          // 已存在队列中的状态
          &.in-queue {
            border-color: var($success-color);
            background-color: var(--el-color-success-light-5);
            // background: rgba(var($success-color-rgb), 0.1);

            .add-icon {
              opacity: 0;
              transform: scale(0.5);
            }

            .check-icon {
              opacity: 1;
              transform: scale(1);
              fill: var(--success-color);
            }

            &:hover {
              background-color: var(--el-color-danger-light-5);

              .check-icon {
                opacity: 0;
                // background-color: aqua;
                transform: scale(0.5);
              }

              .remove-icon {
                opacity: 1;
                transform: scale(1);
                fill: var(--danger-color);
              }
            }
          }

          // 临时添加动画
          &.added:not(.in-queue) {
            animation: addPulse 0.6s ease;
            border-color: var(--success-color);

            .add-icon {
              opacity: 0;
              transform: scale(0.5);
            }

            .check-icon {
              opacity: 1;
              transform: scale(1);
              animation: checkScale 0.6s ease;
            }
          }
        }
      }
    }
  }
}

@keyframes checkScale {
  0% {
    transform: scale(0);
  }

  70% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes addPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>