import { defineStore } from 'pinia'

type Theme = {
    name: string
    colors: Record<string, string>
}

export const useThemeStore = defineStore('theme', {
    state: () => ({
        currentTheme: 'light',
        themeOptions: [
            { value: 'light', label: '明亮主题' },
            { value: 'dark', label: '暗黑主题' },
            { value: 'ocean', label: '海洋主题' },
            { value: 'nature', label: '自然主题' },
            { value: 'vintage', label: '复古主题' },
            { value: 'midnight', label: '午夜主题' }
        ],
        themes: {
            light: {
                name: '明亮主题',
                colors: {
                    '--color-primary': '#2196f3',
                    '--color-secondary': '#ff9800',
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f5f5f5',
                    '--text-primary': '#212121',
                    '--text-secondary': '#757575'
                }
            },
            dark: {
                name: '暗黑主题',
                colors: {
                    '--color-primary': '#4caf50',
                    '--color-secondary': '#ff5722',
                    '--bg-primary': '#121212',
                    '--bg-secondary': '#1e1e1e',
                    '--text-primary': '#e0e0e0',
                    '--text-secondary': '#9e9e9e'
                }
            },
            ocean: {
                name: '海洋主题',
                colors: {
                    '--color-primary': '#00bcd4',
                    '--color-secondary': '#ff4081',
                    '--bg-primary': '#e0f7fa',
                    '--bg-secondary': '#b2ebf2',
                    '--text-primary': '#006064',
                    '--text-secondary': '#00838f'
                }
            },
            // 新增主题
            nature: {
                name: '自然主题',
                colors: {
                    '--color-primary': '#2e7d32',
                    '--color-secondary': '#f9a825',
                    '--bg-primary': '#f1f8e9',
                    '--bg-secondary': '#dcedc8',
                    '--text-primary': '#33691e',
                    '--text-secondary': '#689f38'
                }
            },
            vintage: {
                name: '复古主题',
                colors: {
                    '--color-primary': '#d32f2f',
                    '--color-secondary': '#ffa000',
                    '--bg-primary': '#fff3e0',
                    '--bg-secondary': '#ffe0b2',
                    '--text-primary': '#5d4037',
                    '--text-secondary': '#8d6e63'
                }
            },
            midnight: {
                name: '午夜主题',
                colors: {
                    '--color-primary': '#2962ff',
                    '--color-secondary': '#00b8d4',
                    '--bg-primary': '#0a1929',
                    '--bg-secondary': '#17212f',
                    '--text-primary': '#e0e0e0',
                    '--text-secondary': '#90a4ae'
                }
            }
        } as Record<string, Theme>
    }),

    actions: {
        setTheme(themeName: string) {
            if (this.themes[themeName]) {
                this.$patch({ currentTheme: themeName })
                this.applyTheme()
                this.saveSettings()
            }
        },

        applyTheme() {
            const theme = this.themes[this.currentTheme]
            const root = document.documentElement

            // 清除旧主题变量
            const previousTheme = Object.keys(this.themes).reduce((acc, key) => {
                return [...acc, ...Object.keys(this.themes[key].colors)]
            }, [] as string[])
            previousTheme.forEach(key => root.style.removeProperty(key))

            // 设置新主题变量
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(key, value)
            })
        },

        // 持久化增强版
        loadSettings() {
            const saved = localStorage.getItem('themeSettings')
            try {
                if (saved) {
                    const settings = JSON.parse(saved)
                    if (settings.currentTheme && this.themes[settings.currentTheme]) {
                        this.currentTheme = settings.currentTheme
                        this.applyTheme()
                    }
                }
            } catch (e) {
                console.error('Failed to load theme settings:', e)
            }
        },

        saveSettings() {
            const settings = {
                currentTheme: this.currentTheme,
                timestamp: new Date().toISOString()
            }
            localStorage.setItem('themeSettings', JSON.stringify(settings))
        }
    },

    // 增强持久化配置
    persist: true
})