<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlaylistStore } from '@/store/modules/playlist'
import type { Playlist } from '@/types/music'

const playlistStore = usePlaylistStore()
const artistInfo = ref({
  name: '陶喆',
  bio: '华语R&B音乐教父，创作歌手及音乐制作人...',
  albums: [] as Playlist[],
  similarArtists: []
})

onMounted(async () => {
  // 模拟数据加载
  artistInfo.value.albums = await playlistStore.getArtistAlbums('david-tao')
})
</script>

<template>
  <div class="artist-view">
    <div class="artist-header">
      <div class="artist-profile">
        <img 
          src="@/assets/covers/david-tao.jpg" 
          class="artist-photo"
        />
        <h1>{{ artistInfo.name }}</h1>
      </div>
      <p class="artist-bio">{{ artistInfo.bio }}</p>
    </div>

    <section class="artist-albums">
      <h2>全部专辑</h2>
      <div class="album-grid">
        <div 
          v-for="album in artistInfo.albums"
          :key="album.id"
          class="album-card"
        >
          <img :src="album.cover" class="album-cover" />
          <div class="album-info">
            <h3>{{ album.name }}</h3>
            <p class="release-year">1997</p>
          </div>
        </div>
      </div>
    </section>

    <section class="artist-timeline">
      <h2>音乐历程</h2>
      <div class="timeline">
        <!-- 时间轴实现 -->
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.artist-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  .artist-header {
    display: flex;
    gap: 3rem;
    margin-bottom: 4rem;

    .artist-photo {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      object-fit: cover;
      // border: 4px solid $accent-color;
    }

    .artist-bio {
      flex: 1;
      font-size: 1.1rem;
      line-height: 1.6;
      // color: $text-secondary;
    }
  }

  .album-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;

    .album-card {
      background: rgba(255,255,255,0.05);
      padding: 1rem;
      border-radius: 8px;

      .album-cover {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 4px;
      }

      .album-info {
        padding-top: 1rem;
        
        h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .release-year {
          // color: $text-secondary;
          font-size: 0.9rem;
        }
      }
    }
  }
}
</style>