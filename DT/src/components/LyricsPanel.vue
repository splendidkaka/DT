<template>
    <teleport to="body">
        <transition name="lyric-fade">
            <div v-show="visible" class="lyric-overlay" @touchstart.passive="onTouchStart"
                @touchmove.passive="onTouchMove" @touchend.passive="onTouchEnd">
                <!-- 动态背景层 -->
                <div class="dynamic-background" :style="backgroundStyle"></div>
                <div class="header-section">
                    <img :src="albumCover" class="album-art" />
                    <div class="song-info">
                        <h2 class="song-title">{{ currentSong?.title }}</h2>
                        <p class="song-artist">{{ artistNames }}</p>
                    </div>
                    <!-- <DynamicAnimation :current-time="currentTime" :song-name="currentSong?.title!"
                        :presets="animationPresets" /> -->
                    <div class="close-section">
                        <button class="close-button" @click="handleClose">
                            <span class="close-icon">✕</span>
                        </button>
                    </div>
                </div>

                <!-- 歌词主容器 -->
                <div class="lyric-main-container" :style="{ transform: `translateY(${offsetY}px)` }">
                    <!-- 关闭按钮 -->
                    <!-- 歌词滚动容器 -->
                    <div class="lyric-scroll-container" ref="lyricWrapper">
                        <div v-for="(line, index) in lyricsList" :key="index" class="lyric-line"
                            :class="{ 'current': currentLine === index || hoverIndex === index }"
                            @click="goTotime(line.time)" @mouseenter="hoverIndex = index" @mouseleave="hoverIndex = -1"
                            :ref="el => { if (currentLine === index) currentRef = el as HTMLElement }">
                            <div class="lyric-text">
                                {{ line.text }}
                            </div>

                            <!-- 悬停提示 -->
                            <div class="hover-indicator" :class="{ 'visible': hoverIndex === index }">
                                <span class="time-marker">{{ formatTime(line.time) }}</span>
                                <button class="play-button" @click.stop="goTotime(line.time)">
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <path d="M8 5v14l11-7z" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- 底部控制栏 -->
                </div>
                <div class="control-section">
                    <!-- 进度条 -->
                    <div class="progress-bar">
                        <input type="range" class="progress-slider" :min="0" :max="duration" :value="progress"
                            @input="handleSeek" @touchstart="isSeeking = true" @touchend="isSeeking = false" />
                        <div class="time-display">
                            <span>{{ formatTime(currentTime) }}</span>
                            <span>{{ formatTime(duration) }}</span>
                        </div>
                    </div>

                    <!-- 播放控制 -->
                    <div class="playback-controls">
                        <div class="control-btns">
                            <button class="favorite-btn" @click="toggleFavorite">
                                <SvgIcon v-if="isFavorite" icon="fluent-emoji-flat:red-heart" :size="20" class="icon" />
                                <SvgIcon v-else style="color:white" icon="fluent:heart-28-regular" :size="20"
                                    class="icon" />

                            </button>
                            <button class="control-btn" @click="musicStore.prevTrack">
                                <svg viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                                </svg>
                            </button>
                            <button class="control-btn" @click="togglePlay">
                                <svg v-if="isPlaying" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                                </svg>
                                <svg v-else viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                            <button class="control-btn" @click="musicStore.nextTrack">
                                <svg viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                </svg>
                            </button>
                            <button class="panel-btn" @click="togglePlaylist">
                                <SvgIcon icon="mdi:playlist-music" :size="20" class="icon" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>
<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import type { LyricLine } from '@/types/music'
import { loadLyric } from '@/utils/lyrics-loader'
import { useMusicStore } from '@/store/modules/music'
import { emitter } from '@/utils/eventBus'
import { useSidebarStore } from '@/store/modules/sidebar'
const props = defineProps({
    visible: Boolean,
    title: String,
    artist: String,
    cover: String,
    lyrics: String,
})
const musicStore = useMusicStore()
const emit = defineEmits(['update:visible'])

// 触摸交互逻辑
const touchStartY = ref(0)
const currentTranslateY = ref(0)
const offsetY = ref(0)
const closing = ref(false)
const lyricsList = ref<LyricLine[]>([])
const hoverIndex = ref(-1)

