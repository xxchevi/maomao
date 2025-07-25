<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="text-2xl mr-4">🐱</div>
            <h1 class="text-xl font-bold text-gray-900">猫猫挂机游戏</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- 用户信息 -->
            <div v-if="authStore.user" class="flex items-center space-x-2">
              <div class="text-sm">
                <div class="font-medium text-gray-900">{{ authStore.user.name }}</div>
              </div>
            </div>
            
            <!-- 导航菜单 -->
            <div class="flex space-x-2">
              <NuxtLink 
                to="/" 
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="$route.path === '/' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'"
              >
                首页
              </NuxtLink>
              <NuxtLink 
                to="/collect" 
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="$route.path === '/collect' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'"
              >
                采集
              </NuxtLink>
              <NuxtLink 
                to="/inventory" 
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="$route.path === '/inventory' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'"
              >
                仓库
              </NuxtLink>
              <NuxtLink 
                to="/skills" 
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="$route.path === '/skills' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'"
              >
                技能
              </NuxtLink>
            </div>
            
            <!-- 登出按钮 -->
            <button 
              @click="handleLogout"
              class="cat-button cat-button-secondary text-sm"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- 游戏状态概览 -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 mb-8">
        <!-- 等级和经验 -->
        <div class="cat-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900">等级</h3>
            <span class="text-2xl font-bold text-blue-600">{{ gameStore.level }}</span>
          </div>
          <div class="cat-progress">
            <div 
              class="cat-progress-bar" 
              :style="{ width: experienceProgress + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-1">经验: {{ gameStore.experience }}/{{ nextLevelExp }}</p>
        </div>

        <!-- 种植技能 -->
        <div class="cat-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900">种植技能</h3>
            <span class="text-2xl font-bold text-green-600">{{ gameStore.skills.farming.level }}</span>
          </div>
          <div class="cat-progress">
            <div 
              class="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
              :style="{ width: gameStore.skills.farming.progress + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            经验: {{ gameStore.skills.farming.experience }}/{{ gameStore.skills.farming.nextLevelExp }}
          </p>
        </div>
        
        <!-- 采矿技能 -->
        <div class="cat-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900">采矿技能</h3>
            <span class="text-2xl font-bold text-purple-600">{{ gameStore.skills.mining.level }}</span>
          </div>
          <div class="cat-progress">
            <div 
              class="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
              :style="{ width: gameStore.skills.mining.progress + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            经验: {{ gameStore.skills.mining.experience }}/{{ gameStore.skills.mining.nextLevelExp }}
          </p>
        </div>
        
        <!-- 农业技能 -->
        <div class="cat-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900">农业技能</h3>
            <span class="text-2xl font-bold text-yellow-600">{{ gameStore.skills.agriculture.level }}</span>
          </div>
          <div class="cat-progress">
            <div 
              class="bg-yellow-600 h-2.5 rounded-full transition-all duration-300" 
              :style="{ width: gameStore.skills.agriculture.progress + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            经验: {{ gameStore.skills.agriculture.experience }}/{{ gameStore.skills.agriculture.nextLevelExp }}
          </p>
        </div>
        
        <!-- 钓鱼技能 -->
        <div class="cat-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900">钓鱼技能</h3>
            <span class="text-2xl font-bold text-teal-600">{{ gameStore.skills.fishing.level }}</span>
          </div>
          <div class="cat-progress">
            <div 
              class="bg-teal-600 h-2.5 rounded-full transition-all duration-300" 
              :style="{ width: gameStore.skills.fishing.progress + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            经验: {{ gameStore.skills.fishing.experience }}/{{ gameStore.skills.fishing.nextLevelExp }}
          </p>
        </div>
        
        <!-- 连接状态 -->
        <div class="cat-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900">连接状态</h3>
            <div 
              :class="gameStore.connected ? 'bg-green-400' : 'bg-red-400'"
              class="w-3 h-3 rounded-full"
            ></div>
          </div>
          <p class="text-sm text-gray-600">
            {{ gameStore.connected ? '已连接到服务器' : '连接断开' }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            物品数量: {{ gameStore.inventoryCount }}
          </p>
        </div>
      </div>

      <!-- 操作队列 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">操作队列</h2>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              队列长度: {{ gameStore.queueStatus.queueLength }}/20
            </span>
            <span v-if="gameStore.totalQueueTime > 0" class="text-sm text-gray-600">
              预计总时间: {{ formatTime(gameStore.totalQueueTime) }}
            </span>
          </div>
        </div>
        
        <!-- 当前执行的任务 -->
        <div v-if="gameStore.currentQueueTask" class="mb-4">
          <h3 class="text-lg font-medium text-gray-900 mb-2">正在执行</h3>
          <div class="idle-task-card">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-xl font-semibold text-purple-800">{{ gameStore.currentQueueTask.taskName }}</h4>
                <p class="text-purple-600">{{ gameStore.currentQueueTask.taskType }}</p>
                <p class="text-sm text-gray-600">
                  执行次数: {{ gameStore.currentQueueTask.totalCount - gameStore.currentQueueTask.remainingCount + 1 }}/{{ gameStore.currentQueueTask.totalCount }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-purple-800">{{ Math.round(gameStore.currentQueueTask.progress) }}%</div>
                <div class="text-sm text-purple-600">{{ formatRemainingTime(gameStore.currentQueueTask.remainingTime) }}</div>
              </div>
            </div>
            
            <div class="cat-progress mb-4">
              <div 
                class="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
                :style="{ width: gameStore.currentQueueTask.progress + '%' }"
              ></div>
            </div>
            
            <div class="flex justify-between items-center">
              <div class="text-sm text-purple-700">
                预计奖励: {{ formatQueueRewards(gameStore.currentQueueTask.rewards) }}
              </div>
              <div class="text-sm text-purple-700">
                经验: +{{ gameStore.currentQueueTask.experience }} {{ gameStore.currentQueueTask.skillType }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 队列中的任务 -->
        <div v-if="gameStore.queuedTasks.length > 0">
          <h3 class="text-lg font-medium text-gray-900 mb-2">队列中的任务</h3>
          <div class="space-y-2">
            <div 
              v-for="task in gameStore.queuedTasks" 
              :key="task.id"
              class="cat-card flex items-center justify-between p-4"
            >
              <div class="flex items-center space-x-4">
                <div class="text-2xl">{{ getTaskIcon(task.taskType) }}</div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ task.taskName }}</h4>
                  <p class="text-sm text-gray-600">执行 {{ task.remainingCount }} 次 · 耗时 {{ formatTime(task.duration * task.remainingCount) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">第 {{ task.queuePosition }} 位</span>
                <button 
                  @click="removeFromQueue(task.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  移除
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空队列状态 -->
        <div v-if="!gameStore.currentQueueTask && gameStore.queuedTasks.length === 0" class="cat-card text-center py-8">
          <div class="text-4xl mb-4">📋</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">队列为空</h3>
          <p class="text-gray-600 mb-4">添加任务到队列开始自动执行</p>
          <div class="flex justify-center space-x-4">
            <NuxtLink to="/collect" class="cat-button cat-button-primary">
              添加采集任务
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 队列控制 -->
      <div v-if="gameStore.hasQueuedTasks || gameStore.currentQueueTask" class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">队列控制</h2>
        <div class="cat-card">
          <div class="flex justify-center space-x-4">
            <button 
              @click="startQueueProcessing"
              class="cat-button cat-button-primary"
              :disabled="!gameStore.hasQueuedTasks"
            >
              开始队列处理
            </button>
            <button 
              @click="stopQueueProcessing"
              class="cat-button cat-button-secondary"
              :disabled="!gameStore.currentQueueTask"
            >
              停止队列处理
            </button>
            <button 
              @click="refreshQueueStatus"
              class="cat-button cat-button-secondary"
            >
              刷新状态
            </button>
          </div>
        </div>
      </div>

      <!-- 最近获得的物品 -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">最近获得</h2>
        <div class="cat-card">
          <div v-if="recentItems.length > 0" class="grid grid-cols-6 md:grid-cols-12 gap-2">
            <div 
              v-for="item in recentItems" 
              :key="item.id"
              class="inventory-slot filled"
              :title="`${item.name} x${item.quantity}`"
            >
              <span class="text-xs">{{ item.icon }}</span>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <div class="text-2xl mb-2">📦</div>
            <p>暂无物品</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// 页面元数据
definePageMeta({
  middleware: 'auth'
})

// 状态管理
const authStore = useAuthStore()
const gameStore = useGameStore()

// 计算属性
const nextLevelExp = computed(() => gameStore.level * 100)
const experienceProgress = computed(() => {
  const currentLevelExp = (gameStore.level - 1) * 100
  const nextExp = nextLevelExp.value
  const progress = ((gameStore.experience - currentLevelExp) / (nextExp - currentLevelExp)) * 100
  return Math.min(Math.max(progress, 0), 100)
})

const remainingTime = computed(() => {
  if (!gameStore.currentTask || !gameStore.currentTask.endTime) return ''
  const remaining = Math.max(0, gameStore.currentTask.endTime - Date.now())
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const recentItems = computed(() => {
  return gameStore.inventory.slice(-12) // 显示最近的12个物品
})

// 方法
const taskTypeText = (type) => {
  const types = {
    collect: '采集任务',
    craft: '制作任务',
    explore: '探索任务'
  }
  return types[type] || type
}

const formatRewards = (rewards) => {
  if (!rewards || rewards.length === 0) return '无'
  return rewards.map(r => `${r.item} (${r.chance}%)`).join(', ')
}

const formatQueueRewards = (rewards) => {
  if (!rewards || rewards.length === 0) return '无'
  return rewards.map(r => `${r.item} x${r.quantity} (${r.chance}%)`).join(', ')
}

const formatTime = (seconds) => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
}

const formatRemainingTime = (milliseconds) => {
  if (!milliseconds || milliseconds <= 0) return '已完成'
  const seconds = Math.ceil(milliseconds / 1000)
  return formatTime(seconds)
}

const getTaskIcon = (taskType) => {
  const icons = {
    'forest_collect': '🌲',
    'mine_collect': '⛏️',
    'farm_collect': '🌾',
    'fishing': '🎣'
  }
  return icons[taskType] || '📋'
}

const handleLogout = async () => {
  await authStore.logout()
}

const stopCurrentTask = async () => {
  await gameStore.stopCollectTask()
}

const quickAction = async (type) => {
  const result = await gameStore.quickAction(type)
  if (!result.success) {
    // 这里可以添加错误提示
    console.error('快捷操作失败:', result.message)
  }
}

const removeFromQueue = async (taskId) => {
  const result = await gameStore.removeTaskFromQueue(taskId)
  if (!result.success) {
    console.error('移除任务失败:', result.message)
  }
}

const startQueueProcessing = () => {
  gameStore.startQueueProcessing()
}

const stopQueueProcessing = () => {
  gameStore.stopQueueProcessing()
}

const refreshQueueStatus = async () => {
  await gameStore.getQueueStatus()
}

// 页面加载时获取队列状态
onMounted(async () => {
  await gameStore.getQueueStatus()
})

// 页面标题
useHead({
  title: '首页 - 猫猫挂机游戏'
})
</script>