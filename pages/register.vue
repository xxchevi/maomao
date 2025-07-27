<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="text-center text-4xl mb-4">🐱</div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          创建账号
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          已有账号？
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            立即登录
          </NuxtLink>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请输入用户名"
            />
          </div>
          
          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700">
              昵称
            </label>
            <input
              id="nickname"
              v-model="form.nickname"
              type="text"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请输入昵称"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              邮箱地址（可选）
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请输入邮箱地址（可选）"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请输入密码（至少6位）"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              确认密码
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请再次输入密码"
            />
          </div>
        </div>

        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="mr-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </div>
        
        <div class="text-xs text-gray-500 text-center">
          注册即表示您同意我们的服务条款和隐私政策
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const gameStore = useGameStore()

// 如果已登录，重定向到游戏页面
if (authStore.isLoggedIn) {
  await navigateTo('/game')
}

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  return (
    form.username &&
    form.nickname &&
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword &&
    form.password.length >= 6
  )
})

watch(() => form.confirmPassword, () => {
  if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
  } else {
    error.value = ''
  }
})

watch(() => form.password, () => {
  if (form.password && form.password.length < 6) {
    error.value = '密码长度至少为6位'
  } else if (form.confirmPassword && form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
  } else {
    error.value = ''
  }
})

const handleRegister = async () => {
  if (loading.value || !isFormValid.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await authStore.register(form.username, form.nickname, form.email, form.password)
    
    if (result.success) {
      // 初始化Socket连接和游戏数据
      gameStore.initSocket()
      await gameStore.loadGameData()
      
      // 重定向到游戏页面
      await navigateTo('/game')
    } else {
      error.value = result.error || '注册失败'
    }
  } catch (err) {
    error.value = err.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 设置页面元数据
useHead({
  title: '注册 - 猫猫挂机游戏'
})

// 页面布局
definePageMeta({
  layout: false
})
</script>