// 当前歌曲是否收藏
const isFavorite = computed(() =>
    musicStore.currentSong?.id ?
        musicStore.isFavoriteSong(musicStore.currentSong.id) :
        false
)

// 切换收藏状态
const toggleFavorite = () => {
    if (musicStore.currentSong?.id) {
        musicStore.toggleFavoriteSong(musicStore.currentSong.id)
    }
}
// 歌词滚动定位
const lyricWrapper = ref<HTMLElement>()
const currentRef = ref<HTMLElement>()
// const progress = computed(() => musicStore.currentPlayer.progress)

// const isPlaying = computed(() => musicStore.isPlaying)
// const duration = computed(() => musicStore.duration)
const currentTime = computed(() => musicStore.currentTime)
const progress = computed(() => musicStore.currentPlayer.progress)
// const isSeeking = ref(false)

// // 播放/暂停控制
// const togglePlay = () => {
//     musicStore.togglePlay()
// }

const sidebarStore = useSidebarStore()


const togglePlaylist = () => {
    sidebarStore.togglePlaylistVisibility()
    // window.addEventListener('click', closePanel)
}

const backgroundStyle = computed(() => {
    if (!albumCover.value) return {}
    return {
        backgroundImage: `url(${albumCover.value})`,
        opacity: 0.15
    }
})

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const getLineStyle = (index: number) => {
    const distance = Math.abs(index - currentLine.value)
    return {
        '--distance': distance,
        '--delay': `${distance * 0.1}s`
    }
}

//根据播放百分比计算当前歌词行
const currentLine = computed(() => {
    const lyrics = lyricsList.value;
    const currentTime = musicStore.currentTime
    // 空数据保护
    if (!lyrics?.length) return 0;
    // 二分查找优化
    let left = 0;
    let right = lyrics.length - 1;
    let result = 0;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (lyrics[mid].time <= currentTime) {
            result = mid; // 记录候选位置
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    // console.log('result:', result)
    // 处理最后一个歌词行的显示
    return result < lyrics.length - 1 ?
        result :
        lyrics.length - 1;
});
//当前歌曲
const currentSong = computed(() => musicStore.currentSong)
//专辑封面
const albumCover = computed(() =>
    musicStore.getAlbumCover(currentSong.value?.albumId || '')
)
const isPlaying = computed(() => musicStore.currentPlayer.isPlaying)
// const progress = computed(() => musicStore.currentPlayer.progress)
const duration = computed(() => musicStore.currentPlayer.duration)
const isSeeking = ref(false)
const artistNames = computed(() =>
    currentSong.value?.artists
        .map(id => musicStore.getArtist(id)?.name)
        .filter(Boolean)
        .join(', ') || '未知艺术家'
)
// 更新歌词
watch(() => musicStore.currentSong, async (newSong) => {
    if (newSong?.lyrics) {
        lyricsList.value = await loadLyric(newSong.lyrics)
    }
}, { immediate: true })

// 自动滚动到当前歌词
const scrollToCurrent = () => {
    // console.log('currentRef:', currentRef.value)
    if (currentRef.value && lyricWrapper.value) {
        const wrapperHeight = lyricWrapper.value.clientHeight
        const lineTop = currentRef.value.offsetTop
        const lineHeight = currentRef.value.clientHeight
        lyricWrapper.value.scrollTo({
            top: lineTop - wrapperHeight / 2 + lineHeight / 2,
            behavior: 'smooth'
        })
    }
}

// 跳转到指定时间
const goTotime = (time: number) => {
    console.log('time:', time)
    // musicStore.updateProgress(time)
    emitter.emit('seekToTime', time)
}

const togglePlay = () => {
    emitter.emit('togglePlay', !isPlaying.value)
}

const handleSeek = (e: Event) => {
    // console.log('handleSeek:', e)
    // console.log('isSeeking:', isSeeking.value)
    // if (isSeeking.value) {
    const target = e.target as HTMLInputElement
    const value = Number(target.value)
    emitter.emit('seekToTime', value)
    // }
}

// 监听当前歌词变化
watch(currentLine, () => {
    nextTick(scrollToCurrent)
    // console.log('监听滚动:')
})


// 触摸处理
const onTouchStart = (e: TouchEvent) => {


    touchStartY.value = e.touches[0].clientY

    currentTranslateY.value = offsetY.value
}

const onTouchMove = (e: TouchEvent) => {
    if (closing.value) return

    const isInLyricWrapper = (e.target as HTMLElement).closest('.song-info');

    console.log('isInLyricWrapper:', isInLyricWrapper)

    if (isInLyricWrapper) {
        const deltaY = e.touches[0].clientY - touchStartY.value
        offsetY.value = Math.max(0, currentTranslateY.value + deltaY)
    }

}

const onTouchEnd = () => {
    if (offsetY.value > 200) {
        closing.value = true
        emit('update:visible', false)
    } else {
        offsetY.value = 0
    }
}

// 关闭处理
const handleClose = () => {
    emit('update:visible', false)
}

// 重置状态
watch(() => props.visible, (val) => {
    if (!val) {
        offsetY.value = 0
        closing.value = false
    }
})

onMounted(() => {

    // console.log('currentSong:', musicStore.currentSong)
    console.log('lyricsList', lyricsList.value)
})




</script>

<style lang="scss" scoped>
.lyric-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(80px);
    -webkit-backdrop-filter: blur(80px);
}

