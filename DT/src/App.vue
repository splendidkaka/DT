<script setup lang="ts">
import { RouterView } from 'vue-router'
import PlayerControls from '@/components/PlayerControls.vue'
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="app-container">
    <NavBar />
    
    <main class="main-content">
      <RouterView />
    </main>
    <div class="player-controls">
      <PlayerControls />

    </div>
    <div class="playlist-panel">
      <PlaylistPanel />
      </div>
  </div>
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  .main-content {
    flex: 1;
    padding-bottom: 80px; // 为播放器控件留出空间
  }
  .player-controls{
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.97);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    padding: 1rem 2rem;
    z-index: 100;
  }
  //播放列表面板
  .playlist-panel{
    position: fixed;
    right: -400px;
    top: 0;
    bottom: 80px; // 播放器高度
    width: 400px;
    background: rgba(255, 255, 255, 0.97);
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