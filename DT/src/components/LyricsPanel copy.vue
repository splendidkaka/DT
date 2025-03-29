<template>
    <teleport to="body">
        <transition name="lyric-slide">
            <div v-show="visible" class="lyric-overlay" @click.self="handleClose">
                <div class="lyric-container" :style="{ transform: `translateY(${offsetY}px)` }"
                    @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend.passive="onTouchEnd">
                    <!-- 头部 -->
                    <div class="lyric-header">
                        <div class="song-info">
                            <img :src="albumCover" class="album-cover" />
                            <div class="meta">
                                <h3 class="title">{{ title }}</h3>
                                <p class="artist">{{ artist }}</p>
                                {{ lyrics }}

                            </div>
                        </div>
                        <button class="close-btn" @click="handleClose">
                            <svg viewBox="0 0 24 24">
                                <path
                                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    </div>

                    <!-- 歌词内容 -->
                    <div class="lyric-wrapper" ref="lyricWrapper">
                        <div v-for="(line, index) in lyricsList" :key="index" class="lyric-line"
                            :class="{ active: currentLine === index }"
                            :ref="el => { if (currentLine === index) currentRef = el as HTMLElement }"
                            @click="goTotime(line.time)">
                            <div class="time-indicator">
                                {{ formatTime(line.time) }}
                            </div>
                            <div class="lyric-text">
                                {{ line.text }}
                            </div>
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
// 歌词滚动定位
const lyricWrapper = ref<HTMLElement>()
const currentRef = ref<HTMLElement>()


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


// 更新歌词
watch(() => musicStore.currentSong, async (newSong) => {
    if (newSong?.lyrics) {
        lyricsList.value = await loadLyric(newSong.lyrics)
    }
}, { immediate: true })

// 自动滚动到当前歌词
const scrollToCurrent = () => {
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
    background: rgba(0, 0, 0, 0.6);
    z-index: 2000;
    touch-action: none;
}

.lyric-container {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    border-radius: 16px 16px 0 0;
    padding: 12px;
    max-height: 85vh;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);

    &::after {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 4px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
    }
}

.lyric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .song-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .album-cover {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            object-fit: cover;
        }

        .meta {
            flex: 1;
            min-width: 0;

            .title {
                margin: 0;
                font-size: 16px;
            }

            .artist {
                margin: 4px 0 0;
                font-size: 12px;
                color: #666;
            }
        }
    }

    .close-btn {
        background: none;
        border: none;
        padding: 8px;
        margin-left: 12px;

        svg {
            width: 24px;
            height: 24px;
            fill: #666;
            transition: fill 0.2s;
        }

        &:hover svg {
            fill: #333;
        }
    }
}

.lyric-wrapper {
    padding: 0 20px;
    max-height: 70vh;
    overflow-y: auto;
    scroll-behavior: smooth;

    .lyric-line {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        margin: 8px 0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.05);

        &:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        &.active {
            background: rgba(58, 143, 255, 0.15);
            transform: scale(1.02);

            .time-indicator {
                color: #3a8fff;
                font-weight: 600;
            }

            .lyric-text {
                color: #fff;
                font-weight: 500;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
        }

        .time-indicator {
            flex: 0 0 60px;
            color: #7a7a7a;
            font-size: 0.9em;
            font-family: monospace;
            transition: color 0.3s ease;
        }

        .lyric-text {
            flex: 1;
            color: #a8a8a8;
            font-size: 1.1em;
            line-height: 1.4;
            transition: all 0.3s ease;
        }
    }
}

/* 滚动条样式 */
.lyric-wrapper::-webkit-scrollbar {
    width: 6px;
}

.lyric-wrapper::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}

.lyric-wrapper::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.lyric-slide-enter-active,
.lyric-slide-leave-active {
    transition: opacity 0.3s;

    .lyric-container {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
}

.lyric-slide-enter-from,
.lyric-slide-leave-to {
    opacity: 0;

    .lyric-container {
        transform: translateY(100%);
    }
}
</style>