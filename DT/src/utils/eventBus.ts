// src/utils/eventBus.ts
import mitt from 'mitt';

// 定义事件类型
type Events = {
    seekToTime: number;
    togglePlay: boolean;
    // 可以添加更多事件...
};

export const emitter = mitt<Events>();