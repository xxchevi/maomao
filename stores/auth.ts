import { defineStore } from 'pinia'

interface User {
  id: number
  uuid: string
  name: string
  email?: string
  isOnline: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null,
    currentUser: (state) => state.user,
    userOnlineStatus: (state) => state.user?.isOnline || false
  },

  actions: {
    async register(userData: { name: string; email: string; password: string }) {
      this.loading = true
      try {
        // 转换字段名以匹配API期望的格式
        const apiData = {
          username: userData.name,
          email: userData.email,
          password: userData.password
        }
        
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: apiData
        })
        
        if (response.success) {
          // 注册成功后自动登录
          await this.login({ username: userData.name, password: userData.password })
          return { success: true }
        }
        return response
      } catch (error) {
        console.error('注册失败:', error)
        return { success: false, message: '注册失败' }
      } finally {
        this.loading = false
      }
    },

    async login(credentials: { username: string; password: string }) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: credentials
        })
        
        if (response.success) {
          this.token = response.data.token
          this.user = response.data.user
          this.isAuthenticated = true
          
          // 保存token到cookie
          const tokenCookie = useCookie('auth-token', {
            default: () => null,
            maxAge: 60 * 60 * 24 * 7 // 7天
          })
          tokenCookie.value = response.data.token
          
          return { success: true }
        }
        return response
      } catch (error) {
        console.error('登录失败:', error)
        return { success: false, message: '登录失败' }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.user = null
        this.token = null
        this.isAuthenticated = false
        
        // 清除cookie
        const tokenCookie = useCookie('auth-token')
        tokenCookie.value = null
        
        // 跳转到登录页
        await navigateTo('/login')
      }
    },

    async fetchUser() {
      if (!this.token) return
      
      try {
        const response = await $fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        if (response.success) {
          this.user = response.data.user
          this.isAuthenticated = true
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        await this.logout()
      }
    },

    async checkOnlineStatus() {
      if (!this.token) return
      
      try {
        const response = await $fetch('/api/game/user/online', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        if (response.success && this.user) {
          this.user.isOnline = response.isOnline
        }
      } catch (error) {
        console.error('检查在线状态失败:', error)
      }
    },

    async initAuth() {
      const tokenCookie = useCookie('auth-token')
      if (tokenCookie.value) {
        this.token = tokenCookie.value
        await this.fetchUser()
      }
    }
  }
})