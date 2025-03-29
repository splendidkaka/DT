<!-- src/App.vue -->
<template>
    <div class="ai-container" @touchstart.passive="handleTouchStart" @touchend.passive="handleTouchEnd">
        <!-- 左侧对话列表 -->
        <div class="left-panel" :class="{
            collapsed: isLeftPanelCollapsed,
            'mobile-visible': isMobileSidebarVisible
        }">
            <div class="header">
                <div class="toggle-collapse">
                    <SvgIcon icon="emojione-v1:detective" size="2rem" style="cursor: pointer;"
                        @click="toggleLeftPanel" />
                </div>
                <el-tooltip content="收起边栏" placement="right">
                    <button class="collapse-btn" v-if="!isLeftPanelCollapsed && !isMobile" @click="toggleLeftPanel">
                        <SvgIcon icon="octicon:sidebar-collapse-16" />
                    </button>
                </el-tooltip>
                <div v-if="isMobile" class="mobile-close-btn" @click="toggleMobileSidebar">
                    <SvgIcon icon="ion:close" size="24px" />
                </div>
            </div>
            <div class="conversation">

                <el-tooltip content="打开边栏" placement="right">
                    <button v-if="isLeftPanelCollapsed" class="toggle-collapse" @click="toggleLeftPanel">
                        <SvgIcon icon="octicon:sidebar-collapse-16" size="1.75rem" />
                    </button></el-tooltip>
                <el-tooltip content="创建新对话" placement="right">
                    <button class="toggle-collapse" @click="createNewChat">
                        <div>
                            <SvgIcon icon="arcticons:deepseek" size="2rem" />
                            <span class="toggle-content">DeepSeek</span>
                        </div>
                        <SvgIcon v-if="!isLeftPanelCollapsed" icon="mi:add" />
                    </button>
                </el-tooltip>
                <el-tooltip content="最近对话" placement="right">
                    <button class="toggle-collapse" @click="toggleCollapse">
                        <div>
                            <SvgIcon icon="stash:reading-time" size="2rem" />
                            <span class="toggle-content">最近对话</span>
                        </div>
                        <span class="arrow" :class="{ collapsed: !isCollapsed }">
                            <SvgIcon icon="weui:arrow-outlined" />
                        </span>
                    </button>
                </el-tooltip>
                <div class="conversation-list" :class="{ collapsed: isCollapsed }">

                    <div v-for="conv in conversations" :key="conv.id" class="conversation-item"
                        :class="{ active: activeConvId === conv.id }" @click="setActiveConv(conv.id)">

                        <input v-if="editingConvId === conv.id" ref="titleInput" v-model="editedTitle" type="text"
                            class="title-input" @keyup.enter="saveTitle(conv)" @blur="saveTitle(conv)" @click.stop>

                        <span v-else class="truncate">{{ conv.title || conv.messages?.[0]?.content }}</span>

                        <div class="conv-actions">
                            <!-- <span class="token-count">{{ conv.tokenUsage || 0 }} tokens</span> -->

                            <el-dropdown ref="dropdown" trigger="click">
                                <SvgIcon icon="uil:ellipsis-h" />
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="startEditTitle(conv)">
                                            <SvgIcon icon="mage:edit-pen" style="margin-right: 1rem;" /> 重命名
                                        </el-dropdown-item>
                                        <el-dropdown-item style="color: red;" @click.stop="deleteConversation(conv.id)">
                                            <SvgIcon icon="mdi:rubbish-bin-outline" style="margin-right: 1rem;">
                                            </SvgIcon>删除
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                            <!-- <button @click.stop="deleteConversation(conv.id)" class="delete-btn">×</button> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>



        <div class="right-panel" :class="{
            fullWidth: isLeftPanelCollapsed,
            'mobile-pushed': isMobileSidebarVisible
        }">
            <!-- 移动端遮罩层 -->
            <div v-if="isMobileSidebarVisible" class="mobile-sidebar-mask" @click="toggleMobileSidebar"></div>

            <!-- 移动端汉堡菜单 -->
            <div v-if="isMobile" class="mobile-menu-btn" @click="toggleMobileSidebar">
                <SvgIcon icon="ci:hamburger-md" size="24px" />
            </div>

            <!-- 消息容器 -->
            <div ref="messagesContainer" class="messages-container">
                <div class="scroll-content">
                    <!-- 消息列表 -->
                    <SvgIcon icon="unjs:undocs" size="5rem" class="thinking-icon" />

                    <template v-for="(msg, index) in activeMessages" :key="index">
                        <div class="message-row" :class="msg.role">
                            <div class="message-bubble">
                                <div v-if="isThinking" style="color: darkgray;" class="reasoning-content"
                                    v-html="parseMarkdown(msg.contentThink || '')" />

                                <!-- <Bubble :content="msg.content"></Bubble> -->
                                <Typewriter :content="msg.content" :is-markdown="true"></Typewriter>
                                <!-- <MdPreview v-model="msg.content" /> -->
                                <div class="message-meta">
                                    <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                                    <span class="message-role">{{ roleMap[msg.role] }}</span>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- 加载指示器 -->
                    <div v-if="isLoading" class="loading-indicator">
                        <div class="dot-flashing"></div>
                    </div>
                </div>
            </div>

            <!-- 输入区域 -->

            <!-- 为移动端并且左侧栏处于开启状态  关闭输入框 -->

            <div class="input-container" v-if="shouldShowInput">
                <div class="input-wrapper">
                    <textarea ref="textarea" v-model="inputMessage" placeholder="输入消息..."
                        @keydown.enter.excludeShift="handleSend" @input="autoResize" rows="1"
                        :disabled="isLoading"></textarea>

                    <div class="input-actions">
                        <div class="btn-left">
                            <button class="toggle-btn" @click="isThinking = !isThinking"
                                :class="{ isthink: isThinking }">
                                <SvgIcon icon="emojione-monotone:thinking-face" size="16px"></SvgIcon>
                                深度思考
                            </button>
                            <button class="toggle-btn">
                                <SvgIcon icon="fluent-mdl2:add-online-meeting" size="12px"></SvgIcon>
                                联网查询
                            </button>
                        </div>
                        <div class="btn-right">
                            <el-button class="send-btn" @click="handleSend">
                                <SvgIcon icon="proicons:photo" v-if="!isLoading" />
                                <div v-else class="loading-spinner"></div>
                            </el-button>
                            <el-button class="send-btn" @click="handleSend"
                                :disabled="!inputMessage.trim() || isLoading">
                                <SvgIcon icon="mdi:arrow-top-circle-outline" v-if="!isLoading" />
                                <div v-else class="loading-spinner"></div>
                            </el-button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import { MdEditor, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { useChatStore } from '@/store/modules/chat'
import { useDevice } from '@/hooks/useDevice'
import SvgIcon from '@/components/SvgIcon.vue';
import type { DropdownInstance } from 'element-plus'
import { BubbleList, Bubble, Sender, Typewriter } from 'vue-element-plus-x'



const { isMobile, isMobileDevice } = useDevice()
const isLeftPanelCollapsed = ref(false)

// 新增移动端侧边栏状态
const isMobileSidebarVisible = ref(false)

// 切换移动端侧边栏
const toggleMobileSidebar = () => {
    isMobileSidebarVisible.value = !isMobileSidebarVisible.value
    document.body.style.overflow = isMobileSidebarVisible.value ? 'hidden' : 'auto'
}

const shouldShowInput = computed(() => {
    return !isMobile.value || (isMobile.value && !isMobileSidebarVisible.value)
})

// 优化后的触摸处理
const touchStartX = ref(0)
const touchStartTime = ref(0)

const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX
    touchStartTime.value = Date.now()
}

