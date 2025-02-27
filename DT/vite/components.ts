import type { PluginOption } from 'vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// import { CustomResolver } from '../../src/resolvers/customResolver'

export const configComponents = (): PluginOption => {
    return Components({
        dts: 'types/components.d.ts',
        resolvers: [
            ElementPlusResolver({
                importStyle: 'sass'
            }),
            // CustomResolver()
        ],
        dirs: [
            'src/components',
            'src/layouts',
            'src/views/**/components'
        ],
        include: [/\.vue$/, /\.vue\?vue/],
        exclude: [/[\\/]node_modules[\\/]/]
    })
}