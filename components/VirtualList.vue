<template>
  <div 
    ref="containerRef" 
    class="virtual-list-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <!-- 虚拟滚动区域 -->
    <div 
      class="virtual-list-phantom" 
      :style="{ height: totalHeight + 'px' }"
    ></div>
    
    <!-- 可见项目容器 -->
    <div 
      class="virtual-list-content"
      :style="{
        transform: `translateY(${offsetY}px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
      }"
    >
      <div
        v-for="item in visibleItems"
        :key="getItemKey(item)"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item" :index="item.index">
          {{ item }}
        </slot>
      </div>
    </div>
    
    <!-- 加载更多指示器 -->
    <div 
      v-if="hasMore && isNearBottom"
      class="virtual-list-loading"
      :style="{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)'
      }"
    >
      <slot name="loading">
        <div class="flex items-center space-x-2 text-gray-500">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>加载中...</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useThrottleFn, useResizeObserver } from '@vueuse/core'

interface Props {
  // 数据列表
  items: any[]
  // 每项高度
  itemHeight: number
  // 容器高度
  containerHeight?: number
  // 缓冲区大小（额外渲染的项目数）
  bufferSize?: number
  // 获取项目唯一键的函数
  keyField?: string | ((item: any) => string | number)
  // 是否有更多数据
  hasMore?: boolean
  // 触发加载更多的距离
  loadMoreThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  containerHeight: 400,
  bufferSize: 5,
  keyField: 'id',
  hasMore: false,
  loadMoreThreshold: 100
})

const emit = defineEmits<{
  loadMore: []
  scroll: [scrollTop: number]
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const actualContainerHeight = ref(props.containerHeight)

// 计算总高度
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 计算可见区域的起始和结束索引
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const visibleCount = Math.ceil(actualContainerHeight.value / props.itemHeight)
  
  // 添加缓冲区
  const startIndex = Math.max(0, start - props.bufferSize)
  const endIndex = Math.min(
    props.items.length - 1,
    start + visibleCount + props.bufferSize
  )
  
  return { startIndex, endIndex }
})

// 可见项目
const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value
  return props.items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    index: startIndex + index
  }))
})

// 偏移量
const offsetY = computed(() => {
  return visibleRange.value.startIndex * props.itemHeight
})

// 是否接近底部
const isNearBottom = computed(() => {
  const bottom = scrollTop.value + actualContainerHeight.value
  return totalHeight.value - bottom <= props.loadMoreThreshold
})

// 获取项目键值
const getItemKey = (item: any): string | number => {
  if (typeof props.keyField === 'function') {
    return props.keyField(item)
  }
  return item[props.keyField] || item.index
}

// 节流的滚动处理
const handleScroll = useThrottleFn((event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  emit('scroll', target.scrollTop)
  
  // 检查是否需要加载更多
  if (props.hasMore && isNearBottom.value) {
    emit('loadMore')
  }
}, 16) // 约60fps

// 监听容器大小变化
useResizeObserver(containerRef, (entries) => {
  const entry = entries[0]
  if (entry) {
    actualContainerHeight.value = entry.contentRect.height
  }
})

// 滚动到指定项目
const scrollToItem = (index: number, behavior: ScrollBehavior = 'smooth') => {
  if (!containerRef.value) return
  
  const targetScrollTop = index * props.itemHeight
  containerRef.value.scrollTo({
    top: targetScrollTop,
    behavior
  })
}

// 滚动到顶部
const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  scrollToItem(0, behavior)
}

// 滚动到底部
const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
  if (!containerRef.value) return
  
  containerRef.value.scrollTo({
    top: totalHeight.value,
    behavior
  })
}

// 获取当前可见的第一个项目索引
const getFirstVisibleIndex = () => {
  return visibleRange.value.startIndex
}

// 获取当前可见的最后一个项目索引
const getLastVisibleIndex = () => {
  return visibleRange.value.endIndex
}

// 监听数据变化，保持滚动位置
watch(
  () => props.items.length,
  (newLength, oldLength) => {
    // 如果数据增加且用户在底部附近，自动滚动到底部
    if (newLength > oldLength && isNearBottom.value) {
      nextTick(() => {
        scrollToBottom('smooth')
      })
    }
  }
)

// 暴露方法给父组件
defineExpose({
  scrollToItem,
  scrollToTop,
  scrollToBottom,
  getFirstVisibleIndex,
  getLastVisibleIndex,
  containerRef
})

onMounted(() => {
  // 初始化容器高度
  if (containerRef.value) {
    actualContainerHeight.value = containerRef.value.clientHeight
  }
})
</script>

<style scoped>
.virtual-list-container {
  @apply relative overflow-auto;
  /* 启用硬件加速 */
  transform: translateZ(0);
  will-change: scroll-position;
}

.virtual-list-phantom {
  @apply absolute top-0 left-0 right-0;
  z-index: -1;
}

.virtual-list-content {
  @apply w-full;
  /* 启用硬件加速 */
  will-change: transform;
}

.virtual-list-item {
  @apply w-full;
  /* 防止项目重叠 */
  box-sizing: border-box;
}

.virtual-list-loading {
  @apply z-10;
}

/* 自定义滚动条样式 */
.virtual-list-container::-webkit-scrollbar {
  @apply w-2;
}

.virtual-list-container::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}
</style>