.dynamic-background {
    position: absolute;
    top: -20%;
    left: -20%;
    right: -20%;
    bottom: -20%;
    background-size: cover;
    background-position: center;
    filter: blur(60px);
    opacity: 0.15;
    z-index: -1;
}

.lyric-main-container {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 2vh 0 20vh;

}


.lyric-scroll-container {
    overflow-x: hidden;
    // height: calc(100vh - 200px);

    flex: 1;
    overflow-y: auto;
    scroll-snap-type: y proximity; // 改为非强制对齐
    scroll-behavior: smooth; // 添加平滑滚动
    padding: 5vh 0;

    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: transparent;
    }

    &::-webkit-scrollbar-track {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
        margin: 20px 0;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        transition: background-color 0.3s;

        &:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }
    }

    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    overflow-y: overlay;
}

.lyric-line {
    position: relative;
    cursor: pointer;
    scroll-snap-align: center;
    padding: 12px 0;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    // &:hover {
    //         background: rgba(255, 255, 255, 0.1);
    //         backdrop-filter: blur(20px);
    //         // transform: scale(1.1);
    //     }

    .lyric-text {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 500;
        line-height: 1.4;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.current {
        .lyric-text {
            color: #fff;
            font-size: 2rem;
            font-weight: 700;
            transform: scale(1.08);
        }
    }

    .hover-indicator {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 12px;
        opacity: 0;
        transition: opacity 0.3s ease;

        &.visible {
            opacity: 1;
        }
    }

    .time-marker {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        letter-spacing: 0.5px;
    }

    .play-button {
        cursor: pointer;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);

        svg {
            color: rgba(255, 255, 255, 0.8);
            margin-left: 2px;
        }


    }

    // .lyric-line {
    //     position: relative;
    //     padding: 12px 40px 12px 24px; // 右侧留出空间
    //     cursor: pointer;
    //     transition: all 0.3s ease;


    //     }

    // 当前行样式调整
    &.current {
        .hover-indicator {
            right: 24px;
        }

        .time-marker {
            color: #fff;
        }

        .play-button {
            background: rgba(255, 255, 255, 0.2);
        }
    }
}


.timeline-container {
    width: 80px;
    padding: 30vh 0;
    position: relative;

    .timeline-item {
        height: var(--line-height);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.4);
        transition: all 0.3s ease;

        &.current {
            color: #fff;
            font-size: 0.9rem;
        }
    }
}

// .progress-bar {
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     right: 0;
//     height: 2px;
//     background: rgba(255, 255, 255, 0.16);

//     .progress {
//         height: 100%;
//         background: #fff;
//         transition: width 0.2s linear;
//         box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
//     }
// }

