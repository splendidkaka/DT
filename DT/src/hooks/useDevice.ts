// src/composables/useDevice.ts
import { useBreakpoints, usePreferredColorScheme } from '@vueuse/core'

export const useDevice = () => {
    const breakpoints = useBreakpoints({
        mobile: 640,
        tablet: 768,
        desktop: 1024
    })

    const isMobile = breakpoints.smaller('tablet')
    const isDarkMode = usePreferredColorScheme().value === 'dark'

    return {
        isMobile,
        isDarkMode,
        breakpoints
    }
}