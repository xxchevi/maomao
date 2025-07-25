<template>
  <div ref="containerRef" class="lazy-component">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="lazy-loading">
      <div class="animate-pulse">
        <slot name="loading">
          <div class="bg-gray-200 rounded-md h-32 w-full"></div>
        </slot>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="hasError" class="lazy-error">
      <slot name="error">
        <div class="text-center py-8 text-gray-500">
          <p>加载失败</p>
          <button @click="retry" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            重试
          </button>
        </div>
      </slot>
    </div>
    
    <!-- 实际内容 -->
    <div v-else-if="isVisible" class="lazy-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  // 是否立即加载（不等待进入视口）
  immediate?: boolean
  // 根边距（提前多少像素开始加载）
  rootMargin?: string
  // 交叉比例阈值
  threshold?: number
  // 延迟加载时间（毫秒）
  delay?: number
  // 最大重试次数
  maxRetries?: number
}

const props = withDefaults(defineProps<Props>(), {
  immediate: false,
  rootMargin: '50px',
  threshold: 0.1,
  delay: 0,
  maxRetries: 3
})

const emit = defineEmits<{
  load: []
  error: [error: Error]
  visible: []
}>()

const containerRef = ref<HTMLElement>()
const isLoading = ref(false)
const hasError = ref(false)
const isVisible = ref(false)
const retryCount = ref(0)

// 交叉观察器
const { stop } = useIntersectionObserver(
  containerRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !isVisible.value && !isLoading.value) {
      loadContent()
    }
  },
  {
    rootMargin: props.rootMargin,
    threshold: props.threshold
  }
)

// 加载内容
const loadContent = async () => {
  if (isLoading.value || isVisible.value) return
  
  isLoading.value = true
  hasError.value = false
  
  try {
    // 如果有延迟，等待指定时间
    if (props.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, props.delay))
    }
    
    // 等待下一个tick确保DOM更新
    await nextTick()
    
    isVisible.value = true
    emit('load')
    emit('visible')
    
    // 停止观察
    stop()
  } catch (error) {
    hasError.value = true
    emit('error', error as Error)
  } finally {
    isLoading.value = false
  }
}

// 重试加载
const retry = () => {
  if (retryCount.value < props.maxRetries) {
    retryCount.value++
    hasError.value = false
    loadContent()
  }
}

// 立即加载
if (props.immediate) {
  onMounted(() => {
    loadContent()
  })
}

onUnmounted(() => {
  stop()
})
</script>

<style scoped>
.lazy-component {
  min-height: 1px;
}

.lazy-loading {
  @apply w-full;
}

.lazy-error {
  @apply w-full;
}

.lazy-content {
  @apply w-full;
}

/* 淡入动画 */
.lazy-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>