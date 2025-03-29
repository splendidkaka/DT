type AnimationType = 'airplane' | 'heart' | 'default'
type AnimationPreset = {
    type: AnimationType
    path: string
    scale: number
    color: string
    duration: number
}
// AnimationPreset添加到animationPresets
export const animationPresets: Record<string, AnimationPreset> = {
    default: {
        type: 'default',
        path: 'M0 0 Q 50 100 100 0',  // 可见的测试路径
        scale: 1,
        color: '#FF0000',  // 使用高对比度颜色
        duration: 3
    },
    '飞机场的十点半': {
        type: 'airplane',
        path: 'M-100 50 Q 50 -50 200 50',  // 更宽的可见路径
        scale: 1.5,
        color: '#FF6B6B',
        duration: 4
    },
    '爱很简单': {
        type: 'heart',
        path: 'M0 50 Q 50 0 100 50',  // 波浪形路径
        scale: 2,
        color: '#FF4081',
        duration: 2
    }
};