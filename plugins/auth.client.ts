export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const gameStore = useGameStore()
  
  // 在客户端启动时检查认证状态
  await authStore.checkAuth()
  
  // 如果已登录，初始化游戏相关功能
  if (authStore.isLoggedIn) {
    gameStore.initSocket()
    await gameStore.loadGameData()
  }
})