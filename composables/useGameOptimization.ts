import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useLocalStorage, useThrottleFn, useDebounce, useRafFn, useIntervalFn } from '@vueuse/core'
import { useGameStore } from '~/stores/game'

// 性能监控接口
interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  renderTime: number
  socketLatency: number
  lastUpdate: number
}

// 游戏优化配置
interface GameOptimizationConfig {
  autoSave: boolean
  autoSaveInterval: number
  performanceMonitoring: boolean
  adaptiveQuality: boolean
  preloadAssets: boolean
  cacheStrategy: 'aggressive' | 'normal' | 'minimal'
}

export const useGameOptimization = () => {
  const gameStore = useGameStore()
  
  // 性能指标
  const performanceMetrics = ref<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    socketLatency: 0,
    lastUpdate: Date.now()
  })
  
  // 优化配置
  const config = useLocalStorage<GameOptimizationConfig>('game-optimization-config', {
    autoSave: true,
    autoSaveInterval: 30000, // 30秒
    performanceMonitoring: true,
    adaptiveQuality: true,
    preloadAssets: true,
    cacheStrategy: 'normal'
  })
  
  // 自动保存状态
  const lastSaveTime = ref(Date.now())
  const saveInProgress = ref(false)
  
  // FPS 监控
  let frameCount = 0
  let lastFrameTime = performance.now()
  
  const { pause: pauseFpsMonitor, resume: resumeFpsMonitor } = useRafFn(() => {
    frameCount++
    const now = performance.now()
    
    if (now - lastFrameTime >= 1000) {
      performanceMetrics.value.fps = Math.round((frameCount * 1000) / (now - lastFrameTime))
      frameCount = 0
      lastFrameTime = now
    }
  }, { immediate: false })
  
  // 内存使用监控
  const updateMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      performanceMetrics.value.memoryUsage = Math.round(
        (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      )
    }
  }
  
  // Socket延迟监控
  const measureSocketLatency = () => {
    if (gameStore.socket && gameStore.connected) {
      const startTime = performance.now()
      gameStore.socket.emit('ping', startTime)
      
      gameStore.socket.once('pong', (timestamp: number) => {
        performanceMetrics.value.socketLatency = performance.now() - timestamp
      })
    }
  }
  
  // 节流的性能更新函数
  const throttledPerformanceUpdate = useThrottleFn(() => {
    updateMemoryUsage()
    measureSocketLatency()
    performanceMetrics.value.lastUpdate = Date.now()
  }, 1000)
  
  // 自动保存游戏状态
  const autoSaveGameState = useThrottleFn(async () => {
    if (!config.value.autoSave || saveInProgress.value) return
    
    saveInProgress.value = true
    try {
      // 保存到本地存储
      const gameState = {
        inventory: gameStore.inventory,
        experience: gameStore.experience,
        level: gameStore.level,
        skills: gameStore.skills,
        queueStatus: gameStore.queueStatus,
        timestamp: Date.now()
      }
      
      localStorage.setItem('game-auto-save', JSON.stringify(gameState))
      lastSaveTime.value = Date.now()
      
      console.log('游戏状态自动保存成功')
    } catch (error) {
      console.error('自动保存失败:', error)
    } finally {
      saveInProgress.value = false
    }
  }, 5000) // 最多5秒保存一次
  
  // 恢复游戏状态
  const restoreGameState = () => {
    try {
      const savedState = localStorage.getItem('game-auto-save')
      if (savedState) {
        const gameState = JSON.parse(savedState)
        
        // 检查保存时间，如果超过24小时则不恢复
        const saveAge = Date.now() - gameState.timestamp
        if (saveAge < 24 * 60 * 60 * 1000) {
          // 恢复状态（谨慎恢复，避免覆盖服务器数据）
          console.log('发现本地保存的游戏状态，时间:', new Date(gameState.timestamp))
          return gameState
        }
      }
    } catch (error) {
      console.error('恢复游戏状态失败:', error)
    }
    return null
  }
  
  // 自适应质量调整
  const adaptiveQualityAdjustment = () => {
    if (!config.value.adaptiveQuality) return
    
    const fps = performanceMetrics.value.fps
    const memoryUsage = performanceMetrics.value.memoryUsage
    
    // 根据性能指标调整游戏质量
    if (fps < 30 || memoryUsage > 80) {
      // 降低质量
      document.documentElement.style.setProperty('--animation-duration', '0.1s')
      console.log('性能较低，已降低动画质量')
    } else if (fps > 55 && memoryUsage < 50) {
      // 提高质量
      document.documentElement.style.setProperty('--animation-duration', '0.3s')
    }
  }
  
  // 预加载资源
  const preloadAssets = async () => {
    if (!config.value.preloadAssets) return
    
    const assetsToPreload = [
      // 预加载关键图片和资源
      '/icons/forest.png',
      '/icons/mine.png',
      '/icons/farm.png',
      '/icons/fishing.png'
    ]
    
    const preloadPromises = assetsToPreload.map(asset => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = asset
      })
    })
    
    try {
      await Promise.allSettled(preloadPromises)
      console.log('资源预加载完成')
    } catch (error) {
      console.warn('部分资源预加载失败:', error)
    }
  }
  
  // 缓存管理
  const cacheManager = {
    set(key: string, data: any, ttl: number = 300000) { // 默认5分钟
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData))
    },
    
    get(key: string) {
      try {
        const cached = localStorage.getItem(`cache_${key}`)
        if (cached) {
          const cacheData = JSON.parse(cached)
          const age = Date.now() - cacheData.timestamp
          
          if (age < cacheData.ttl) {
            return cacheData.data
          } else {
            localStorage.removeItem(`cache_${key}`)
          }
        }
      } catch (error) {
        console.error('缓存读取失败:', error)
      }
      return null
    },
    
    clear() {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }
  
  // 性能监控间隔
  const { pause: pauseMonitoring, resume: resumeMonitoring } = useIntervalFn(() => {
    if (config.value.performanceMonitoring) {
      throttledPerformanceUpdate()
      adaptiveQualityAdjustment()
    }
  }, 2000)
  
  // 自动保存间隔
  const { pause: pauseAutoSave, resume: resumeAutoSave } = useIntervalFn(() => {
    autoSaveGameState()
  }, config.value.autoSaveInterval)
  
  // 监听游戏状态变化触发自动保存
  watch(
    () => [gameStore.inventory, gameStore.experience, gameStore.level, gameStore.skills],
    () => {
      if (config.value.autoSave) {
        autoSaveGameState()
      }
    },
    { deep: true }
  )
  
  // 计算属性
  const performanceScore = computed(() => {
    const fps = performanceMetrics.value.fps
    const memory = performanceMetrics.value.memoryUsage
    const latency = performanceMetrics.value.socketLatency
    
    let score = 100
    
    // FPS评分
    if (fps < 30) score -= 30
    else if (fps < 45) score -= 15
    else if (fps < 55) score -= 5
    
    // 内存评分
    if (memory > 80) score -= 25
    else if (memory > 60) score -= 10
    else if (memory > 40) score -= 5
    
    // 延迟评分
    if (latency > 200) score -= 20
    else if (latency > 100) score -= 10
    else if (latency > 50) score -= 5
    
    return Math.max(0, score)
  })
  
  const performanceStatus = computed(() => {
    const score = performanceScore.value
    if (score >= 80) return { status: 'excellent', color: 'green' }
    if (score >= 60) return { status: 'good', color: 'blue' }
    if (score >= 40) return { status: 'fair', color: 'yellow' }
    return { status: 'poor', color: 'red' }
  })
  
  // 生命周期
  onMounted(() => {
    if (config.value.performanceMonitoring) {
      resumeFpsMonitor()
      resumeMonitoring()
    }
    
    if (config.value.autoSave) {
      resumeAutoSave()
    }
    
    preloadAssets()
  })
  
  onUnmounted(() => {
    pauseFpsMonitor()
    pauseMonitoring()
    pauseAutoSave()
  })
  
  // 性能监控控制函数
  const startPerformanceMonitoring = (callback?: (data: PerformanceMetrics) => void) => {
    if (config.value.performanceMonitoring) {
      resumeFpsMonitor()
      resumeMonitoring()
      
      if (callback) {
        // 设置回调函数来更新外部状态
        const updateCallback = () => {
          callback(performanceMetrics.value)
        }
        
        // 立即调用一次
        updateCallback()
        
        // 定期更新
        const intervalId = setInterval(updateCallback, 1000)
        
        // 返回清理函数
        return () => clearInterval(intervalId)
      }
    }
  }
  
  const stopPerformanceMonitoring = () => {
    pauseFpsMonitor()
    pauseMonitoring()
  }
  
  const enableAutoSave = () => {
    config.value.autoSave = true
    resumeAutoSave()
  }
  
  const disableAutoSave = () => {
    config.value.autoSave = false
    pauseAutoSave()
  }
  
  const preloadResources = async (resources: string[]) => {
    const preloadPromises = resources.map(resource => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = resource
      })
    })
    
    try {
      await Promise.allSettled(preloadPromises)
      console.log('资源预加载完成')
    } catch (error) {
      console.warn('部分资源预加载失败:', error)
    }
  }
  
  const adjustQuality = () => {
    adaptiveQualityAdjustment()
  }

  return {
    // 状态
    performanceMetrics: readonly(performanceMetrics),
    config,
    lastSaveTime: readonly(lastSaveTime),
    saveInProgress: readonly(saveInProgress),
    
    // 计算属性
    performanceScore,
    performanceStatus,
    
    // 方法
    autoSaveGameState,
    restoreGameState,
    cacheManager,
    
    // 控制方法
    pauseMonitoring,
    resumeMonitoring,
    pauseAutoSave,
    resumeAutoSave,
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    enableAutoSave,
    disableAutoSave,
    preloadResources,
    adjustQuality
  }
}

// 全局性能优化工具
export const usePerformanceOptimizer = () => {
  // 图片懒加载
  const lazyLoadImage = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = reject
      img.src = src
    })
  }
  
  // 防抖搜索
  const debouncedSearch = useDebounce(ref(''), 300)
  
  // 虚拟滚动辅助
  const createVirtualList = (items: any[], itemHeight: number, containerHeight: number) => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = ref(0)
    
    const visibleItems = computed(() => {
      const start = startIndex.value
      const end = Math.min(start + visibleCount + 2, items.length)
      return items.slice(start, end).map((item, index) => ({
        ...item,
        index: start + index
      }))
    })
    
    const totalHeight = computed(() => items.length * itemHeight)
    
    const updateScrollPosition = (scrollTop: number) => {
      startIndex.value = Math.floor(scrollTop / itemHeight)
    }
    
    return {
      visibleItems,
      totalHeight,
      updateScrollPosition,
      startIndex: readonly(startIndex)
    }
  }
  
  return {
    lazyLoadImage,
    debouncedSearch,
    createVirtualList
  }
}