export interface Message {
    content: string
    role: 'user' | 'assistant'
    timestamp: number
}

export interface Conversation {
    id: string
    title: string
    messages: Message[]
    createdAt: number
}