import { defineStore } from 'pinia'

interface SettingsState {
    animate: boolean
}

export const useSettingsStore = defineStore('settings', {
    state: (): SettingsState => ({
        animate: true
    }),

    actions: {
        loadSettings() {
            const saved = localStorage.getItem('settings')
            if (saved) {
                this.$state = JSON.parse(saved)
            }
        },

        saveSettings() {
            localStorage.setItem('settings', JSON.stringify(this.$state))
        }
    },
    persist: true
})