const handleTouchEnd = (e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.value
    const duration = Date.now() - touchStartTime.value

    if (duration > 300) return

    // 从左边缘向右滑动
    if (touchStartX.value < 30 && deltaX > 50) {
        toggleMobileSidebar()
    }

    // 向右滑动关闭
    if (isMobileSidebarVisible.value && deltaX < -50) {
        toggleMobileSidebar()
    }
}

// 修改原有的toggleLeftPanel方法
const toggleLeftPanel = () => {
    if (isMobile.value) {
        toggleMobileSidebar()
    } else {
        if (!isCollapsed.value) isCollapsed.value = !isCollapsed.value
        isLeftPanelCollapsed.value = !isLeftPanelCollapsed.value
    }
}

// 新增折叠状态
const isCollapsed = ref(false)
const editingConvId = ref<string | null>(null)
const editedTitle = ref('')
const titleInput = ref<HTMLInputElement[]>([])
const dropdown = ref<DropdownInstance>()

// 思考模式
const isThinking = ref(false)
const isOnline = ref(false)

// 切换折叠状态
const toggleCollapse = () => {
    if (isLeftPanelCollapsed.value) {
        isLeftPanelCollapsed.value = !isLeftPanelCollapsed.value
    }
    isCollapsed.value = !isCollapsed.value
}


