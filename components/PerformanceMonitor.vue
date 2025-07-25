<template>
  <div 
    v-if="visible" 
    class="performance-monitor"
    :class="{
      'performance-monitor-expanded': expanded,
      'performance-monitor-warning': hasWarning,
      'performance-monitor-error': hasError
    }"
  >
    <!-- 切换按钮 -->
    <button 
      @click="toggleExpanded" 
      class="performance-toggle"
      :title="expanded ? '收起性能监控' : '展开性能监控'"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- 简化视图 -->
    <div v-if="!expanded" class="performance-summary">
      <div class="flex items-center space-x-2 text-xs">
        <span :class="fpsClass">{{ Math.round(data.fps) }}fps</span>
        <span :class="latencyClass">{{ data.latency }}ms</span>
        <span :class="memoryClass">{{ formatMemory(data.memory) }}</span>
      </div>
    </div>

    <!-- 详细视图 -->
    <div v-else class="performance-details">
      <!-- 性能指标 -->
      <div class="performance-metrics">
        <div class="metric-group">
          <h4 class="metric-title">渲染性能</h4>
          <div class="metric-item">
            <span class="metric-label">FPS:</span>
            <span :class="fpsClass">{{ Math.round(data.fps) }}</span>
            <div class="metric-bar">
              <div 
                class="metric-bar-fill bg-green-500" 
                :style="{ width: Math.min(data.fps / 60 * 100, 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-label">帧时间:</span>
            <span>{{ (1000 / data.fps).toFixed(1) }}ms</span>
          </div>
        </div>

        <div class="metric-group">
          <h4 class="metric-title">网络性能</h4>
          <div class="metric-item">
            <span class="metric-label">延迟:</span>
            <span :class="latencyClass">{{ data.latency }}ms</span>
            <div class="metric-bar">
              <div 
                class="metric-bar-fill" 
                :class="latencyBarClass"
                :style="{ width: Math.min(data.latency / 200 * 100, 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-label">连接状态:</span>
            <span :class="connectionClass">{{ connectionStatus }}</span>
          </div>
        </div>

        <div class="metric-group">
          <h4 class="metric-title">内存使用</h4>
          <div class="metric-item">
            <span class="metric-label">已用:</span>
            <span :class="memoryClass">{{ formatMemory(data.memory) }}</span>
            <div class="metric-bar">
              <div 
                class="metric-bar-fill" 
                :class="memoryBarClass"
                :style="{ width: Math.min(data.memory / maxMemory * 100, 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-label">缓存:</span>
            <span>{{ formatMemory(cacheSize) }}</span>
          </div>
        </div>
      </div>

      <!-- 性能图表 -->
      <div class="performance-chart">
        <canvas 
          ref="chartCanvas" 
          width="200" 
          height="60"
          class="w-full h-15"
        ></canvas>
      </div>

      <!-- 操作按钮 -->
      <div class="performance-actions">
        <button 
          @click="clearCache" 
          class="action-btn"
          title="清理缓存"
        >
          清理缓存
        </button>
        <button 
          @click="optimizePerformance" 
          class="action-btn"
          title="性能优化"
        >
          优化
        </button>
        <button 
          @click="exportData" 
          class="action-btn"
          title="导出数据"
        >
          导出
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useCache } from '~/utils/cacheManager'

interface PerformanceData {
  fps: number
  latency: number
  memory: number
  timestamp: number
}

interface Props {
  data: PerformanceData
  visible?: boolean
  autoHide?: boolean
  threshold?: {
    fps: number
    latency: number
    memory: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  autoHide: false,
  threshold: () => ({
    fps: 30,
    latency: 100,
    memory: 100 * 1024 * 1024 // 100MB
  })
})

const emit = defineEmits<{
  optimize: []
  clearCache: []
  export: [data: PerformanceData[]]
}>()

const expanded = ref(false)
const chartCanvas = ref<HTMLCanvasElement>()
const performanceHistory = ref<PerformanceData[]>([])
const maxMemory = 200 * 1024 * 1024 // 200MB

const { cache } = useCache('performance')

// 计算缓存大小
const cacheSize = computed(() => {
  const stats = cache.getStats()
  return stats.size * 1024 // 估算
})

// 性能状态计算
const hasWarning = computed(() => {
  return props.data.fps < props.threshold.fps * 1.5 ||
         props.data.latency > props.threshold.latency * 0.8 ||
         props.data.memory > props.threshold.memory * 0.8
})

const hasError = computed(() => {
  return props.data.fps < props.threshold.fps ||
         props.data.latency > props.threshold.latency ||
         props.data.memory > props.threshold.memory
})

// 样式类计算
const fpsClass = computed(() => ({
  'text-green-500': props.data.fps >= 50,
  'text-yellow-500': props.data.fps >= 30 && props.data.fps < 50,
  'text-red-500': props.data.fps < 30
}))

const latencyClass = computed(() => ({
  'text-green-500': props.data.latency <= 50,
  'text-yellow-500': props.data.latency > 50 && props.data.latency <= 100,
  'text-red-500': props.data.latency > 100
}))

const memoryClass = computed(() => ({
  'text-green-500': props.data.memory < maxMemory * 0.6,
  'text-yellow-500': props.data.memory >= maxMemory * 0.6 && props.data.memory < maxMemory * 0.8,
  'text-red-500': props.data.memory >= maxMemory * 0.8
}))

