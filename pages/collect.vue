<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl mr-4">🐱</NuxtLink>
            <h1 class="text-xl font-semibold text-gray-900">采集系统</h1>
            <!-- 性能监控指示器 -->
            <div v-if="showPerformanceInfo" class="ml-4 flex items-center space-x-2 text-xs text-gray-500">
              <span>FPS: {{ performanceData.fps }}</span>
              <span>延迟: {{ performanceData.latency }}ms</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex space-x-2">
              <NuxtLink to="/" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                首页
              </NuxtLink>
              <NuxtLink to="/collect" class="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">
                采集
              </NuxtLink>
              <NuxtLink to="/inventory" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                仓库
              </NuxtLink>
              <NuxtLink to="/skills" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                技能
              </NuxtLink>
            </div>
            <span class="text-sm text-gray-600">经验: {{ gameStore.experience }}</span>
            <span class="text-sm text-gray-600">等级: {{ gameStore.level }}</span>
            <!-- 连接状态指示器 -->
            <div class="flex items-center space-x-1">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  gameStore.connected ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span class="text-xs text-gray-500">
                {{ gameStore.connected ? '已连接' : '未连接' }}
              </span>
            </div>
            <button @click="handleLogout" class="cat-button cat-button-secondary text-sm">
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- 队列状态概览 -->
      <div class="mb-8">
        <div class="cat-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">队列状态</h2>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                队列长度: {{ gameStore.queueStatus.queueLength }}/20
              </span>
            </div>
          </div>
          
          <div v-if="gameStore.currentQueueTask" class="mb-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900">正在执行: {{ gameStore.currentQueueTask.taskName }}</h3>
                <p class="text-sm text-gray-600">
                  进度: {{ Math.round(gameStore.currentQueueTask.progress) }}% · 
                  剩余: {{ formatRemainingTime(gameStore.currentQueueTask.remainingTime) }}
                </p>
              </div>
            </div>
          </div>
          
          <div v-if="gameStore.queuedTasks.length > 0">
            <p class="text-sm text-gray-600">
              队列中有 {{ gameStore.queuedTasks.length }} 个任务等待执行
            </p>
          </div>
          
          <div v-if="!gameStore.currentQueueTask && gameStore.queuedTasks.length === 0">
            <p class="text-sm text-gray-600">队列为空，添加任务开始自动执行</p>
          </div>
        </div>
      </div>

      <!-- 采集任务选择 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 森林采集 -->
        <AsyncComponent>
          <div class="cat-card hover:shadow-lg transition-shadow cursor-pointer" @click="openTaskModal('forest_collect')">
            <AsyncImage
               src="/images/forest.svg"
               alt="森林采集"
               :height="192"
               object-fit="cover"
               class="w-full rounded-t-lg"
             >
              <template #placeholder>
                <div class="h-48 bg-green-100 flex items-center justify-center rounded-t-lg">
                  <span class="text-6xl">🌲</span>
                </div>
              </template>
              <template #error>
                <div class="h-48 bg-green-100 flex items-center justify-center rounded-t-lg">
                  <span class="text-6xl">🌲</span>
                </div>
              </template>
            </AsyncImage>
            <div class="text-center p-4">
              <h3 class="text-lg font-semibold text-gray-900">森林采集</h3>
              <p class="text-sm text-gray-600 mt-2">采集森林中的各种资源</p>
            </div>
          </div>
        </AsyncComponent>

        <!-- 矿洞采集 -->
        <AsyncComponent>
          <div class="cat-card hover:shadow-lg transition-shadow cursor-pointer" @click="openTaskModal('mine_collect')">
            <AsyncImage
               src="/images/mine.svg"
               alt="矿洞采集"
               :height="192"
               object-fit="cover"
               class="w-full rounded-t-lg"
             >
              <template #placeholder>
                <div class="h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
                  <span class="text-6xl">⛏️</span>
                </div>
              </template>
              <template #error>
                <div class="h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
                  <span class="text-6xl">⛏️</span>
                </div>
              </template>
            </AsyncImage>
            <div class="text-center p-4">
              <h3 class="text-lg font-semibold text-gray-900">矿洞采集</h3>
              <p class="text-sm text-gray-600 mt-2">挖掘珍贵的矿物资源</p>
            </div>
          </div>
        </AsyncComponent>

        <!-- 农场采集 -->
        <AsyncComponent>
          <div class="cat-card hover:shadow-lg transition-shadow cursor-pointer" @click="openTaskModal('farm_collect')">
            <AsyncImage
               src="/images/farm.svg"
               alt="农场采集"
               :height="192"
               object-fit="cover"
               class="w-full rounded-t-lg"
             >
              <template #placeholder>
                <div class="h-48 bg-yellow-100 flex items-center justify-center rounded-t-lg">
                  <span class="text-6xl">🌾</span>
                </div>
              </template>
              <template #error>
                <div class="h-48 bg-yellow-100 flex items-center justify-center rounded-t-lg">
                  <span class="text-6xl">🌾</span>
                </div>
              </template>
            </AsyncImage>
            <div class="text-center p-4">
              <h3 class="text-lg font-semibold text-gray-900">农场采集</h3>
              <p class="text-sm text-gray-600 mt-2">收获农场中的作物</p>
            </div>
          </div>
        </AsyncComponent>

        <!-- 钓鱼 -->
        <AsyncComponent>
          <div class="cat-card hover:shadow-lg transition-shadow cursor-pointer" @click="openTaskModal('fishing')">
            <AsyncImage
               src="/images/fishing.svg"
               alt="钓鱼"
               :height="192"
               object-fit="cover"
               class="w-full rounded-t-lg"
             >
              <template #placeholder>
                <div class="h-48 bg-blue-100 flex items-center justify-center rounded-t-lg">
                  <span class="text-6xl">🎣</span>
                </div>
              </template>
              <template #error>
                <div class="h-48 bg-blue-100 flex items-center justify-center rounded-t-lg">
                  <span class="text-6xl">🎣</span>
                </div>
              </template>
            </AsyncImage>
            <div class="text-center p-4">
              <h3 class="text-lg font-semibold text-gray-900">钓鱼</h3>
              <p class="text-sm text-gray-600 mt-2">在湖边钓取各种鱼类</p>
            </div>
          </div>
        </AsyncComponent>
      </div>

      <!-- 任务详情弹窗 -->
      <div v-if="showTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeTaskModal">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">{{ selectedTaskInfo.name }}</h3>
            <button @click="closeTaskModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- 任务图标 -->
          <div class="text-center mb-4">
            <div class="text-6xl mb-2">{{ selectedTaskInfo.icon }}</div>
          </div>
          
          <!-- 耗时 -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-900 mb-2">耗时</h4>
            <p class="text-gray-600">{{ selectedTaskInfo.duration }}秒/次</p>
          </div>
          
          <!-- 获得 -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-900 mb-2">获得</h4>
            <div class="space-y-1">
              <div v-for="reward in selectedTaskInfo.rewards" :key="reward.name" class="flex items-center justify-between text-sm">
                <span class="flex items-center">
                  <span class="mr-2">{{ reward.icon }}</span>
                  {{ reward.name }}
                </span>
                <span class="text-gray-600">{{ reward.min }} ~ {{ reward.max }} ({{ reward.chance }}%)</span>
              </div>
            </div>
          </div>
          
          <!-- 提升经验 -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-900 mb-2">提升经验</h4>
            <p class="text-gray-600">{{ selectedTaskInfo.skill }}: {{ selectedTaskInfo.experience }} 经验</p>
          </div>
          
          <!-- 执行次数 -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-900 mb-2">执行次数</h4>
            <div class="flex items-center space-x-2 mb-2">
              <input 
                v-model.number="taskCount" 
                type="number" 
                min="1" 
                max="1000" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="输入次数"
              >
            </div>
            <div class="flex space-x-2">
              <button @click="addTaskCount(10)" class="cat-button cat-button-secondary text-xs">+10</button>
              <button @click="addTaskCount(100)" class="cat-button cat-button-secondary text-xs">+100</button>
              <button @click="addTaskCount(1000)" class="cat-button cat-button-secondary text-xs">+1000</button>
            </div>
          </div>
          
          <!-- 预计耗时 -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-2">预计耗时</h4>
            <p class="text-gray-600">{{ formatTime(selectedTaskInfo.duration * taskCount) }}</p>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex space-x-3">
            <button 
              @click="addToQueue"
              :disabled="!canAddTask"
              class="flex-1 cat-button cat-button-secondary disabled:opacity-50"
            >
              加入队列
            </button>
            <button 
              @click="executeImmediately"
              :disabled="!canExecuteImmediately"
              class="flex-1 cat-button cat-button-primary disabled:opacity-50"
            >
              立即执行
            </button>
          </div>
          
          <!-- 提示信息 -->
          <div v-if="!canAddTask" class="mt-3 text-sm text-red-600">
            队列已满
          </div>
          <div v-if="!canExecuteImmediately" class="mt-3 text-sm text-yellow-600">
            当前有任务正在执行
          </div>
        </div>
      </div>
    </main>
    
    <!-- 性能监控组件 -->
    <PerformanceMonitor 
      :data="performanceData"
      :visible="showPerformanceInfo"
      auto-hide
      @optimize="handlePerformanceOptimize"
      @clear-cache="handleClearCache"
      @export="handleExportPerformanceData"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameOptimization } from '~/composables/useGameOptimization'
