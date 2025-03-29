// src/utils/request.ts
import axios, { type AxiosResponse } from 'axios'

// 基础配置
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// 通用 JSON API 客户端
const jsonClient = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 流式 API 客户端（独立配置）
const streamClient = axios.create({
    baseURL,
    timeout: 300000, // 流式请求需要更长超时
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
    },
    responseType: 'text' // 必须设置为 text 模式
})

// 公共请求拦截器（例如添加认证信息）
const injectToken = (config: any) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}

jsonClient.interceptors.request.use(injectToken)
streamClient.interceptors.request.use(injectToken)

// 公共响应错误处理
const handleError = (error: any) => {
    let message = '网络请求错误'
    if (error.response) {
        message = error.response.data?.error || `服务器错误 (${error.response.status})`
    } else if (error.message.includes('timeout')) {
        message = '请求超时'
    }
    return Promise.reject(new Error(message))
}

jsonClient.interceptors.response.use(
    response => response.data,
    handleError
)

// 流式响应处理
streamClient.interceptors.response.use(
    (response: AxiosResponse) => {
        const decoder = new TextDecoder()
        let buffer = ''

        return {
            // 异步迭代器实现
            async *[Symbol.asyncIterator]() {
                console.log('response:', response)
                const reader = response.data.getReader()

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })

                    // 处理完整的事件块
                    while (buffer.includes('\n\n')) {
                        const endIndex = buffer.indexOf('\n\n')
                        const event = buffer.slice(0, endIndex)
                        buffer = buffer.slice(endIndex + 2)

                        if (event.startsWith('data: ')) {
                            try {
                                yield JSON.parse(event.slice(6))
                            } catch (e) {
                                console.error('流数据解析失败:', e)
                            }
                        }
                    }
                }

                // 处理剩余数据
                if (buffer.trim()) {
                    try {
                        yield JSON.parse(buffer)
                    } catch (e) {
                        console.error('最终数据解析失败:', e)
                    }
                }
            }
        }
    },
    handleError
)

// 类型定义
export interface ChatResponse {
    answer: string
    usage: {
        prompt_tokens: number
        completion_tokens: number
    }
}

export interface StreamChunk {
    content?: string
    done?: boolean
    error?: string
    usage?: {
        prompt_tokens: number
        completion_tokens: number
    }
}

// API 方法
export const chatAPI = {
    // 标准 JSON 接口
    sendMessage: (params: {
        question: string
        history: Array<{ role: 'user' | 'assistant'; content: string }>
    }) => jsonClient.post<ChatResponse>('/chat', params),

    // 流式接口
    streamMessage: (params: {
        question: string
        history: Array<{ role: 'user' | 'assistant'; content: string }>
    }) => streamClient.post('/chat-stream', params)
}