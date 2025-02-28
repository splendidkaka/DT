import type { PluginOption } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export const configAutoImports = (): PluginOption => {
    return AutoImport({
        dts: './src/types/auto-imports.d.ts',
        imports: [
            'vue',
            'vue-router',
            'pinia',
            {
                'vue': ['ComponentPublicInstance'],
                'howler': ['Howl']
            }
        ],
        resolvers: [ElementPlusResolver()],
        eslintrc: {
            enabled: true,
            filepath: './.eslintrc-auto-import.json'
        }
    })
}