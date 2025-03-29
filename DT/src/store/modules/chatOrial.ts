// src/stores/chat.ts
import { defineStore } from 'pinia'
import { chatAPI } from '@/utils/request'
import { v4 as uuid } from 'uuid'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
    isStreaming?: boolean
}

interface Conversation {
    id: string
    title: string
    messages: Message[]
    tokenUsage?: number
    createdAt: number
}

// 新增类型
interface StreamChunk {
    content: string
    done?: boolean
    error?: string
}

// Web Worker 类型声明
declare class ChatWorker extends Worker {
    constructor()
}


// 本地存储键名
const LOCAL_STORAGE_KEY = 'chat_conversations'

export const useChatStore = defineStore('chat', {
    state: () => ({
        conversations: [] as Conversation[],
        activeConvId: '',
        isLoading: false,
        error: '',
        streamWorker: null as ChatWorker | null, // Web Worker 实例
        currentStreamId: '' // 当前流式请求ID（用于防止重复）
    }),

    actions: {
        /**
        * 初始化 Web Worker
        */
        initWorker() {
            if (!this.streamWorker) {
                this.streamWorker = new Worker(
                    new URL('@/utils/sse.worker.js', import.meta.url),
                    { type: 'module' }
                )

                // 处理 Worker 消息
                this.streamWorker.onmessage = (event: MessageEvent) => {
                    const { status, data } = event.data
                    const activeConv = this.activeConversation

                    if (!activeConv) return

                    switch (status) {
                        case 'onopen':
                            this.isLoading = false
                            this.error = ''
                            break

                        case 'onmessage':
                            this.handleStreamChunk(data)
                            break

                        case 'onerror':
                            this.handleStreamError(data.error)
                            break

                        case 'oncancel':
                            console.log('Stream canceled:', data)
                            break

                        case 'onfinally':
                            this.finalizeStream()
                            break
                    }
                }
            }
        },

        /**
         * 发送消息（流式）
         */
        async sendMessage(content: string) {
            if (!this.activeConvId) return
            if (this.isLoading) return

            this.isLoading = true
            this.error = ''
            this.currentStreamId = uuid()

            const activeConv = this.activeConversation
            if (!activeConv) return

            // 添加用户消息
            activeConv.messages.push({
                id: uuid(),
                role: 'user',
                content,
                timestamp: Date.now()
            })

            // 添加临时AI消息
            const tempMessage: Message = {
                id: this.currentStreamId,
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                isStreaming: true
            }
            activeConv.messages.push(tempMessage)

            // 初始化 Worker
            this.initWorker()

            // 发送请求参数
            this.streamWorker?.postMessage({
                action: 'sse',
                url: '/chat', // 你的流式接口地址
                method: 'POST',
                params: {
                    question: content,
                    history: activeConv.messages.slice(-8)
                },
                timeout: 30000
            })
        },

        /**
         * 处理流数据块
         */
        handleStreamChunk(chunk: StreamChunk) {
            const activeConv = this.activeConversation
            if (!activeConv || !chunk.content) return

            const lastMessage = activeConv.messages[activeConv.messages.length - 1]

            if (lastMessage.isStreaming) {
                // 追加内容并触发响应式更新
                lastMessage.content += chunk.content
                this.conversations = [...this.conversations]
            }
        },

        /**
         * 处理流错误
         */
        handleStreamError(error: string) {
            this.error = error || 'Stream connection failed'
            this.cancelStream()
        },

        /**
         * 完成流处理
         */
        finalizeStream() {
            const activeConv = this.activeConversation
            if (!activeConv) return

            const lastMessage = activeConv.messages[activeConv.messages.length - 1]
            if (lastMessage.isStreaming) {
                // 更新消息状态
                lastMessage.isStreaming = false
                lastMessage.timestamp = Date.now()
                this.conversations = [...this.conversations]
                this.saveToLocal()
            }

            this.currentStreamId = ''
            this.isLoading = false
        },

        /**
         * 取消当前流
         */
        cancelStream() {
            if (this.streamWorker && this.currentStreamId) {
                this.streamWorker.postMessage({ action: 'abort' })

                // 移除临时消息
                const activeConv = this.activeConversation
                if (activeConv) {
                    activeConv.messages = activeConv.messages.filter(
                        m => m.id !== this.currentStreamId
                    )
                    this.conversations = [...this.conversations]
                }

                this.currentStreamId = ''
                this.isLoading = false
            }
        },



        /**
         * 创建新对话
         */
        createConversation() {
            const newConv: Conversation = {
                id: uuid(),
                title: `对话 ${this.conversations.length + 1}`,
                messages: [],
                tokenUsage: 0,
                createdAt: Date.now()
            }

            this.conversations.unshift(newConv)
            this.activeConvId = newConv.id
            this.saveToLocal()
        },

        /**
         * 删除对话
         */
        deleteConversation(convId: string) {
            this.conversations = this.conversations.filter(c => c.id !== convId)

            // 如果删除的是当前对话
            if (this.activeConvId === convId) {
                this.activeConvId = this.conversations[0]?.id || ''
            }

            this.saveToLocal()
        },

        /**
         * 设置当前对话
         */
        setActiveConv(convId: string) {
            // console.log('convId:', convId)
            // console.log('this.conversations:', this.conversations)
            if (this.conversations.some(c => c.id === convId)) {
                this.activeConvId = convId
            }
        },

        /**
         * 清空错误信息
         */
        clearError() {
            this.error = ''
        },

        /**
         * 从本地存储加载数据
         */
        loadFromLocal() {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY)
            if (data) {
                try {
                    const parsed = JSON.parse(data)
                    this.conversations = parsed.conversations || []
                    this.activeConvId = parsed.activeConvId || ''
                } catch {
                    this.clearStorage()
                }
            }
        },

        /**
         * 保存到本地存储
         */
        saveToLocal() {
            const data = {
                conversations: this.conversations,
                activeConvId: this.activeConvId
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
        },

        /**
         * 清空本地存储
         */
        clearStorage() {
            localStorage.removeItem(LOCAL_STORAGE_KEY)
            this.conversations = []
            this.activeConvId = ''
            this.createConversation()
        }
    },

    getters: {
        /**
         * 当前活动对话
         */
        activeConversation(): Conversation | undefined {
            return this.conversations.find(c => c.id === this.activeConvId)
        },

        /**
         * 当前对话的消息列表
         */
        activeMessages(): Message[] {
            return this.activeConversation?.messages || []
        }
    }
})

// 初始化时自动加载本地数据
const store = useChatStore()
store.loadFromLocal()