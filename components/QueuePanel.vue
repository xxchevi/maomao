<template>
  <div class="game-card">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <span class="mr-2">📋</span>
      操作队列
    </h3>
    
    <!-- 当前执行的队列 -->
    <div v-if="gameStore.currentQueue" class="mb-6">
      <h4 class="text-md font-medium mb-3 text-blue-600">当前执行</h4>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold">{{ getActivityName(gameStore.currentQueue.activityType) }} - {{ gameStore.currentQueue.resourceName }}</span>
          <span class="text-sm text-gray-600">{{ gameStore.currentQueue.currentRepeat }}/{{ gameStore.currentQueue.totalRepeat }}</span>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span>单次进度:</span>
            <span class="font-semibold">{{ Math.floor(gameStore.currentQueue.progress) }}%</span>
          </div>
          
          <!-- 流畅的进度条 -->
          <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-100 ease-linear"
              :style="{ width: gameStore.currentQueue.progress + '%' }"
            >
              <!-- 进度条光效 -->
              <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          <div class="flex justify-between items-center text-xs text-gray-500">
            <span>剩余时间: {{ formatTime(gameStore.currentQueue.remainingTime) }}</span>
            <span>总进度: {{ Math.floor(((gameStore.currentQueue.currentRepeat - 1 + gameStore.currentQueue.progress / 100) / gameStore.currentQueue.totalRepeat) * 100) }}%</span>
          </div>
        </div>
        
        <button @click="stopCurrentQueue" class="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm">
          停止队列
        </button>
      </div>
    </div>
    
    <!-- 待开始队列 -->
    <div v-if="gameStore.pendingQueues.length > 0">
      <h4 class="text-md font-medium mb-3 text-orange-600">待开始队列 ({{ gameStore.pendingQueues.length }}/20)</h4>
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div 
          v-for="(queue, index) in gameStore.pendingQueues" 
          :key="queue.id"
          class="bg-orange-50 border border-orange-200 rounded-lg p-3 flex justify-between items-center"
        >
          <div class="flex-1">
            <div class="font-medium text-sm">{{ getActivityName(queue.activityType) }} - {{ queue.resourceName }}</div>
            <div class="text-xs text-gray-600">执行 {{ queue.totalRepeat }} 次 | 预计 {{ formatTime(queue.estimatedTime) }}</div>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">#{{ index + 1 }}</span>
            <button 
              @click="removeFromQueue(queue.id)" 
              class="text-red-500 hover:text-red-700 text-sm"
              title="移除队列"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!gameStore.currentQueue && gameStore.pendingQueues.length === 0" class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">📋</div>
      <div class="text-sm">暂无队列任务</div>
      <div class="text-xs mt-1">点击资源区域开始活动</div>
    </div>
  </div>
</template>

<script setup>
const gameStore = useGameStore()

const getActivityName = (type) => {
  const names = {
    mining: '挖矿',
    gathering: '采集',
    fishing: '钓鱼',
    cooking: '烹饪',
    crafting: '制作'
  }
  return names[type] || type
}

const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}

const stopCurrentQueue = () => {
  gameStore.stopCurrentQueue()
}

const removeFromQueue = (queueId) => {
  gameStore.removeFromQueue(queueId)
}
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>