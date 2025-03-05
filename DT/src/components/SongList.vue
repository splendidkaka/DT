<!-- components/SongList.vue -->
<script setup lang="ts">
import type { Song } from '@/types/music'
import { useMusicStore } from '@/store/modules/music'

const props = defineProps<{
  // songs: Song[],
  album: string
}>()

const emit = defineEmits(['select-song'])
const musicStore = useMusicStore()
// const albumSongs = ref<Song[]>([])
const handleSongClick = (song: Song) => {
  // emit('select-song', song)
  musicStore.playSong(song.id)
  console.log('song clicked:', song)
}
const albumSongs = computed(() => {
  return musicStore.getSongsByAlbum(props.album)
})
onMounted(() => {
})
</script>

<template>
  <ul class="song-list">
    <!-- {{ albumSongs }} -->
    <li v-for="song in albumSongs" :key="song.id" @click="handleSongClick(song)" class="song-item">
      <img :src="musicStore.getAlbumCover(song.albumId)" class="album-cover" />
      <div class="song-info">
        <h3>{{ song.title }}</h3>
        <p>{{ musicStore.getArtistBySong(song.id) }}</p>
      </div>
    </li>
  </ul>
</template>

<style lang="scss">
.song-list {
  list-style: none;
  padding: 0;

  .song-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      // background: rgba(255, 255, 255, 0.1);
      background-color: var(--item-hover-bg);
    }

    .album-cover {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      margin-right: 1rem;
    }

    .song-info {
      h3 {
        margin: 0;
        // color: white;
      }

      p {
        margin: 0;
        text-align: left;
        color: var(--text-secondary);
      }
    }
  }
}
</style>