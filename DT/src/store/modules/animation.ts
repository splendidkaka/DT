import { defineStore } from 'pinia'

type AnimationType = 'slide' | 'scale' | 'fade' | 'none'

interface AnimationState {
    currentAnimation: AnimationType
    animationOptions: Array<{ value: AnimationType; label: string }>
}

export const useAnimationStore = defineStore('animation', {
    state: (): AnimationState => ({
        currentAnimation: 'slide',
        animationOptions: [
            { value: 'slide', label: '滑动效果' },
            { value: 'scale', label: '缩放效果' },
            { value: 'fade', label: '渐隐效果' },
            { value: 'none', label: '无动画' }
        ]
    }),

    actions: {
        loadSettings() {
            const saved = localStorage.getItem('animationSettings')
            if (saved) {
                const { currentAnimation } = JSON.parse(saved)
                this.currentAnimation = currentAnimation
            }
        },

        saveSettings() {
            localStorage.setItem('animationSettings', JSON.stringify({
                currentAnimation: this.currentAnimation
            }))
        }
    },

    persist: true
})