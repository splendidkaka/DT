<script setup lang="ts">
import { RouterView } from 'vue-router'
import PlayerControls from '@/components/PlayerControls.vue'
import NavBar from '@/components/NavBar.vue'
import { useMusicStore } from '@/store/modules/music'

const musicStore = useMusicStore()
// 获取所需数据
const currentSong = computed(() => musicStore.currentSong)
// const artistNames = computed(() => musicStore.getArtistNames())
// const albumCover = computed(() => musicStore.getAlbumCover())
const lyrics = computed(() => {
  if (!musicStore.currentSong || !musicStore.currentSong.lyrics) {
    return [];
  }
  return musicStore.currentSong.lyrics.split('\n').map(line => ({ text: line }));
})
const currentLyricIndex = computed(() => musicStore.currentLyricIndex)




</script>

<template>
  <!-- <div class="app-container">
    <NavBar />

    <main class="main-content">
      <RouterView />
    </main>
    <PlayerControls />
    <div class="playlist-panel">
      <PlaylistPanel />
    </div>
  </div> -->

  <el-container>
    <el-header>
      <NavBar />
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
    <el-footer>
      <PlayerControls/>
      <!-- 歌词组件 -->
      <LyricsPanel v-model:visible="musicStore.showLyricsPanel" :title="currentSong?.title || ''" />
      <PlaylistPanel />
    </el-footer>
  </el-container>
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;


  .main-content {
    flex: 1;
    // padding-bottom: 80px; // 为播放器控件留出空间
  }

  .player-controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    // height: 80px;
    padding: 0;
    z-index: 100;
  }

  //播放列表面板
  .playlist-panel {
    position: fixed;
    right: -400px;
    top: 0;
    bottom: 80px; // 播放器高度
    width: 400px;
    // background: rgba(255, 255, 255, 0.97);
    box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    z-index: 90;

    &.is-visible {
      transform: translateX(-400px);
    }
  }
}
</style>