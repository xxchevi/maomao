<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div class="text-2xl">🐱</div>
              <span class="text-xl font-bold text-gray-800">猫猫挂机</span>
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4" v-if="authStore.isLoggedIn">
            <!-- 角色信息 -->
            <div class="flex items-center space-x-2 text-sm" v-if="authStore.character">
              <span class="text-gray-600">{{ authStore.character?.name }}</span>
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                Lv.{{ authStore.character?.level }}
              </span>
              <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                💰 {{ authStore.character?.coins }}
              </span>
            </div>
            
            <!-- 导航菜单 -->
            <div class="hidden md:flex items-center space-x-4">
              <NuxtLink to="/game" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                游戏
              </NuxtLink>
              <NuxtLink to="/inventory" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                仓库
              </NuxtLink>

            </div>
            
            <button @click="logout" class="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
              退出
            </button>
          </div>
          
          <div class="flex items-center space-x-4" v-else>
            <NuxtLink to="/login" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              登录
            </NuxtLink>
            <NuxtLink to="/register" class="btn-primary">
              注册
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- 通知系统 -->
    <div class="fixed top-20 right-4 z-50 space-y-2">
      <TransitionGroup name="slide-up">
        <div
          v-for="notification in gameStore.notifications"
          :key="notification.id"
          :class="[
            'p-4 rounded-lg shadow-lg max-w-sm',
            {
              'bg-green-100 border border-green-400 text-green-700': notification.type === 'success',
              'bg-red-100 border border-red-400 text-red-700': notification.type === 'error',
              'bg-yellow-100 border border-yellow-400 text-yellow-700': notification.type === 'warning',
              'bg-blue-100 border border-blue-400 text-blue-700': notification.type === 'info'
            }
          ]"
        >
          <div class="flex justify-between items-start">
            <p class="text-sm">{{ notification.message }}</p>
            <button
              @click="gameStore.removeNotification(notification.id)"
              class="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200" v-if="authStore.isLoggedIn">
      <div class="flex justify-around py-2">
        <NuxtLink to="/game" class="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
          <div class="text-xl">⚒️</div>
          <span class="text-xs">游戏</span>
        </NuxtLink>
        <NuxtLink to="/inventory" class="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
          <div class="text-xl">🎒</div>
          <span class="text-xs">仓库</span>
        </NuxtLink>

      </div>
    </nav>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const gameStore = useGameStore()

const logout = async () => {
  gameStore.disconnectSocket()
  await authStore.logout()
}

// 在客户端初始化时检查认证状态
onMounted(async () => {
  // await authStore.checkAuth()
  if (authStore.isLoggedIn) {
    gameStore.initSocket()
  }
})
</script>