const chatStore = useChatStore()
const {
    sendMessage,
    createConversation,
    deleteConversation,
    setActiveConv,
    setConversationTitle,
    clearError
} = chatStore

const {
    conversations,
    activeConvId,
    activeConversation,
    isLoading,
    error
} = storeToRefs(chatStore)



// 组件引用
const messagesContainer = ref<HTMLElement | null>(null)
const textarea = ref<HTMLTextAreaElement | null>(null)
const inputMessage = ref('')

let resizeObserver: ResizeObserver | null = null

const roleMap = {
    user: '你',
    assistant: '助手'
}

// 切换面板状态
// const toggleLeftPanel = () => {
//     if (!isCollapsed.value)
//         isCollapsed.value = !isCollapsed.value
//     isLeftPanelCollapsed.value = !isLeftPanelCollapsed.value
// }

// 开始编辑标题
const startEditTitle = (conv: Conversation) => {
    editingConvId.value = conv.id
    editedTitle.value = conv.title || conv.messages?.[0]?.content || ''

    nextTick(() => {
        if (titleInput.value.length > 0) {
            const inputEl = titleInput.value[0]
            inputEl.focus()
            inputEl.select()
        }
    })
}

// 保存标题
const saveTitle = async (conv: Conversation) => {
    if (!editedTitle.value.trim()) return

    try {
        await setConversationTitle(conv.id, editedTitle.value.trim())
    } finally {
        editingConvId.value = null
    }
}

// 处理下拉菜单打开时保持项目hover状态
const handleDropdownOpen = (conv: Conversation) => {
    const itemEl = document.querySelector(`.conversation-item[data-id="${conv.id}"]`)
    itemEl?.classList.toggle('dropdown-open')
}

const checkMobile = () => {
    if (isMobile) {
        isLeftPanelCollapsed.value = true
    }
}

// 初始化高度监听
// const initHeightObserver = () => {
//     if (!messagesContainer.value) return

//     // 创建防抖函数 (300ms)
//     const debounceScroll = debounce(() => {
//         scrollToBottom()
//     }, 3000)

//     // 初始化 ResizeObserver
//     resizeObserver = new ResizeObserver((entries) => {
//         for (const entry of entries) {
//             // 获取最新高度
//             const newHeight = entry.contentRect.height
//             console.log('容器新高度:', newHeight)

//             // 触发滚动逻辑
//             debounceScroll()
//         }
//     })

//     // 开始观察
//     resizeObserver.observe(messagesContainer.value)
// }

// 防抖函数实现
// const debounce = (fn: Function, delay: number) => {
//     let timer: number
//     return (...args: any[]) => {
//         clearTimeout(timer)
//         timer = setTimeout(() => fn(...args), delay)
//     }
// }

// 滚动到底部方法
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

// 自动调整输入框高度
const autoResize = () => {
    if (textarea.value) {
        textarea.value.style.height = 'auto'
        textarea.value.style.height = `${textarea.value.scrollHeight}px`
    }
}



