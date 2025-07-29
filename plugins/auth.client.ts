export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const gameStore = useGameStore()
  
  // 等待客户端水合完成后再进行状态检查
  if (process.client) {
    await nextTick()
    
    // 在客户端启动时检查认证状态
    // await authStore.checkAuth()
    
    // 如果已登录，初始化游戏相关功能
    if (authStore.isLoggedIn) {
      // 延迟一小段时间确保DOM完全准备好
      setTimeout(async () => {
        gameStore.initSocket()
        await gameStore.loadGameData()
      }, 100)
    }
  }
})