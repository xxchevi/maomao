<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>

<script setup>
// 初始化认证状态
const authStore = useAuthStore()
const gameStore = useGameStore()

// 页面加载时初始化认证
onMounted(async () => {
  await authStore.initAuth()
  
  // 如果已登录，初始化游戏状态
  if (authStore.isLoggedIn) {
    gameStore.initSocket()
    await gameStore.loadGameState()
    
    // 定期检查在线状态
    setInterval(() => {
      authStore.checkOnlineStatus()
    }, 30000) // 每30秒检查一次
  }
})

// 页面卸载时断开Socket连接
onUnmounted(() => {
  gameStore.disconnectSocket()
})

// 设置页面标题
useHead({
  title: '猫猫挂机游戏',
  meta: [
    { name: 'description', content: '一个可爱的猫猫在线挂机游戏' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
}
</style>