const parseMarkdown = (content: string) => {
    marked.setOptions({
        highlight: (code: string, lang: string) => {
            // 确保默认添加hljs类名
            const language = lang || 'plaintext';
            try {
                return hljs.highlight(code, { language }).value;
            } catch (e) {
                return hljs.highlightAuto(code).value;
            }
        },
        gfm: true,
        breaks: true,
        // 确保marked生成带class的标签
        langPrefix: 'hljs language-'
    });

    // 转换换行符（根据需求决定是否保留）
    const withBreaks = content.replace(/\n/g, '\n\n');
    const rawHtml = marked.parse(withBreaks);

    // return rawHtml
    return DOMPurify.sanitize(rawHtml, {
        ALLOWED_ATTR: ['class', 'data-lang'], // 允许class属性
        ADD_TAGS: [],                        // 不需要额外添加标签
        FORBID_TAGS: ['style', 'script'],
        FORBID_ATTR: ['style']
    });
}



// 时间格式化
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 创建新对话
const createNewChat = () => {
    createConversation()
    inputMessage.value = ''
    isLeftPanelCollapsed.value = false
    isCollapsed.value = false
    nextTick(autoResize)
}

// 处理消息发送
// const handleSend = async () => {
//     if (!inputMessage.value.trim() || isLoading.value) return

//     try {
//         await sendMessage(inputMessage.value)
//         inputMessage.value = ''

//         // 滚动到底部
//         nextTick(() => {
//             if (messagesContainer.value) {
//                 messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
//             }
//         })
//     } catch (error) {
//         console.error('消息发送失败:', error)
//     } finally {
//         nextTick(autoResize)
//     }
// }

const handleSend = async () => {
    console.log('handleSend')
    console.log('inputMessage:', inputMessage.value)
    if (!inputMessage.value.trim() || isLoading.value) return

    try {
        await sendMessage(inputMessage.value)
        inputMessage.value = ''

        // 自动滚动到底部
        nextTick(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
            }
        })
    } catch (error) {
        console.error('消息发送失败:', error)
    } finally {
        nextTick(autoResize)
    }
}



// 初始化
onMounted(() => {
    // initHeightObserver()
    // nextTick(scrollToBottom) // 初始滚动到底部
    // checkMobile()
    // window.addEventListener('resize', checkMobile)
    console.log('messagesContainer:', messagesContainer.value?.scrollHeight)
    if (conversations.value.length === 0) {
        createNewChat()
    }
})

// 计算属性
const activeMessages = computed(() => {
    return activeConversation.value?.messages || []
})

//监听messagesContainer 高度的变化的变化

watch(() => activeMessages.value, (newVal, oldVal) => {
    // 当消息数量变化时滚动到底部
    if (newVal.length !== oldVal.length) {
        nextTick(scrollToBottom)
    }
    // 处理流式输出的中间更新
    else if (newVal.length > 0 && newVal[newVal.length - 1].role === 'assistant') {
        nextTick(scrollToBottom)
    }
}, { deep: true })


</script>