.lyric-fade-enter-active,
.lyric-fade-leave-active {
    transition: opacity 0.3s ease;

    .lyric-main-container {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
}

.lyric-fade-enter-from {
    opacity: 0;

    .lyric-main-container {
        transform: translateY(20px);
    }
}

.lyric-fade-leave-to {
    opacity: 0;

    .lyric-main-container {
        transform: translateY(80px);
    }
}

.header-section {
    display: flex;
    align-items: center;
    padding: 20px;
    gap: 15px;
    backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.3);
    margin: 20px;
    border-radius: 12px;

    .album-art {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .song-info {
        // flex: 1;

        .song-title {
            color: white;
            font-size: 18px;
            margin: 0 0 4px;
            // @include text-ellipsis;
        }

        .song-artist {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            margin: 0;
            // @include text-ellipsis;
        }
    }

    .close-section {
        margin-left: auto;

        .close-button {
            cursor: pointer;
            // position: fixed;
            // top: 12px;
            // right: 16px;
            // z-index: 10;
            background: rgba(255, 255, 255, 0.12);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

            &:active {
                transform: scale(0.92);
            }
        }

        .close-icon {
            color: rgba(255, 255, 255, 0.9);
            font-size: 18px;
            font-weight: 300;
            margin-top: -1px;
        }
    }
}



.control-section {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    // background: rgba(255, 255, 255, 0.97);
    // background-color: var(--mini-bg);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    padding: 1rem 2rem;
    z-index: 100;
    // min-height: 280px;
    overflow-y: hidden;
    // min-height: calc(100vh - 200px);

    width: 100vw;
    overflow-x: hidden;

    // 进度条容器
    .progress-bar {
        position: relative;
        // margin: 25px 20px;

        // 进度条轨道
        .progress-slider {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: visible;
            transition: all 0.3s ease;

            // 滑块
            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                background: #fff;
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                box-shadow:
                    0 3px 8px rgba(0, 0, 0, 0.2),
                    inset 0 -1px 2px rgba(0, 0, 0, 0.1);
                transition:
                    transform 0.2s ease,
                    box-shadow 0.2s ease;
            }

            // 激活状态
            &:active {
                height: 8px;

                &::-webkit-slider-thumb {
                    transform: scale(1.3);
                    box-shadow:
                        0 4px 12px rgba(0, 0, 0, 0.3),
                        inset 0 1px 2px rgba(255, 255, 255, 0.2);
                }
            }
        }

        // 时间显示
        .time-display {
            display: flex;
            justify-content: space-between;
            // margin-top: 12px;

            span {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }
        }
    }

    .playback-controls {
        // margin-top: 20px;
        display: flex;
        justify-content: center;

        //毛玻璃效果
        .control-btns {
            display: flex;
            justify-content: center; // 主按钮组居中
            align-items: center;
            // gap: 20px; // 按钮间距
            width: 100%;
        }

        .control-btn {
            background: rgba(255, 255, 255, 0.678);
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
            cursor: pointer;
            margin: 0 1rem;

            svg {
                fill: white;
                width: 2rem;
                height: 2rem;
            }

            &:active {
                transform: scale(0.95);
            }

            &:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }
        }

        .panel-btn {
            // position: absolute;
            // right: 0;
            background: rgba(255, 255, 255, 0.678);
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
            cursor: pointer;
            margin: 0 1rem;

            svg {
                fill: white;
                width: 2rem;
                height: 2rem;
            }

            &:active {
                transform: scale(0.95);
            }

            &:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }
        }
    }
}

.favorite-btn {
    // position: absolute;
    // left: 20px;
    background: none;
    border: white;
    padding: 8px;
    cursor: pointer;
    transition: transform 0.2s ease;

    svg {
        width: 24px;
        height: 24px;

    }

    &:hover {
        transform: scale(1.1);
    }

}

@media screen and (max-width: 768px) {
    .lyric-line {
        padding: 0.75rem 0;

        .lyric-text {
            font-size: 1.0rem;
        }

        &.current .lyric-text {
            font-size: 1.3rem;
        }
    }
    .lyric-main-container{
        height: 85vh;
    }

}
</style>