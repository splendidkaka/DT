// components/SvgIcon.vue
<template>
    <Icon :icon="icon" :width="size" :height="size" :color="color" :class="[$attrs.class, 'svg-icon']"
        :style="{ ...inlineStyle, ...($attrs.style || {}) }" @click="handleClick" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { CSSProperties } from 'vue'

const props = withDefaults(
    defineProps<{
        // 图标名称，格式: 集合-图标名，例如: mdi-home
        icon: string
        // 图标尺寸（单位: px）
        size?: number | string
        // 图标颜色
        color?: string
        // 自定义样式
        inlineStyle?: CSSProperties
    }>(),
    {
        size: 24,
        color: 'currentColor',
        inlineStyle: () => ({})
    }
)

const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
    emit('click', event)
}
</script>

<style scoped>
.svg-icon {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
    transition: color 0.2s ease;
}
</style>