<style lang="scss" scoped>
.ai-container {
    display: flex;
    height: 100%;
    background: #f8fafc;

    .left-panel {
        width: 280px;
        background: white;
        border-right: 1px solid #e2e8f0;
        transition: width 0.3s ease;

        &.collapsed {
            width: 50px; // 缩小到只显示图标的宽度
            // transform: none; // 移除原来的位移变换
            overflow: hidden; // 隐藏溢出的内容

            // 新增折叠时的文字隐藏
            .toggle-content {
                display: none;
            }

            // 调整图标位置
            .toggle-collapse>div {
                justify-content: center;
            }

            // 隐藏箭头图标
            .arrow {
                display: none;
            }

            // 调整新建按钮位置
            .mi:add {
                display: none;
            }
        }

        .header {
            padding: 0.5rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;

            .collapse-btn {
                top: 1rem;
                z-index: 100;
                width: 28px;
                height: 28px;
                border: none;
                background: white;
                // border-radius: 50%;
                // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    transform: scale(1.1);
                }
            }
        }

        .conversation {
            // 当元素内容溢出时显示滚动条
            overflow: hidden;

            .deepSeekAdd {
                width: 100%;
                padding: 0.5rem;
                background: #f1f5f9;
                border: none;
                border-radius: 6px;
                margin-top: 0.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: background 0.2s;
                height: 60px;
                justify-content: space-between;

                .deepSeekAdd-content {
                    padding-left: 1rem;
                    font-size: 1.2em;
                }

                &:hover {
                    background: #e2e8f0;
                }
            }

            .toggle-collapse {
                width: 100%;
                padding: 0.5rem;
                background: #f1f5f9;
                border: none;
                border-radius: 6px;
                margin-top: 0.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: background 0.2s;
                height: 60px;
                justify-content: space-between;

                >div {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .toggle-content {
                    padding-left: 1rem;
                    font-size: 1.2em;

                    &.ishow {
                        display: none;
                    }
                }

                &:hover {
                    background: #e2e8f0;
                }

                .arrow {
                    align-items: end;
                    transition: transform 0.2s;
                    font-size: 0.8em;

                    &.collapsed {
                        transform: rotate(90deg);
                    }
                }
            }

            .conversation-list {
                flex: 1;
                overflow-y: auto;
                // padding: 0.5rem;
                transition: max-height 0.3s ease-out;
                max-height: 1000px; // 根据实际内容高度调整

                &::-webkit-scrollbar {
                    width: 6px; // 更细的滚动条
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                    transition: background 0.3s;

                    &:hover {
                        background: #94a3b8;
                    }
                }

                &.collapsed {
                    max-height: 0;
                    transition: max-height 0.2s ease-in;
                }

                .conversation-item {
                    padding: 0.75rem;
                    margin: 0.25rem 0;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    transition: background 0.2s;

                    .title-input {
                        width: calc(100% - 40px);
                        padding: 2px 8px;
                        border: 1px solid #e2e8f0;
                        border-radius: 4px;
                        font: inherit;
                        background: rgba(255, 255, 255, 0.9);
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

                        &:focus {
                            outline: none;
                            border-color: #3b82f6;
                            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                        }
                    }

                    &.dropdown-open {
                        background: rgba(59, 130, 246, 0.05) !important;
                    }

                    .truncate {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    &:hover {
                        background: rgba(59, 130, 246, 0.05);
                    }

                    &.active {
                        background: rgba(59, 130, 246, 0.1);
                        font-weight: 500;
                    }


                    .conv-actions {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.2s ease;

                        &:hover {
                            transform: scale(1.3);
                            // background-color: #94a3b8;
                            // border-radius: 50%;
                            box-shadow: 0 2px 6px rgba(165, 156, 156, 0.05);
                        }

                        // .delete-btn {
                        //     opacity: 0;
                        //     transition: opacity 0.2s;
                        //     background: none;
                        //     border: none;
                        //     padding: 0.2rem;
                        //     cursor: pointer;

                        //     svg {
                        //         width: 18px;
                        //         height: 18px;
                        //         fill: #999;
                        //     }

                        //     &:hover svg {
                        //         fill: #ff4d4d;
                        //         transform: scale(1.2);
                        //     }
                        // }
                    }

                    &:hover .delete-btn {
                        opacity: 1;
                        color: #ef4444;
                        transform: scale(1.5);
                    }
                }

            }
        }

    }

    .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s;

        &.fullWidth {
            margin-left: 0;
        }

        .error-banner {
            background: #ef4444;
            color: white;
            padding: 0.75rem 1.5rem;
            margin: 1rem;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideIn 0.3s ease;
        }

        .messages-container {
            // max-width: 800px;
            flex: 1;
            padding: 1.5rem;
            overflow-y: auto;
            scroll-behavior: smooth;

            .scroll-content {
                max-width: 850px;
                margin: 0 auto;
                // position: relative;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;

                .message-row {
                    margin-bottom: 1.5rem;
                    display: flex;

                    &.user {
                        // justify-content: flex-end;
                        width: 100%;
                        //靠右
                        justify-content: flex-end;

                        .message-bubble {
                            // background: #3b82f6;
                            background-color: white;
                            color: white;
                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                            border-radius: 12px 12px 0 12px;
                            padding: 16px;
                        }

                    }

                    &.assistant {
                        justify-content: flex-start;
                        width: 100%;

                        .message-bubble {
                            width: 100%;
                            background: white;
                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                            border-radius: 12px 12px 12px 0;
                            padding: 16px;
                        }

                        .message-meta {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 0.5rem;
                            font-size: 0.75rem;

                            .message-time {
                                color: rgba(255, 255, 255, 0.8);
                            }

                            .message-role {
                                color: #64748b;
                                font-weight: 500;
                            }
                        }
                    }

                    // .message-bubble {
                    //     max-width: 75%;
                    //     padding: 1rem;
                    //     position: relative;

                    //     .message-content {
                    //         line-height: 1.6;
                    //         // white-space: pre-wrap;

                    //         :deep(pre) {
                    //             background: #f3f4f6;
                    //             padding: 1rem;
                    //             border-radius: 8px;
                    //             overflow-x: auto;
                    //         }

                    //         :deep(code) {
                    //             font-family: 'JetBrains Mono', monospace;
                    //             font-size: 0.9em;
                    //         }
                    //     }

                    //     .message-meta {
                    //         display: flex;
                    //         justify-content: space-between;
                    //         margin-top: 0.5rem;
                    //         font-size: 0.75rem;

                    //         .message-time {
                    //             color: rgba(255, 255, 255, 0.8);
                    //         }

                    //         .message-role {
                    //             color: #64748b;
                    //             font-weight: 500;
                    //         }
                    //     }
                    // }
                }

                .loading-indicator {
                    padding: 1rem 0;
                    text-align: center;

                    .dot-flashing {
                        display: inline-block;
                        position: relative;
                        width: 8px;
                        height: 8px;
                        border-radius: 4px;
                        background-color: #64748b;
                        animation: dotFlashing 1s infinite linear;

                        &::before,
                        &::after {
                            content: '';
                            position: absolute;
                            display: inline-block;
                            width: 8px;
                            height: 8px;
                            border-radius: 4px;
                            background-color: #64748b;
                        }

                        &::before {
                            left: -12px;
                            animation: dotFlashing 1s infinite linear;
                            animation-delay: 0s;
                        }

                        &::after {
                            left: 12px;
                            animation: dotFlashing 1s infinite linear;
                            animation-delay: 0.5s;
                        }
                    }
                }
            }

        }

        .input-container {
            // border-top: 1px solid #e2e8f0;
            padding: 1rem;
            min-height: 150px;

            .input-wrapper {
                max-width: 850px;
                margin: 0 auto;
                // position: relative;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                width: 100%;
                min-height: 44px;
                max-height: 200px;
                background-color: white;
                // padding: 0.75rem 0.75rem 0.75rem 1rem;
                padding: 16px;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                resize: none;
                font-size: 1rem;
                line-height: 1.6;
                overflow: hidden;

                &:hover {
                    border-color: #3b82f6;
                }

                &:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }

                textarea {
                    width: 100%;
                    min-height: 44px;
                    max-height: 200px;
                    // padding: 0.75rem 3rem 0.75rem 1rem;
                    // border: 1px solid #e2e8f0;
                    // border-radius: 12px;
                    background-color: transparent;
                    border: none;
                    resize: none;
                    font-size: 1rem;
                    // font-size: 1rem;
                    // line-height: 1.6;
                    // overflow: hidden;


                }

                .input-actions {
                    min-height: 44px;
                    width: 100%;
                    display: flex;
                    justify-content: space-between;

                    .btn-left {
                        display: flex;
                        flex-direction: row;
                        align-items: center;

                        .toggle-btn {
                            width: 6rem;
                            height: 30px;
                            font-size: 0.75rem;
                            margin-right: 1rem;

                            background-color: #F5F5F5;
                            /* 默认背景 */
                            color: #333333;
                            /* 默认文字 */
                            border: 1px solid #E0E0E0;
                            border-radius: 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            /* 平滑过渡效果 */
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            gap: 0.25rem;

                            &:hover {
                                background-color: #f0f0f0;
                            }

                            // &:active {
                            //     background-color: #42a9d1;
                            // }
                            &.isthink {
                                background-color: #E1F5FE;
                                /* 点击背景 */
                                color: #0277BD;
                                /* 点击文字 */
                                border-color: #B3E5FC;
                            }
                        }

                    }

                    .btn-right {
                        display: flex;
                        flex-direction: row;
                        align-items: center;

                        .send-btn {
                            // position: absolute;
                            right: 1rem;
                            bottom: 0.75rem;
                            background: none;
                            border: none;
                            padding: 0.25rem;
                            // cursor: pointer;

                            // &:disabled {
                            //     opacity: 1;
                            //     /* 取消默认透明度 */
                            //     background: #f0f0f0;
                            //     transform: none;
                            // }
                            .loading-spinner {
                                width: 20px;
                                height: 20px;
                                border: 2px solid #3b82f6;
                                border-top-color: transparent;
                                border-radius: 50%;
                                animation: spin 1s linear infinite;
                            }
                        }
                    }


                }

            }
        }
    }
}


