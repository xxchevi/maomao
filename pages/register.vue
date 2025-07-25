<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div class="max-w-md w-full space-y-8 p-8">
      <!-- Logo和标题 -->
      <div class="text-center">
        <div class="text-6xl mb-4">🐱</div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">加入猫猫世界</h2>
        <p class="text-gray-600">创建账号，开始你的挂机冒险</p>
      </div>

      <!-- 注册表单 -->
      <div class="cat-card">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="cat-input"
              placeholder="请输入用户名"
              minlength="2"
              maxlength="20"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="cat-input"
              placeholder="请输入邮箱地址"
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
              placeholder="请输入密码（至少6位）"
              minlength="6"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="cat-input"
              placeholder="请再次输入密码"
              minlength="6"
            />
          </div>

          <div class="flex items-center">
            <input
              id="agree"
              v-model="form.agree"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="agree" class="ml-2 block text-sm text-gray-700">
              我同意
              <a href="#" class="text-blue-600 hover:text-blue-500">服务条款</a>
              和
              <a href="#" class="text-blue-600 hover:text-blue-500">隐私政策</a>
            </label>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading || !isFormValid"
            class="w-full cat-button cat-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.loading">注册中...</span>
            <span v-else>创建账号</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            已有账号？
            <NuxtLink to="/login" class="text-blue-600 hover:text-blue-500 font-medium">
              立即登录
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

      <!-- 成功提示 -->
      <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex">
          <div class="text-green-400">✅</div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{{ success }}</p>
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const error = ref('')
const success = ref('')

// 表单验证
const isFormValid = computed(() => {
  return (
    form.name.length >= 2 &&
    form.email.includes('@') &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    form.agree
  )
})

// 如果已登录，重定向到首页
watchEffect(() => {
  if (authStore.isLoggedIn) {
    navigateTo('/')
  }
})

// 注册处理
const handleRegister = async () => {
  error.value = ''
  success.value = ''
  
  // 表单验证
  if (!isFormValid.value) {
    error.value = '请填写完整且正确的注册信息'
    return
  }
  
  if (form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  const result = await authStore.register({
    name: form.name,
    email: form.email,
    password: form.password
  })
  
  if (result.success) {
    success.value = '注册成功！正在为您自动登录...'
    
    // 注册成功后会自动登录，初始化游戏状态
    setTimeout(async () => {
      const gameStore = useGameStore()
      gameStore.initSocket()
      await gameStore.loadGameState()
      
      // 跳转到首页
      await navigateTo('/')
    }, 1500)
  } else {
    error.value = result.message || '注册失败，请稍后重试'
  }
}

// 页面标题
useHead({
  title: '注册 - 猫猫挂机游戏'
})
</script>