import { useCache } from '~/utils/cacheManager'
import AsyncComponent from '~/components/AsyncComponent.vue'
import AsyncImage from '~/components/AsyncImage.vue'
import PerformanceMonitor from '~/components/PerformanceMonitor.vue'

// 页面元数据
definePageMeta({
  middleware: 'auth'
})

// 状态管理
const authStore = useAuthStore()
const gameStore = useGameStore()

// 响应式数据
const showTaskModal = ref(false)
const selectedTaskType = ref('')
const taskCount = ref(1)
const showPerformanceInfo = ref(true)
const performanceData = ref({
  fps: 60,
  latency: 0,
  memory: 0,
  timestamp: Date.now()
})

// 性能优化
const { 
  startPerformanceMonitoring, 
  stopPerformanceMonitoring,
  enableAutoSave,
  disableAutoSave,
  preloadResources,
  adjustQuality
} = useGameOptimization()

// 缓存管理
const { cache: gameCache } = useCache('game')

// 性能监控处理函数
const handlePerformanceOptimize = () => {
  adjustQuality()
  gameCache.clear()
  if (typeof window !== 'undefined' && window.gc) {
    window.gc()
  }
}

const handleClearCache = () => {
  gameCache.clear()
}

const handleExportPerformanceData = () => {
  const data = {
    ...performanceData.value,
    timestamp: new Date().toISOString(),
    cacheStats: gameCache.getStats()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 任务信息映射
const taskInfoMap = {
  forest_collect: {
    name: '森林采集',
    icon: '🌲',
    duration: 30,
    skill: '采集',
    experience: 2,
    rewards: [
      { name: '木材', icon: '🪵', min: 1, max: 3, chance: 90.0 },
      { name: '浆果', icon: '🫐', min: 1, max: 2, chance: 60.0 },
      { name: '草药', icon: '🌿', min: 1, max: 1, chance: 30.0 },
      { name: '稀有种子', icon: '🌱', min: 1, max: 1, chance: 5.0 }
    ]
  },
  mine_collect: {
    name: '矿洞采集',
    icon: '⛏️',
    duration: 60,
    skill: '挖掘',
    experience: 4,
    rewards: [
      { name: '石头', icon: '🪨', min: 1, max: 2, chance: 95.0 },
      { name: '铁矿', icon: '⚙️', min: 1, max: 1, chance: 50.0 },
      { name: '金矿', icon: '🥇', min: 1, max: 1, chance: 20.0 },
      { name: '宝石', icon: '💎', min: 1, max: 1, chance: 3.0 }
    ]
  },
  farm_collect: {
    name: '农场采集',
    icon: '🌾',
    duration: 25,
    skill: '种植',
    experience: 1,
    rewards: [
      { name: '小麦', icon: '🌾', min: 2, max: 4, chance: 85.0 },
      { name: '胡萝卜', icon: '🥕', min: 1, max: 3, chance: 70.0 },
      { name: '土豆', icon: '🥔', min: 1, max: 2, chance: 60.0 },
      { name: '特殊作物', icon: '🌽', min: 1, max: 1, chance: 15.0 }
    ]
  },
  fishing: {
    name: '钓鱼',
    icon: '🎣',
    duration: 45,
    skill: '钓鱼',
    experience: 3,
    rewards: [
      { name: '小鱼', icon: '🐟', min: 1, max: 2, chance: 80.0 },
      { name: '大鱼', icon: '🐠', min: 1, max: 1, chance: 40.0 },
      { name: '稀有鱼', icon: '🐡', min: 1, max: 1, chance: 10.0 },
      { name: '宝箱', icon: '📦', min: 1, max: 1, chance: 2.0 }
    ]
  }
}

// 计算属性
const selectedTaskInfo = computed(() => {
  return taskInfoMap[selectedTaskType.value] || {}
})

const canAddTask = computed(() => {
  return gameStore.queueStatus.queueLength < 20
})

const canExecuteImmediately = computed(() => {
  return !gameStore.currentQueueTask && canAddTask.value
})

const formatRemainingTime = (seconds) => {
  if (!seconds) return '0秒'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  } else {
    return `${secs}秒`
  }
}

const formatTime = (seconds) => {
  if (!seconds) return '0秒'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  let result = []
  if (hours > 0) result.push(`${hours}小时`)
  if (minutes > 0) result.push(`${minutes}分钟`)
  if (secs > 0 || result.length === 0) result.push(`${secs}秒`)
  
  return result.join('')
}

// 方法
const handleLogout = async () => {
  await authStore.logout()
}

const openTaskModal = (taskType) => {
  selectedTaskType.value = taskType
  taskCount.value = 1
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  selectedTaskType.value = ''
  taskCount.value = 1
}

const addTaskCount = (amount) => {
  taskCount.value = Math.min(1000, taskCount.value + amount)
}

const addToQueue = async () => {
  if (!canAddTask.value) return
  
  const result = await gameStore.addTaskToQueue(selectedTaskType.value, taskCount.value)
  if (result.success) {
    closeTaskModal()
  } else {
    console.error('添加任务失败:', result.message)
  }
}

const executeImmediately = async () => {
  if (!canExecuteImmediately.value) return
  
  const result = await gameStore.addTaskToQueue(selectedTaskType.value, taskCount.value)
  if (result.success) {
    await gameStore.startQueueProcessing()
    closeTaskModal()
  } else {
    console.error('添加任务失败:', result.message)
  }
}

// 页面加载时的初始化
onMounted(async () => {
  // 启动性能监控
  startPerformanceMonitoring((data) => {
    performanceData.value = data
  })
  
  // 启用自动保存
  enableAutoSave()
  
  // 预加载资源
  await preloadResources([
    '/images/forest.svg',
    '/images/mine.svg', 
    '/images/farm.svg',
    '/images/fishing.svg'
  ])
  
  // 根据设备性能调整质量
  adjustQuality()
  
  // 获取队列状态
  if (gameStore.connected) {
    gameStore.getQueueStatus()
    gameCache.set('last_queue_status', gameStore.queueStatus, 30000)
  } else {
    const checkConnection = () => {
      if (gameStore.connected) {
        gameStore.getQueueStatus()
        gameCache.set('last_queue_status', gameStore.queueStatus, 30000)
      } else {
        const cachedStatus = gameCache.get('last_queue_status')
        if (cachedStatus) {
          gameStore.queueStatus = cachedStatus
        }
        setTimeout(checkConnection, 100)
      }
    }
    checkConnection()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  stopPerformanceMonitoring()
  disableAutoSave()
})

// 页面标题
useHead({
  title: '采集功能 - 猫猫挂机游戏'
})
</script>