.reasoning-chain {
    margin-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 0.8rem;

    .reasoning-step {
        position: relative;
        margin: 0.8rem 0;
        padding: 0.8rem;
        background: rgba(241, 243, 245, 0.5);
        border-radius: 8px;
        animation: slideIn 0.3s ease-out;
        display: flex;
        gap: 0.8rem;

        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: linear-gradient(to bottom, #4f46e5, #818cf8);
            border-radius: 2px;
        }

        .thinking-icon {
            font-size: 1.2em;
            flex-shrink: 0;
        }

        .reasoning-content {
            flex: 1;
            color: #495057;
            font-size: 0.95em;
            line-height: 1.5;

            :deep(p) {
                margin: 0.4em 0;
            }

            :deep(code) {
                background: rgba(79, 70, 229, 0.1);
                color: #4f46e5;
            }
        }
    }
}


.message-content {
    caret-color: transparent;
    white-space: pre-wrap;
}

/* 打字机效果 */
.typing-cursor {
    display: inline-block;
    width: 8px;
    height: 1em;
    background: #3b82f6;
    margin-left: 2px;
    animation: blink 1s infinite;
}

@keyframes blink {
    50% {
        opacity: 0
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes dotFlashing {
    0% {
        background-color: #64748b;
    }

    50%,
    100% {
        background-color: rgba(100, 116, 139, 0.2);
    }
}

// @media (max-width: 768px) {
//     .ai-container {
//         display: flex;
//         height: 100%;
//         background: #f8fafc;

//         .left-panel {
//             width: 100px;
//             border-right: none;
//             border-bottom: 1px solid #e2e8f0;

//             // 新增折叠时的文字隐藏
//             .toggle-content {
//                 display: none;
//             }

//             // 调整图标位置
//             .toggle-collapse>div {
//                 justify-content: center;
//             }

//         }
//     }
// }

*:focus {
    outline: none !important;
}

@media (max-width: 768px) {

    .ai-container {
        position: relative;
        overflow-x: hidden;

        .left-panel {
            width: 280px;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

            &.mobile-visible {
                transform: translateX(0);
            }

            // .mobile-close-btn {
            //     position: absolute;
            //     top: 12px;
            //     right: 12px;
            //     padding: 8px;
            //     background: rgba(255, 255, 255, 0.9);
            //     border-radius: 50%;
            //     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            // }
        }

        .right-panel {
            width: 100vw;
            transform: translateX(0);
            transition: transform 0.3s ease;

            &.mobile-pushed {
                transform: translateX(280px);
            }

            .mobile-sidebar-mask {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.4);
                z-index: 999;
            }

            .mobile-menu-btn {
                position: fixed;
                top: 12px;
                left: 12px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                z-index: 100;
            }
        }
    }

    /* 优化消息容器高度 */
    .messages-container {
        height: calc(100vh - 160px) !important;
        padding-bottom: 80px;
    }

    /* 输入框适配虚拟键盘 */
    .input-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        padding: 8px;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
        z-index: 1000;

        .input-wrapper {
            max-width: 100% !important;
        }
    }
}

/* 通用触控优化 */
button,
.conversation-item {
    min-height: 44px;
    padding: 8px 12px !important;
    touch-action: manipulation;
}

/* 防止iOS点击高光 */
* {
    -webkit-tap-highlight-color: transparent;
}
</style>