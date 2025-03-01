// useScroll.ts
export const useScroll = (viewport: Ref<HTMLElement | undefined>, activeRef: Ref<HTMLElement | undefined>) => {
    const scrollToCurrent = () => {
        if (!activeRef.value || !viewport.value) return

        const viewportHeight = viewport.value.clientHeight
        const lineTop = activeRef.value.offsetTop
        const lineHeight = activeRef.value.clientHeight

        viewport.value.scrollTo({
            top: lineTop - viewportHeight / 2 + lineHeight / 2,
            behavior: 'smooth'
        })
    }

    return { scrollToCurrent }
}