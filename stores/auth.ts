import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  username: string
}

interface Character {
  id: string
  name: string
  level: number
  exp: number
  miningLevel: number
  gatheringLevel: number
  fishingLevel: number
  cookingLevel: number
  craftingLevel: number
  miningExp: number
  gatheringExp: number
  fishingExp: number
  cookingExp: number
  craftingExp: number
  coins: number
  lastOnline: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    character: null as Character | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    hasCharacter: (state) => !!state.character
  },

  actions: {
    async login(username:string, password:string) {
      try {
        const { data } = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { username, password }
        })

        this.token = data.token
        this.user = data.user
        this.character = data.character
        this.isAuthenticated = true

        // 保存到localStorage
        if (process.client) {
          localStorage.setItem('auth-token', data.token)
        }

        return { success: true }
      } catch (error:any) {
        return { success: false, error: error.data?.message || '登录失败' }
      }
    },

    async register(username:string, nickname:string, email:string, password:string) {
      try {
        const { data } = await $fetch('/api/auth/register', {
          method: 'POST',
          body: { username, nickname, email, password }
        })

        this.token = data.token
        this.user = data.user
        this.character = data.character
        this.isAuthenticated = true

        // 保存到localStorage
        if (process.client) {
          localStorage.setItem('auth-token', data.token)
        }

        return { success: true }
      } catch (error:any) {
        return { success: false, error: error.data?.message || '注册失败' }
      }
    },

    async logout() {
      this.user = null
      this.character = null
      this.token = null
      this.isAuthenticated = false

      if (process.client) {
        localStorage.removeItem('auth-token')
      }

      await navigateTo('/login')
    },

    async checkAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth-token')
        if (token) {
          try {
            const { data } = await $fetch('/api/auth/me', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })

            this.token = token
            this.user = data.user
            this.character = data.character
            this.isAuthenticated = true
          } catch (error) {
            this.logout()
          }
        }
      }
    },

    updateCharacter(character: Character) {
      this.character = character
    }
  }
})