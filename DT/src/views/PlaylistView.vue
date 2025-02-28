<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SongList from '@/components/SongList.vue'
import { usePlaylistStore } from '@/store/modules/playlist'

const route = useRoute()
const playlistStore = usePlaylistStore()
const playlist = ref<Playlist | null>(null)

onMounted(async () => {
  const playlistId = route.params.id as string
  playlist.value = await playlistStore.getPlaylistById(playlistId)
})
</script>

<template>
  <div class="playlist-view">
    <div v-if="playlist" class="playlist-header">
      <img :src="playlist.cover" class="album-art" />
      <div class="playlist-meta">
        <h1>{{ playlist.name }}</h1>
        <p class="description">{{ playlist.description }}</p>
        <div class="stats">
          <span>{{ playlist.songs.length }} 首歌曲</span>
        </div>
      </div>
    </div>

    <SongList 
      v-if="playlist" 
      :songs="playlist.songs" 
      @select-song="playSong" 
    />
  </div>
</template>

<style lang="scss" scoped>
.playlist-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  .playlist-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;

    .album-art {
      width: 250px;
      height: 250px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .playlist-meta {
      h1 {
        font-size: 2.5rem;
        margin: 0 0 1rem;
      }

      .description {
        font-size: 1.1rem;
        color: $text-secondary;
        max-width: 600px;
      }

      .stats {
        margin-top: 1rem;
        color: $accent-color;
      }
    }
  }
}
</style>