<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <div class="max-w-md w-full space-y-8 p-8">
      <!-- Logo和标题 -->
      <div class="text-center">
        <div class="text-6xl mb-4">🐱</div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">猫猫挂机游戏</h2>
        <p class="text-gray-600">欢迎回来，开始你的挂机之旅</p>
      </div>

      <!-- 登录表单 -->
      <div class="cat-card">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="cat-input"
              placeholder="请输入用户名 (testuser)"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="cat-input"
              placeholder="请输入密码 (password123)"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="form.remember"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember" class="ml-2 block text-sm text-gray-700">
                记住我
              </label>
            </div>
            <a href="#" class="text-sm text-blue-600 hover:text-blue-500">
              忘记密码？
            </a>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full cat-button cat-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.loading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            还没有账号？
            <NuxtLink to="/register" class="text-blue-600 hover:text-blue-500 font-medium">
              立即注册
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <div class="text-red-400">⚠️</div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面元数据
definePageMeta({
  layout: false,
  auth: false
})

// 状态管理
const authStore = useAuthStore()
const router = useRouter()

// 响应式数据
const form = reactive({
  username: '',
  password: '',
  remember: false
})

const error = ref('')

// 如果已登录，重定向到首页
watchEffect(() => {
  if (authStore.isLoggedIn) {
    navigateTo('/')
  }
})

// 登录处理
const handleLogin = async () => {
  error.value = ''
  
  if (!form.username || !form.password) {
    error.value = '请填写完整的登录信息'
    return
  }
  
  const result = await authStore.login({
    username: form.username,
    password: form.password
  })
  
  if (result.success) {
    // 登录成功，初始化游戏状态
    const gameStore = useGameStore()
    gameStore.initSocket()
    await gameStore.loadGameState()
    
    // 跳转到首页
    await navigateTo('/')
  } else {
    error.value = result.data?.message || result.message || '登录失败，请检查用户名和密码'
  }
}

// 页面标题
useHead({
  title: '登录 - 猫猫挂机游戏'
})
</script>