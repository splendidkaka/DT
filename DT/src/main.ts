import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import pinia from './store'
import router from './router'
import '@/styles/main.scss'
import { useMusicStore } from '@/store/modules/music'
import { useThemeStore } from './store/modules/theme'
// import { initFlexible  } from '@/utils/flexible'
// 在应用入口文件(main.ts)
// import { initViewport } from "./utils/viewportHelper";
// initViewport();

// initFlexible()
const app = createApp(App)

app.use(router)
app.use(pinia)

const musicStore = useMusicStore()
const themeStore = useThemeStore()

themeStore.applyTheme()
musicStore.initMockData()
app.mount('#app')
