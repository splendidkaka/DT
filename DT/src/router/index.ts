// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import('@/views/Index.vue')
        },

        {
            path: '/home',
            name: 'home',
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: '/AiChat',
            name: 'AiChat',
            component: () => import('@/views/AiChat.vue')
        },
        {
            path: '/video',
            name: 'video',
            component: () => import('@/views/video.vue')
        }
    ]
})

export default router