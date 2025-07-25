<template>
  <div 
    ref="containerRef" 
    class="lazy-image-container"
    :class="{
      'lazy-image-loading': isLoading,
      'lazy-image-error': hasError,
      'lazy-image-loaded': isLoaded
    }"
    :style="containerStyle"
  >
    <!-- 占位符 -->
    <div 
      v-if="!isLoaded && !hasError" 
      class="lazy-image-placeholder"
      :style="placeholderStyle"
    >
      <slot name="placeholder">
        <div class="lazy-image-skeleton">
          <div class="animate-pulse bg-gray-200 w-full h-full rounded"></div>
        </div>
      </slot>
    </div>
    
    <!-- 错误状态 -->
    <div 
      v-if="hasError" 
      class="lazy-image-error-content"
      :style="placeholderStyle"
    >
      <slot name="error">
        <div class="flex flex-col items-center justify-center h-full text-gray-400">
          <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm">图片加载失败</span>
          <button 
            v-if="allowRetry" 
            @click="retry" 
            class="mt-2 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            重试
          </button>
        </div>
      </slot>
    </div>
    
    <!-- 实际图片 -->
    <img
      v-show="isLoaded"
      ref="imageRef"
      :src="actualSrc"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    />
    
    <!-- 加载进度条 -->
    <div 
      v-if="showProgress && isLoading && loadProgress > 0"
      class="lazy-image-progress"
    >
      <div 
        class="lazy-image-progress-bar"
        :style="{ width: loadProgress + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  // 图片源地址
  src: string
  // 替代文本
  alt?: string
  // 占位符图片
  placeholder?: string
  // 图片类名
  imageClass?: string
  // 容器宽度
  width?: string | number
  // 容器高度
  height?: string | number
  // 对象适应方式
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  // 是否立即加载
  immediate?: boolean
  // 根边距
  rootMargin?: string
  // 交叉阈值
  threshold?: number
  // 是否允许重试
  allowRetry?: boolean
  // 最大重试次数
  maxRetries?: number
  // 是否显示加载进度
  showProgress?: boolean
  // 淡入动画持续时间（毫秒）
  fadeInDuration?: number
  // 图片质量（用于响应式图片）
  quality?: number
  // 响应式尺寸
  sizes?: string
  // 源集合（用于响应式图片）
  srcset?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  imageClass: '',
  objectFit: 'cover',
  immediate: false,
  rootMargin: '50px',
  threshold: 0.1,
  allowRetry: true,
  maxRetries: 3,
  showProgress: false,
  fadeInDuration: 300,
  quality: 80
})

const emit = defineEmits<{
  load: [event: Event]
  error: [error: Event]
  intersect: [isIntersecting: boolean]
}>()

const containerRef = ref<HTMLElement>()
const imageRef = ref<HTMLImageElement>()
const isLoading = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)
const retryCount = ref(0)
const loadProgress = ref(0)
const actualSrc = ref('')

// 容器样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {
    position: 'relative',
    overflow: 'hidden'
  }
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return style
})

// 占位符样式
const placeholderStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

// 图片样式
const imageStyle = computed(() => {
  const style: Record<string, string> = {
    width: '100%',
    height: '100%',
    objectFit: props.objectFit
  }
  
  if (isLoaded.value) {
    style.transition = `opacity ${props.fadeInDuration}ms ease-in-out`
    style.opacity = '1'
  } else {
    style.opacity = '0'
  }
  
  return style
})

// 交叉观察器
const { stop } = useIntersectionObserver(
  containerRef,
  ([{ isIntersecting }]) => {
    emit('intersect', isIntersecting)
    if (isIntersecting && !isLoaded.value && !isLoading.value && !hasError.value) {
      loadImage()
    }
  },
  {
    rootMargin: props.rootMargin,
    threshold: props.threshold
  }
)

// 加载图片
const loadImage = () => {
  if (isLoading.value || isLoaded.value) return
  
  isLoading.value = true
  hasError.value = false
  loadProgress.value = 0
  
  // 构建图片URL（支持质量参数）
  let imageUrl = props.src
  if (props.quality && props.quality < 100) {
    const separator = imageUrl.includes('?') ? '&' : '?'
    imageUrl += `${separator}quality=${props.quality}`
  }
  
  actualSrc.value = imageUrl
  
  // 模拟加载进度（实际项目中可以使用真实的进度API）
  if (props.showProgress) {
    const progressInterval = setInterval(() => {
      loadProgress.value += Math.random() * 20
      if (loadProgress.value >= 90) {
        clearInterval(progressInterval)
      }
    }, 100)
  }
}

// 处理图片加载成功
const handleLoad = (event: Event) => {
  isLoading.value = false
  isLoaded.value = true
  loadProgress.value = 100
  retryCount.value = 0
  emit('load', event)
  stop() // 停止观察
}

// 处理图片加载失败
const handleError = (event: Event) => {
  isLoading.value = false
  hasError.value = true
  loadProgress.value = 0
  emit('error', event)
}

// 重试加载
const retry = () => {
  if (retryCount.value < props.maxRetries) {
    retryCount.value++
    hasError.value = false
    loadImage()
  }
}

// 预加载图片（用于缓存）
const preload = () => {
  const img = new Image()
  img.src = props.src
  return new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })
}

// 监听src变化
watch(
  () => props.src,
  () => {
    if (props.src) {
      isLoaded.value = false
      hasError.value = false
      actualSrc.value = ''
      
      if (props.immediate) {
        loadImage()
      }
    }
  },
  { immediate: true }
)

// 立即加载
if (props.immediate) {
  onMounted(() => {
    loadImage()
  })
}

// 暴露方法
defineExpose({
  retry,
  preload,
  loadImage
})

onUnmounted(() => {
  stop()
})
</script>

<style scoped>
.lazy-image-container {
  @apply relative overflow-hidden;
}

.lazy-image-skeleton {
  @apply w-full h-full;
}

.lazy-image-progress {
  @apply absolute bottom-0 left-0 right-0 h-1 bg-gray-200;
}

.lazy-image-progress-bar {
  @apply h-full bg-blue-500 transition-all duration-300;
}

.lazy-image-loading {
  @apply bg-gray-100;
}

.lazy-image-error {
  @apply bg-gray-50;
}

.lazy-image-loaded {
  @apply bg-transparent;
}

/* 淡入动画 */
.lazy-image-container img {
  transition: opacity 0.3s ease-in-out;
}

/* 响应式图片 */
@media (max-width: 640px) {
  .lazy-image-container {
    @apply rounded-lg;
  }
}

@media (max-width: 480px) {
  .lazy-image-container {
    @apply rounded-md;
  }
}
</style>