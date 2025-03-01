<!-- components/PlayerControls.vue -->
<template>
    <div class="player-controls" :class="{ 'mobile-layout': isMobile }" v-if="currentSong" >
        <div class="player-content">
            <!-- 左侧：歌曲信息 -->
            <div class="song-info">
                <img :src="albumCover" class="album-cover" @click="handleClick" />
                <div class="text-info">
                    <div class="title">{{ currentSong.title }}</div>
                    <div class="artist">{{ artistNames }}</div>
                </div>
            </div>

            <!-- 中间：播放控制 -->
            <div class="controls">
                <button class="control-btn" @click="musicStore.prevTrack">
                    <svg viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                    </svg>
                </button>

                <button class="control-btn play-btn" @click="togglePlay">
                    <svg v-if="!isPlaying" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                </button>

                <button class="control-btn" @click="musicStore.nextTrack">
                    <svg viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                </button>
            </div>

            <!-- 右侧：进度条和时间 -->
            <div class="progress-container" v-if="!isMobile">
                <div class="time">{{ formattedCurrentTime }}</div>
                <input type="range" class="progress-bar" :min="0" :max="duration" :value="progress"
                    @input="handleSeek" />
                <div class="time">{{ formattedDuration }}</div>
                <button class="playlist-toggle" @click="togglePlaylist">
                    <SvgIcon icon="mdi:playlist-music" :size="24" class="icon" />
                </button>
            </div>
        </div>

    </div>

</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMusicStore } from '@/store/modules/music'
import { useSidebarStore } from '@/store/modules/sidebar'
import { useDevice } from '@/hooks/useDevice'

const sidebarStore = useSidebarStore()


const togglePlaylist = () => {
    sidebarStore.togglePlaylistVisibility()
}
const musicStore = useMusicStore()
const audioElement = ref<HTMLAudioElement | null>(null)
const { isMobile } = useDevice()
// 计算属性
const currentSong = computed(() => musicStore.currentSong)
const isPlaying = computed(() => musicStore.currentPlayer.isPlaying)
const progress = computed(() => musicStore.currentPlayer.progress)
const duration = computed(() => musicStore.currentPlayer.duration)

const albumCover = computed(() =>
    musicStore.getAlbumCover(currentSong.value?.albumId || '')
)

const artistNames = computed(() =>
    currentSong.value?.artists
        .map(id => musicStore.getArtist(id)?.name)
        .filter(Boolean)
        .join(', ') || '未知艺术家'
)

// console.log('currentSong:', currentSong.value)

// 时间格式化
const formattedCurrentTime = computed(() =>
    formatTime(progress.value)
)

const formattedDuration = computed(() =>
    formatTime(duration.value)
)

// 音频控制
watch(currentSong, (newSong) => {
    if (!newSong) return

    cleanupAudio()
    console.log('newSong:', newSong)
    initAudio(newSong.audioUrl)
})

const initAudio = (url: string) => {
    audioElement.value = new Audio(url)

    audioElement.value.addEventListener('timeupdate', updateProgress)
    audioElement.value.addEventListener('loadedmetadata', () => {
        musicStore.updateDuration(audioElement.value?.duration || 0)
    })
    audioElement.value.addEventListener('ended', musicStore.nextTrack)

    if (isPlaying.value) {
        audioElement.value.play()
    }
}

const cleanupAudio = () => {
    if (audioElement.value) {
        audioElement.value.pause()
        audioElement.value.removeEventListener('timeupdate', updateProgress)
        audioElement.value = null
    }
}

// 播放控制
const togglePlay = () => {
    if (!audioElement.value) return

    musicStore.togglePlayback()
    isPlaying.value ? audioElement.value.play() : audioElement.value.pause()
}

const updateProgress = () => {
    if (audioElement.value) {
        musicStore.updateProgress(audioElement.value.currentTime)
    }
}

const handleSeek = (e: Event) => {
    const target = e.target as HTMLInputElement
    const time = parseFloat(target.value)

    if (audioElement.value) {
        audioElement.value.currentTime = time
        musicStore.updateProgress(time)
    }
}

const handleClick = (e: MouseEvent) => {
    console.log('click:', e)
    e.stopPropagation()
    musicStore.toggleLyricsPanel(true)
}

// 工具函数
const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remaining = Math.floor(seconds % 60)
    return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

// 生命周期清理
onUnmounted(cleanupAudio)
</script>

<style lang="scss" scoped>
.player-controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.97);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    padding: 1rem 2rem;
    z-index: 100;
    min-height: 80px;
    width: 100vw;
    overflow-x: hidden;

    &.mobile-layout {
        padding: 0.5rem;
        display: flex;

        .player-content {
            // flex-direction: column;
            // display: flex;
            flex-direction: row;
            // justify-content: space-between;
            // gap: 1rem;

        }

        .controls {
            // order: -1;
            justify-content: center;
        }

        .progress-container {
            width: 100%;
            min-width: unset;
        }
    }


    /* 播放列表按钮样式 */
    .playlist-toggle {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            transform: scale(1.1);
            background: $accent-color;

            .icon {
                color: white;
            }
        }

        .icon {
            color: $accent-color;
            transition: color 0.3s ease;
        }
    }

    .player-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 2rem;
    }

    .song-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        // min-width: 250px;

        .album-cover {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            cursor: pointer;
            animation: rotate 5s linear infinite;
        }

        .text-info {
            .title {
                font-weight: 500;
                font-size: 1.1rem;
                color: #000000;
            }

            .artist {
                font-size: 0.9rem;
                color: #666;
            }
        }
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 1rem;

        .control-btn {
            background: none;
            border: none;
            padding: 0.5rem;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s;

            svg {
                width: 24px;
                height: 24px;
                fill: #333;
            }

            &:hover {
                background: rgba(0, 0, 0, 0.05);
            }

            &.play-btn {
                background: #000;
                padding: 0.8rem;

                svg {
                    fill: #fff;
                }

                &:hover {
                    transform: scale(1.05);
                }
            }
        }
    }

    .progress-container {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;

        .time {
            font-size: 0.9rem;
            color: #666;
            min-width: 50px;
        }

        .progress-bar {
            flex: 1;
            height: 4px;
            background: #ddd;
            border-radius: 2px;
            cursor: pointer;
            transition: height 0.2s;

            &:hover {
                height: 6px;
            }

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 12px;
                height: 12px;
                background: #000;
                border-radius: 50%;
            }
        }
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>