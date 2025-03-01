// hooks/useTouchGesture.ts
import { ref, type Ref } from 'vue'

interface TouchGestureOptions {
    threshold?: number        // 触发关闭的滑动阈值（默认120px）
    onClose?: () => void      // 关闭回调
    enabled?: Ref<boolean>    // 是否启用手势
}

export const useTouchGesture = (options: TouchGestureOptions = {}) => {
    const {
        threshold = 120,
        onClose,
        enabled = ref(true)
    } = options

    const touchStartY = ref(0)
    const currentTranslateY = ref(0)
    const offsetY = ref(0)
    const isClosing = ref(false)

    // 添加阻尼系数（0.6）
    const dampingFactor = 0.6
    const maxOffset = threshold * 1.5

    const handleTouchStart = (e: TouchEvent) => {
        if (!enabled.value) return

        touchStartY.value = e.touches.clientY
        currentTranslateY.value = offsetY.value
        isClosing.value = false
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (!enabled.value || isClosing.value) return

        const deltaY = (e.touches.clientY - touchStartY.value) * dampingFactor
        offsetY.value = Math.min(maxOffset, Math.max(0, currentTranslateY.value + deltaY))
    }

    const handleTouchEnd = () => {
        if (!enabled.value) return

        if (offsetY.value > threshold) {
            isClosing.value = true
            onClose?.()
        } else {
            // 添加弹性回归动画
            offsetY.value = 0
        }
    }

    return {
        offsetY,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    }
}