const latencyBarClass = computed(() => ({
  'bg-green-500': props.data.latency <= 50,
  'bg-yellow-500': props.data.latency > 50 && props.data.latency <= 100,
  'bg-red-500': props.data.latency > 100
}))

const memoryBarClass = computed(() => ({
  'bg-green-500': props.data.memory < maxMemory * 0.6,
  'bg-yellow-500': props.data.memory >= maxMemory * 0.6 && props.data.memory < maxMemory * 0.8,
  'bg-red-500': props.data.memory >= maxMemory * 0.8
}))

const connectionClass = computed(() => ({
  'text-green-500': props.data.latency <= 50,
  'text-yellow-500': props.data.latency > 50 && props.data.latency <= 100,
  'text-red-500': props.data.latency > 100
}))

const connectionStatus = computed(() => {
  if (props.data.latency <= 50) return '优秀'
  if (props.data.latency <= 100) return '良好'
  return '较差'
})

// 格式化内存显示
const formatMemory = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// 切换展开状态
const toggleExpanded = () => {
  expanded.value = !expanded.value
  if (expanded.value) {
    nextTick(() => {
      drawChart()
    })
  }
}

// 清理缓存
const clearCache = () => {
  cache.clear()
  emit('clearCache')
}

// 性能优化
const optimizePerformance = () => {
  // 清理旧的性能数据
  if (performanceHistory.value.length > 100) {
    performanceHistory.value = performanceHistory.value.slice(-50)
  }
  
  // 触发垃圾回收（如果可用）
  if (window.gc) {
    window.gc()
  }
  
  emit('optimize')
}

// 导出性能数据
const exportData = () => {
  const data = {
    history: performanceHistory.value,
    summary: {
      avgFps: performanceHistory.value.reduce((sum, item) => sum + item.fps, 0) / performanceHistory.value.length,
      avgLatency: performanceHistory.value.reduce((sum, item) => sum + item.latency, 0) / performanceHistory.value.length,
      maxMemory: Math.max(...performanceHistory.value.map(item => item.memory)),
      timestamp: Date.now()
    }
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  emit('export', performanceHistory.value)
}

// 绘制性能图表
const drawChart = () => {
  if (!chartCanvas.value || performanceHistory.value.length < 2) return
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  const { width, height } = chartCanvas.value
  ctx.clearRect(0, 0, width, height)
  
  // 绘制FPS曲线
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  const dataPoints = performanceHistory.value.slice(-50) // 最近50个数据点
  const stepX = width / (dataPoints.length - 1)
  
  dataPoints.forEach((point, index) => {
    const x = index * stepX
    const y = height - (point.fps / 60 * height)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // 绘制延迟曲线
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 1
  ctx.beginPath()
  
  dataPoints.forEach((point, index) => {
    const x = index * stepX
    const y = height - (Math.min(point.latency, 200) / 200 * height)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
}

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    performanceHistory.value.push({ ...newData })
    
    // 限制历史数据长度
    if (performanceHistory.value.length > 200) {
      performanceHistory.value = performanceHistory.value.slice(-100)
    }
    
    if (expanded.value) {
      nextTick(() => {
        drawChart()
      })
    }
  },
  { deep: true }
)

// 自动隐藏逻辑
watch(
  [hasWarning, hasError],
  ([warning, error]) => {
    if (props.autoHide && !warning && !error) {
      setTimeout(() => {
        if (!hasWarning.value && !hasError.value) {
          expanded.value = false
        }
      }, 5000)
    }
  }
)

onMounted(() => {
  // 初始化图表
  if (expanded.value) {
    nextTick(() => {
      drawChart()
    })
  }
})
</script>

<style scoped>
.performance-monitor {
  @apply fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border;
  @apply transition-all duration-300 ease-in-out;
  min-width: 120px;
}

.performance-monitor-expanded {
  @apply w-80;
}

.performance-monitor-warning {
  @apply border-yellow-400 bg-yellow-50;
}

.performance-monitor-error {
  @apply border-red-400 bg-red-50;
}

.performance-toggle {
  @apply absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600;
  @apply transition-colors duration-200;
}

.performance-summary {
  @apply p-3;
}

.performance-details {
  @apply p-4 space-y-4;
}

.performance-metrics {
  @apply space-y-3;
}

.metric-group {
  @apply space-y-2;
}

.metric-title {
  @apply text-xs font-semibold text-gray-700 uppercase tracking-wide;
}

.metric-item {
  @apply flex items-center justify-between text-sm;
}

.metric-label {
  @apply text-gray-600;
}

.metric-bar {
  @apply flex-1 mx-2 h-1 bg-gray-200 rounded-full overflow-hidden;
}

.metric-bar-fill {
  @apply h-full transition-all duration-300;
}

.performance-chart {
  @apply border rounded p-2 bg-gray-50;
}

.performance-actions {
  @apply flex space-x-2;
}

.action-btn {
  @apply flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200;
  @apply rounded transition-colors duration-200;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .performance-monitor {
    @apply top-2 right-2;
  }
  
  .performance-monitor-expanded {
    @apply w-72;
  }
}
</style>