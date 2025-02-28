<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import SongList from '../components/SongList.vue'
import { usePlaylistStore } from '@/store/modules/playlist'
import { useMusicStore } from '@/store/modules/music'
import type { Playlist, Song, Album, Artist } from '@/types/music'

const playlistStore = usePlaylistStore()
const musicStore = useMusicStore()
const featuredPlaylists = ref<Playlist[]>([])
// const albumLists = ref<Album[]>([])
const hotSongs = ref<Song[]>([])
const currentPlaylistName = ref<string>('') // 当前选中专辑
const currentPlaylistId = ref<string>('') //当前选中专辑ID
const scrollContainer = ref<HTMLElement | null>(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(true)
// const { selectedArtistId } = storeToRefs(musicStore) 

const albumLists = computed(() => {
    if (musicStore.selectedArtistId) {
        return musicStore.getArtistAlbums(musicStore.selectedArtistId)
    }
    return []
})

const artist = computed(() => {
    return musicStore.artists[musicStore.selectedArtistId?.toString() || '']
})
// const artist = computed(() => {
//     return Array.isArray(musicStore.artists) ? musicStore.artists.find(a => a.id === musicStore.selectedArtistId) : null
// })

// 数据加载
onMounted(async () => {
    featuredPlaylists.value = await playlistStore.getFeaturedPlaylists()
    // musicStore.initMockData()
    // hotSongs.value = await playlistStore.getHotSongs()
    // artists.value = Object.values(musicStore.artists)
    // console.log('albumLists.value', albumLists.value)
})

// 点击专辑处理
const selectPlaylist = (Album: Album) => {
    currentPlaylistName.value = Album.title
    currentPlaylistId.value = Album.id
    console.log('currentPlaylistId:', currentPlaylistId.value)
    // hotSongs.value = playlist.songs
}

// 滚动控制
const scroll = (direction: number) => {
    if (!scrollContainer.value) return
    const scrollAmount = 400
    scrollContainer.value.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    })
}

// 检测滚动位置
const checkScroll = () => {
    if (!scrollContainer.value) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
    showLeftArrow.value = scrollLeft > 0
    showRightArrow.value = scrollLeft < scrollWidth - clientWidth
}


</script>

<template>
    <div class="home-view">
        <section class="hero-section">
            <h1>{{ artist.name }}音乐宇宙</h1>
            <p>探索{{ artist.name }}的音乐世界</p>
        </section>

        <section class="featured-playlists">
            <h2>精选专辑</h2>
            <div class="playlist-scroll-container">
                <button class="scroll-arrow left" @click="scroll(-1)" :class="{ 'visible': showLeftArrow }">
                    ←
                </button>

                <div class="playlist-scroll" ref="scrollContainer" @scroll="checkScroll">
                    <div v-for="playlist in albumLists" :key="playlist.id" class="playlist-card"
                        :class="{ 'active': playlist.id === currentPlaylistId }"
                        @click.prevent="selectPlaylist(playlist)">
                        <img :src="playlist.cover" class="album-cover" />
                        <div class="playlist-info">
                            <h3>{{ playlist.title }}</h3>
                            <p>{{ playlist.description }}</p>
                        </div>
                    </div>
                </div>

                <button class="scroll-arrow left" @click="scroll(-1)" :class="{ 'visible': showLeftArrow }">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                    </svg>
                </button>

                <button class="scroll-arrow right" @click="scroll(1)" :class="{ 'visible': showRightArrow }">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                </button>
            </div>
        </section>

        <section class="hot-songs">
            <h2>{{ currentPlaylistName }}</h2>
            <!-- {{ currentPlaylistId }} -->
            <SongList :album="currentPlaylistId" />
        </section>
    </div>
</template>

<style lang="scss" scoped>
.home-view {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;

    .hero-section {
        text-align: center;
        margin-bottom: 3rem;

        h1 {
            font-size: 3rem;
            color: $accent-color;
        }

        p {
            color: $text-secondary;
            font-size: 1.2rem;
        }
    }
}

.playlist-scroll-container {
    position: relative;
    margin: 2rem 0;

    .playlist-scroll {
        display: flex;
        overflow-x: auto;
        scroll-behavior: smooth;
        gap: 2rem;
        padding: 1rem 0;
        -ms-overflow-style: none;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .playlist-card {
        flex: 0 0 300px;
        // flex: 0 0 auto;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s;
        overflow: hidden;

        &.active {
            border: 2px solid $accent-color;
            box-shadow: 0 0 15px rgba($accent-color, 0.3);
        }

        &:hover {
            transform: translateY(-5px);
        }

        .album-cover {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-bottom: 2px solid rgba($accent-color, 0.5);
        }

        .playlist-info {
            padding: 1.5rem;

            h3 {
                margin: 0 0 0.5rem;
                color: $text-primary;
                font-size: 1.2rem;
            }

            p {
                margin: 0;
                color: $text-secondary;
                font-size: 0.9rem;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        }
    }
}

.scroll-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: rgba($primary-color, 0.8);
    border: 2px solid $border-color;
    // border-radius: 50%;
    color: $accent-color;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s;
    z-index: 10;

    &:hover {
        background: $accent-color;
        color: $primary-color;
    }

    &.visible {
        opacity: 1;
    }

    &.left {
        left: -20px;
    }

    &.right {
        right: -20px;
    }
}

.hot-songs {
    margin-top: 3rem;

    h2 {
        color: $accent-color;
        border-left: 4px solid $accent-color;
        padding-left: 1rem;
    }
}

@media (max-width: 768px) {
    .scroll-arrow {
        display: none;
    }

    .playlist-card {
        flex: 0 0 250px !important;

        .album-cover {
            height: 250px !important;
        }
    }

    .hero-section {
        h1 {
            font-size: 2rem !important;
        }

        p {
            font-size: 1rem !important;
        }
    }
}
</style>