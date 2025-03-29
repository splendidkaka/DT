// src/composables/useDevice.ts
import { useBreakpoints, usePreferredColorScheme } from '@vueuse/core'

export const useDevice = () => {
    const breakpoints = useBreakpoints({
        mobile: 640,
        tablet: 768,
        desktop: 1024
    })

    //添加userAgent判断 需要是响应式的
    
    const userAgent = navigator.userAgent
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    //

    const isMobile = breakpoints.smaller('tablet')
    const isDarkMode = usePreferredColorScheme().value === 'dark'

    return {
        isMobile,
        isMobileDevice,
        isDarkMode,
        breakpoints
    }
}