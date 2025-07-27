<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
      <!-- 关闭按钮 -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">{{ resource?.name || '活动选择' }}</h3>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      
      <!-- 资源信息 -->
      <div v-if="resource" class="mb-6">
        <div class="text-sm text-gray-600 mb-2">
          耗时: <span class="font-semibold text-blue-600">{{ resource.baseTime }}秒(基础24秒)</span>
        </div>
        
        <div class="text-sm text-gray-600 mb-4">
          获得:
          <div class="ml-4 space-y-1">
            <div class="flex items-center">
              <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              来源: 1 ~ 2 (81.6%)
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              毒菇: 1 ~ 2 (81.6%)
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              草药: 1 ~ 2 (81.6%)
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              竹子: 1 ~ 2 (81.6%)
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              采集成就: 1 (1.02%)
            </div>
          </div>
        </div>
        
        <div class="text-sm text-gray-600 mb-4">
          提升: <span class="text-yellow-600">🏆 种植: 1 经验</span>
        </div>
      </div>
      
      <!-- 执行次数输入 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">执行次数</label>
        <div class="flex items-center space-x-2">
          <input 
            v-model.number="repeatCount" 
            type="number" 
            min="1" 
            max="999" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <span class="text-sm text-gray-500">次</span>
        </div>
      </div>
      
      <!-- 快速操作按钮 -->
      <div class="mb-6">
        <div class="text-sm text-gray-600 mb-2">快速操作:</div>
        <div class="grid grid-cols-4 gap-2">
          <button @click="repeatCount = 10" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">+10</button>
          <button @click="repeatCount = 100" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">+100</button>
          <button @click="repeatCount = 1000" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">+1000</button>
          <button @click="addTime('30m')" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">+30分钟</button>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-2">
          <button @click="addTime('1h')" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">+1小时</button>
          <button @click="addTime('1h')" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">+1小时</button>
        </div>
      </div>
      
      <!-- 预计耗时 -->
      <div class="mb-6 text-center">
        <div class="text-sm text-gray-600">
          预计耗时: <span class="font-semibold text-blue-600">{{ estimatedTime }}秒</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex space-x-3">
        <button 
          @click="addToQueue" 
          class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
        >
          📋 加入队列
        </button>
        <button 
          @click="startImmediately" 
          class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
        >
          ⚡ 立即开始
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  activityType: {
    type: String,
    default: ''
  },
  resource: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'addToQueue', 'startImmediately'])

const repeatCount = ref(1)

const estimatedTime = computed(() => {
  if (!props.resource) return 0
  return props.resource.baseTime * repeatCount.value
})

const closeModal = () => {
  emit('close')
}

const addTime = (timeStr) => {
  if (!props.resource) return
  
  const baseTime = props.resource.baseTime
  let additionalCount = 0
  
  if (timeStr === '30m') {
    additionalCount = Math.floor((30 * 60) / baseTime)
  } else if (timeStr === '1h') {
    additionalCount = Math.floor((60 * 60) / baseTime)
  }
  
  repeatCount.value += additionalCount
}

const addToQueue = () => {
  emit('addToQueue', {
    activityType: props.activityType,
    resourceId: props.resource?.id,
    repeatCount: repeatCount.value
  })
  closeModal()
}

const startImmediately = () => {
  emit('startImmediately', {
    activityType: props.activityType,
    resourceId: props.resource?.id,
    repeatCount: repeatCount.value
  })
  closeModal()
}

// 重置表单当弹窗打开时
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    repeatCount.value = 1
  }
})
</script>