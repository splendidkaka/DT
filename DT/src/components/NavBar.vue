<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useMusicStore } from '@/store/modules/music'
import { ref, onMounted, onUnmounted } from 'vue'
import type { Artist } from '@/types/music'


// const router = useRouter()
const musicStore = useMusicStore()

// 导航链接数据
const navLinks = [
  { name: '发现音乐', path: '/home', icon: '🎵' },
  { name: '热门专辑', path: '/AiChat', icon: '🎧' },
  { name: '排行榜', path: '/video', icon: '🏆' }
]

// 艺术家数据
const artists = ref<Artist[]>([])
const isDropdownOpen = ref(false)

// 获取艺术家数据
onMounted(() => {
  // nextTick(() => {
  artists.value = Object.values(musicStore.artists)
  console.log('musicStore.artists:', musicStore.artists)
  console.log('artists:', artists.value)
  // })
})

// 关闭下拉的点击外部检测
const closeDropdown = (e: MouseEvent) => {
  // console.log('e.target:', e.target)
  if (!(e.target as HTMLElement).closest('.artist-dropdown')) {
    isDropdownOpen.value = false
  }
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  window.addEventListener('click', closeDropdown)
}

// onMounted(() => window.addEventListener('click', closeDropdown))
onUnmounted(() => window.removeEventListener('click', closeDropdown))
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="logo">
      <span class="logo-icon">🎸</span>
      <span class="logo-text">MUSIC CENTER</span>
    </RouterLink>

    <div class="nav-content">
      <div class="nav-links">
        <RouterLink v-for="link in navLinks" :key="link.path" :to="link.path" class="nav-link">
          <span class="link-icon">{{ link.icon }}</span>
          <span class="link-text"> {{ link.name }}</span>
        </RouterLink>
      </div>

      <!-- 艺术家下拉菜单 -->
      <div class="artist-dropdown">
        <div class="dropdown-trigger" @click="toggleDropdown">
          <span class="trigger-icon">👨🎤</span>
          <span class="trigger-text">选择歌手</span>
          <span class="arrow" :class="{ open: isDropdownOpen }">▼</span>
        </div>

        <transition name="dropdown">
          <div v-show="isDropdownOpen" class="dropdown-menu">
            <div v-for="artist in artists" :key="artist.id" class="dropdown-item"
              @click="musicStore.setSelectedArtistId(artist.id)">
              <!-- <img 
                :src="artist.cover || '/default-artist.jpg'"
                class="artist-avatar"
                alt="歌手头像"
              /> -->
              <div class="artist-info">
                <div class="artist-name">{{ artist.name }}</div>
                <div class="artist-albums">{{ artist.albums.length }} 张专辑</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
// @use "@/styles/_variables.scss";

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 64px;
  background: rgba($background-dark, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
  width: 100vw;
  .logo {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    text-decoration: none;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateX(5px);
    }

    .logo-icon {
      font-size: 2rem;
      margin-right: 0.8rem;
    }

    .logo-text {
      font-size: 1.4rem;
      font-weight: 700;
      background: linear-gradient(45deg, $accent-primary, $accent-secondary);
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .nav-content {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-links {
    display: flex;
    // gap: 1.5rem;
    flex-shrink: 0;
    .nav-link {
      color: $text-primary;
      text-decoration: none;
      padding: 0.8rem 1.2rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: $accent-primary;
        transition: all 0.3s;
      }

      &:hover {
        background: rgba(white, 0.05);

        &::after {
          width: 100%;
          left: 0;
          // background-color:aqua;
        }
      }

      &.router-link-exact-active {
        color: $accent-primary;

        &::after {
          width: 100%;
          left: 0;
        }
      }

      .link-icon {
        margin-right: 0.6rem;
        font-size: 1.1em;
      }
    }
  }

  .artist-dropdown {
    // position: relative;
    flex-shrink: 0;
    .dropdown-trigger {
      display: flex;
      align-items: center;
      padding: 0.6rem 1.2rem;
      background: rgba(white, 0.08);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid rgba(white, 0.1);

      &:hover {
        background: rgba(white, 0.12);
        border-color: rgba(white, 0.2);
      }

      .trigger-icon {
        font-size: 1.2rem;
        margin-right: 0.8rem;
      }

      .trigger-text {
        color: $text-primary;
        font-weight: 500;
      }

      .arrow {
        margin-left: 0.8rem;
        font-size: 0.7rem;
        transition: transform 0.3s;
        color: rgba(white, 0.6);

        &.open {
          transform: rotate(180deg);
        }
      }
    }

    .dropdown-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      background: $background-dark;
      border-radius: 8px;
      padding: 0.5rem;
      min-width: 280px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(white, 0.1);

      .dropdown-item {
        display: flex;
        align-items: center;
        padding: 0.8rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(white, 0.05);
        }

        .artist-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 1rem;
          object-fit: cover;
        }

        .artist-info {
          .artist-name {
            color: $text-primary;
            font-weight: 500;
          }

          .artist-albums {
            color: rgba(white, 0.6);
            font-size: 0.9em;
          }
        }
      }
    }

    .dropdown-enter-active,
    .dropdown-leave-active {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dropdown-enter-from,
    .dropdown-leave-to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
    // height: 56px;
    width: 100vw;
    .logo .logo-text {
      display: none;
    }

    .nav-content {
      gap: 1rem;
    }

    // .nav-links {
    //   display: none;
      
    // }
    .link-text{
      display: none;
    }

    .artist-dropdown {
      .dropdown-trigger {
        padding: 0.5rem;

        .trigger-text {
          display: none;
        }
      }

      .dropdown-menu {
        min-width: 200px;
      }
    }
  }
}
</style>