// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: '/playlist/:id',
            name: 'playlist',
            component: () => import('@/views/PlaylistView.vue')
        },
        {
            path: '/artist',
            name: 'artist',
            component: () => import('@/views/ArtistView.vue')
        }
    ]
})

export default router