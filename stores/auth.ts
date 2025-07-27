import { defineStore } from 'pinia'
import { useCookie } from 'nuxt/app'

interface User {
  id: string
  email: string | null
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

        // 保存到cookie
        if (process.client) {
          const authCookie = useCookie('auth-token', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
          })
          authCookie.value = data.token
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

        // 保存到cookie
        if (process.client) {
          const authCookie = useCookie('auth-token', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
          })
          authCookie.value = data.token
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
        const authCookie = useCookie('auth-token', {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        })
        authCookie.value = null
      }

      await navigateTo('/login')
    },

    async checkAuth() {
      const authCookie = useCookie('auth-token')
      const token = authCookie.value
      if (token) {
        try {
          this.token = token
          const response = await $fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          // 确保正确解析API响应结构
          this.user = response.data.user
          this.character = response.data.character
          this.isAuthenticated = true
        } catch (error) {
          console.error('Auth check failed:', error)
          // 清除无效的token
          this.user = null
          this.character = null
          this.token = null
          this.isAuthenticated = false
          
          if (process.client) {
            const authCookie = useCookie('auth-token')
            authCookie.value = null
          }
        }
      }
    },

    updateCharacter(character: Character) {
      this.character = character
    }
  }
})