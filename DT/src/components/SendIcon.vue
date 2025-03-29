<!-- src/components/SendIcon.vue -->
<template>
    <div class="send-icon-container">
        <transition name="fade" mode="out-in">
            <svg v-if="!isLoading" key="send" class="send-icon" viewBox="0 0 24 24" width="24" height="24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
            </svg>

            <svg v-else key="loading" class="loading-icon" viewBox="0 0 38 38" width="24" height="24">
                <defs>
                    <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
                        <stop stop-color="currentColor" stop-opacity="0" offset="0%" />
                        <stop stop-color="currentColor" stop-opacity=".631" offset="63.146%" />
                        <stop stop-color="currentColor" offset="100%" />
                    </linearGradient>
                </defs>
                <g fill="none" fill-rule="evenodd">
                    <g transform="translate(1 1)">
                        <path d="M36 18c0-9.94-8.06-18-18-18" stroke="url(#a)" stroke-width="2">
                            <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18"
                                dur="0.9s" repeatCount="indefinite" />
                        </path>
                        <circle fill="currentColor" cx="36" cy="18" r="1">
                            <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18"
                                dur="0.9s" repeatCount="indefinite" />
                        </circle>
                    </g>
                </g>
            </svg>
        </transition>
    </div>
</template>

<script setup lang="ts">
defineProps({
    isLoading: {
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.send-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}

.send-icon {
    color: #3b82f6;
    transition: opacity 0.2s ease;
}

.loading-icon {
    color: #94a3b8;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.loading-icon {
    animation: rotate 1.4s linear infinite;
}

.loading-icon path,
.loading-icon circle {
    transform-origin: 50% 50%;
}
</style>