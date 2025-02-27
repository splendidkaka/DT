import type { PluginOption } from 'vite'
import { configAutoImports } from './auto-imports'
import { configComponents } from './components'

export const createPlugins = (): PluginOption[] => {
    return [
        configAutoImports(),
        configComponents(),
        // 添加其他插件...
    ]
}