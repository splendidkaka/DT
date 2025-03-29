<template>
    <div ref="animationContainer" class="animation-container" :style="containerStyle">
        <component :is="currentComponent" :style="elementStyle" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

type AnimationType = 'airplane' | 'heart' | 'default'
type AnimationPreset = {
    type: AnimationType
    path: string
    scale: number
    color: string
    duration: number
}

const props = defineProps<{
    currentTime: number
    songName: string
    presets: Record<string, AnimationPreset>
}>()

const animationContainer = ref<HTMLElement>()
let animation: gsap.core.Tween | null = null

const currentConfig = computed(() =>
    props.presets[props.songName] || props.presets.default
)
// 定义组件选项
const Airplane = defineComponent({
    template: `
    <svg viewBox="0 0 24 24">
      <path d="M20.56 3.91C21.05 4.45 21.13 5.21 20.75 5.85L14 18.35L13 16.35L17 10.35L10.94 9.37L5.29 20.29L3.71 19.71L9.06 8.63L3.66 7.61L5.25 5.15L12 17.65L13 19.65L9 13.65L15.06 14.63L20.71 3.71L20.56 3.91Z"/>
    </svg>
  `
})

const Heart = defineComponent({
    template: `
    <svg viewBox="0 0 24 24">
      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
    </svg>
  `
})

const Default = defineComponent({
    template: `<div class="default-animation"></div>`
})
const currentComponent = computed(() => {
    switch (currentConfig.value.type) {
        case 'airplane': return Airplane
        case 'heart': return Heart
        default: return Default
    }
})

const elementStyle = computed(() => ({
    '--element-color': currentConfig.value.color,
    transform: `scale(${currentConfig.value.scale})`
}))

const containerStyle = computed(() => ({
    '--animation-duration': `${currentConfig.value.duration}s`
}))

const initPathAnimation = () => {
    if (animation) animation.kill()

    animation = gsap.to(animationContainer.value, {
        motionPath: {
            path: currentConfig.value.path,
            align: currentConfig.value.path
        },
        duration: currentConfig.value.duration,
        repeat: -1,
        ease: "power1.inOut"
    })
}

watch(currentConfig, initPathAnimation)
onMounted(initPathAnimation)
onUnmounted(() => animation?.kill())
</script>

<style scoped>
.animation-container {
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 100px;
    pointer-events: none;
    z-index: 9999;
    filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3));

    svg {
        width: 60px;
        height: 60px;
        fill: var(--element-color);
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        animation: float var(--animation-duration) ease-in-out infinite;
    }

    &.heart {
        animation: pulse 1.5s ease-in-out infinite;
    }
}

@keyframes float {

    0%,
    100% {
        transform: translate(-50%, -50%) rotate(5deg);
    }

    50% {
        transform: translate(-50%, calc(-50% - 20px)) rotate(-5deg);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}
</style>