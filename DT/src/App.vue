<script setup lang="ts">
import { RouterView } from 'vue-router'
import PlayerControls from '@/components/PlayerControls.vue'
import NavBar from '@/components/NavBar.vue'
import { useMusicStore } from '@/store/modules/music'
import { useRoute } from 'vue-router'

const route = useRoute()
// const isAichatRoute = computed(() => {
//   return route.path.startsWith('/AiChat') // 或使用 route.name === 'aichat'
// })

const isHomeRoute = computed(() => {
  return route.path.startsWith('/home') // 或使用 route.name === 'aichat'
})

const isIndexRoute = computed(() => {
  return route.name==='index' // 或使用 route.name === 'aichat'
})

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

  <el-container class="main-container">
    <el-header v-if="!isIndexRoute">
      <NavBar />
    </el-header>
    <el-main id="my-el-main" :class="{ 'full-height': $route.path === '/aichat' }">
      <RouterView />
    </el-main>
    <el-footer v-if="isHomeRoute">
      <PlayerControls />
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

.main-container{
  height: 100vh;
  .el-main.full-height {
    // height: calc(100vh - var(--el-header-height)) !important;
  }
}

.el-header {
  padding: 0 !important;
  /* 清除默认内边距 */
  background: transparent !important;
  /* 清除背景色 */
  height: auto !important;
  /* 取消固定高度 */
  line-height: normal !important;
  box-shadow: none !important;
}

#my-el-main{
  padding: 0;
  min-height: 0;
  overflow: auto;
}
</style>