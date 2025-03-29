// src/stores/chat.ts
import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';

type MessageRole = 'user' | 'assistant';

interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    contentThink?: string;
    timestamp: number;
    isStreaming?: boolean;
}

interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

interface StreamChunk {
    content: string;
    contentThink?: string;
    done?: boolean;
    error?: string;
}

interface WorkerError {
    type: 'abort' | 'timeout' | 'network';
    message: string;
    abortData?: unknown;
}

declare class ChatWorker extends Worker {
    constructor();
}

const LOCAL_STORAGE_KEY = 'chat_conversations_v2';

export const useChatStore = defineStore('chat', {
    state: () => ({
        conversations: [] as Conversation[],
        activeConvId: '',
        isLoading: false,
        error: '',
        streamWorker: null as ChatWorker | null,
        currentStreamId: '',
        retryCount: 0,
        streamBuffer: new Map<string, string>(), // 用于缓存流式响应
    }),

    actions: {
        // 初始化 Web Worker
        initWorker() {
            if (!this.streamWorker) {
                this.streamWorker = new Worker(
                    new URL('@/utils/EventStreamWorker.js', import.meta.url)
                );

                this.streamWorker.onmessage = (event: MessageEvent) => {
                    const { status, data, error } = event.data;
                    const activeConv = this.activeConversation;

                    switch (status) {
                        case 'onopen':
                            this.handleStreamStart();
                            break;

                        case 'onmessage':
                            this.handleStreamData(data);
                            break;

                        case 'onerror':
                            this.handleStreamError(error);
                            break;

                        case 'onfinally':
                            this.finalizeStream();
                            break;
                    }
                };
            }
        },

        // 处理流式响应开始
        handleStreamStart() {
            this.isLoading = false;
            this.error = '';
            this.retryCount = 0;
        },

        // 处理流式数据
        // handleStreamData(chunk: StreamChunk) {
        //     console.log('Stream chunk:', chunk);
        //     const activeConv = this.activeConversation;
        //     if (!activeConv || !chunk.content) return;

        //     this.$patch((state) => {
        //         const conv = state.conversations.find(c => c.id === state.activeConvId);
        //         if (!conv) return;

        //         const lastMsg = conv.messages[conv.messages.length - 1];
        //         if (lastMsg?.id === state.currentStreamId) {
        //             lastMsg.content += chunk.content;
        //             lastMsg.timestamp = Date.now();
        //         }
        //     });
        // },


        // stores/chat.ts
        handleStreamData(chunk: StreamChunk) {
            this.$patch((state) => {
                const conv = state.conversations.find(c => c.id === state.activeConvId);
                if (!conv) return;

                const lastMsg = conv.messages[conv.messages.length - 1];
                if (lastMsg?.id === state.currentStreamId) {
                    // 分别处理两种内容
                    if (chunk.content) {
                        lastMsg.content += chunk.content;
                    }
                    if (chunk.contentThink) {
                        // lastMsg.reasoning = [...(lastMsg.reasoning || []), chunk.think];
                        // console.log('chunk.contentThink:', chunk.contentThink)
                        lastMsg.contentThink += chunk.contentThink;
                    }
                    lastMsg.timestamp = Date.now();
                }
            });
        },

        // 处理错误
        handleStreamError(error: WorkerError) {
            switch (error.type) {
                case 'abort':
                    this.error = '请求已取消';
                    break;

                case 'timeout':
                    this.error = `请求超时: ${error.message}`;
                    break;

                default:
                    this.error = `请求失败: ${error.message}`;
                    if (this.retryCount < 3) {
                        setTimeout(() => this.retryRequest(), 200000);
                        this.retryCount++;
                        return;
                    }
            }

            this.cancelStream();
        },

        // 重试请求
        async retryRequest() {
            const activeConv = this.activeConversation;
            if (!activeConv) return;

            const lastUserMsg = activeConv.messages
                .slice()
                .reverse()
                .find(m => m.role === 'user');

            if (lastUserMsg) {
                await this.sendMessage(lastUserMsg.content);
            }
        },

        // 发送消息
        async sendMessage(content: string) {
            if (!this.activeConvId || this.isLoading) return;

            this.isLoading = true;
            this.currentStreamId = uuid();
            const activeConv = this.activeConversation;

            if (!activeConv) return;

            // 添加消息记录
            activeConv.messages.push(
                {
                    id: uuid(),
                    role: 'user',
                    content,
                    contentThink: '',
                    timestamp: Date.now()
                },
                {
                    id: this.currentStreamId,
                    role: 'assistant',
                    content: '',
                    contentThink: '',
                    timestamp: Date.now(),
                    isStreaming: true
                }
            );

            // 初始化 Worker
            this.initWorker();

            // 发送请求
            this.streamWorker?.postMessage({
                action: 'sse',
                url: import.meta.env.VITE_API_BASE + '/chat-stream',
                // url: '/api/chat-stream',
                method: 'POST',
                params: {
                    question: content,
                    history: activeConv.messages
                        .filter(m => !m.isStreaming)
                        .slice(-6)
                        .map(m => ({
                            role: m.role,
                            content: m.content
                        }))
                },
                headers: {
                    'X-Request-ID': this.currentStreamId
                },
                timeout: 30000,
                abortData: this.currentStreamId
            });
        },

        // 取消请求
        cancelStream() {
            if (this.streamWorker && this.currentStreamId) {
                this.streamWorker.postMessage({
                    action: 'abort',
                    abortData: this.currentStreamId
                });

                this.$patch((state) => {
                    const conv = state.conversations.find(c => c.id === state.activeConvId);
                    if (conv) {
                        conv.messages = conv.messages.filter(m => m.id !== state.currentStreamId);
                    }
                });

                this.resetStreamState();
            }
        },

        // 重置流状态
        resetStreamState() {
            this.currentStreamId = '';
            this.isLoading = false;
            this.retryCount = 0;
        },


        // 完成流处理
        finalizeStream() {
            this.$patch((state) => {
                const conv = state.conversations.find(c => c.id === state.activeConvId);
                if (!conv) return;

                const lastMsg = conv.messages[conv.messages.length - 1];
                if (lastMsg?.isStreaming) {
                    lastMsg.isStreaming = false;
                    lastMsg.timestamp = Date.now();
                    conv.updatedAt = Date.now();
                }
            });

            this.saveToLocal();
            this.resetStreamState();
        },

        // 对话管理
        createConversation() {
            const newConv: Conversation = {
                id: uuid(),
                title: '',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            this.conversations.unshift(newConv);
            this.activeConvId = newConv.id;
            this.saveToLocal();
        },

        // 通过id 设置title
        setConversationTitle(convId: string, title: string) {
            const conv = this.conversations.find(c => c.id === convId);
            if (conv) {
                conv.title = title;
                this.saveToLocal();
            }
        },

        deleteConversation(convId: string) {
            this.conversations = this.conversations.filter(c => c.id !== convId);
            if (this.activeConvId === convId) {
                this.activeConvId = this.conversations[0]?.id || '';
            }
            this.saveToLocal();
        },

        // 持久化
        saveToLocal() {
            const data = {
                version: 1,
                conversations: this.conversations.map(c => ({
                    ...c,
                    messages: c.messages.filter(m => !m.isStreaming)
                })),
                activeConvId: this.activeConvId
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        },

        loadFromLocal() {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    if (data.version === 1) {
                        this.conversations = data.conversations || [];
                        this.activeConvId = data.activeConvId || '';
                    }
                } catch {
                    this.clearStorage();
                }
            }
        },

        clearStorage() {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            this.$reset();
            this.createConversation();
        },
        setActiveConv(convId: string) {
            // console.log('convId:', convId)
            // console.log('this.conversations:', this.conversations)
            if (this.conversations.some(c => c.id === convId)) {
                this.activeConvId = convId
            }
        },
    },

    getters: {
        activeConversation(): Conversation | undefined {
            return this.conversations.find(c => c.id === this.activeConvId);
        },

        sortedConversations(): Conversation[] {
            return [...this.conversations].sort(
                (a, b) => b.updatedAt - a.updatedAt
            );
        },
        activeMessages(): ChatMessage[] {
            return this.activeConversation?.messages || []
        }
    }
});

// 初始化时自动加载本地数据
const store = useChatStore()
store.loadFromLocal()