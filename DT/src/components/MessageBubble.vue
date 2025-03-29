<!-- src/components/MessageBubble.vue -->
<template>
    <div class="message-row" :class="role">
        <div class="message-bubble">
            <div class="message-content" v-html="parsedContent" />
            <div v-if="showCopy" class="copy-btn" @click="copyCode">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z" />
                </svg>
            </div>
            <div class="message-meta">
                <span class="message-time">{{ formatTime(timestamp) }}</span>
                <span class="message-role">{{ roleLabel }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseMarkdown, formatTime } from '../utils/helpers'

const props = defineProps({
    role: String,
    content: String,
    timestamp: Number,
    roleLabel: String
})

const parsedContent = computed(() => parseMarkdown(props.content))
const showCopy = computed(() => props.content?.includes('```'))

const copyCode = () => {
    const codeBlock = props.content.match(/```[\s\S]*?```/g)?.[0]
    if (codeBlock) {
        const cleanCode = codeBlock.replace(/```[\s\S]*?\n/, '').replace(/```$/, '')
        navigator.clipboard.writeText(cleanCode)
    }
}
</script>