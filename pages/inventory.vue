<template>
  <div class="space-y-6">
    <div class="game-card">
      <h1 class="text-2xl font-bold mb-6 flex items-center">
        <span class="mr-2">🎒</span>
        仓库管理
      </h1>
      
      <!-- 物品分类筛选 -->
      <div class="mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            @click="selectedType = 'all'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedType === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            全部
          </button>
          <button
            v-for="type in itemTypes"
            :key="type.value"
            @click="selectedType = type.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedType === type.value 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
      
      <!-- 仓库统计 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ filteredInventory.length }}</div>
          <div class="text-sm text-blue-600">物品种类</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ totalItems }}</div>
          <div class="text-sm text-green-600">物品总数</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600">{{ totalValue }}</div>
          <div class="text-sm text-yellow-600">总价值</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">{{ rareItems }}</div>
          <div class="text-sm text-purple-600">稀有物品</div>
        </div>
      </div>
      
      <!-- 物品网格 -->
      <div v-if="filteredInventory.length > 0" class="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        <div
          v-for="inventoryItem in filteredInventory"
          :key="inventoryItem.id"
          :class="[
            'inventory-slot relative group cursor-pointer',
            `rarity-${inventoryItem.item.rarity}`
          ]"
          @click="selectedItem = inventoryItem"
        >
          <!-- 物品图标 -->
          <div class="text-2xl">
            {{ getItemIcon(inventoryItem.item.type) }}
          </div>
          
          <!-- 数量标识 -->
          <div 
            v-if="inventoryItem.quantity > 1"
            class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ inventoryItem.quantity > 99 ? '99+' : inventoryItem.quantity }}
          </div>
          
          <!-- 稀有度标识 -->
          <div 
            v-if="inventoryItem.item.rarity !== 'common'"
            class="absolute -bottom-1 -left-1 w-3 h-3 rounded-full"
            :class="{
              'bg-green-400': inventoryItem.item.rarity === 'uncommon',
              'bg-blue-400': inventoryItem.item.rarity === 'rare',
              'bg-purple-400': inventoryItem.item.rarity === 'epic',
              'bg-yellow-400': inventoryItem.item.rarity === 'legendary'
            }"
          ></div>
          
          <!-- 悬停提示 -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {{ inventoryItem.item.name }}
          </div>
        </div>
      </div>
      
      <!-- 空仓库提示 -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">📦</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">仓库空空如也</h3>
        <p class="text-gray-500 mb-4">去游戏中采集一些物品吧！</p>
        <NuxtLink to="/game" class="btn-primary">
          开始采集
        </NuxtLink>
      </div>
    </div>
    
    <!-- 物品详情模态框 -->
    <div 
      v-if="selectedItem"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="selectedItem = null"
    >
      <div 
        class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold">物品详情</h3>
          <button 
            @click="selectedItem = null"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div :class="['inventory-slot', `rarity-${selectedItem.item.rarity}`]">
              <div class="text-3xl">
                {{ getItemIcon(selectedItem.item.type) }}
              </div>
            </div>
            
            <div class="flex-1">
              <h4 class="text-lg font-semibold">{{ selectedItem.item.name }}</h4>
              <p class="text-sm text-gray-600 capitalize">{{ getRarityName(selectedItem.item.rarity) }}</p>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">类型:</span>
              <span class="font-medium">{{ getTypeName(selectedItem.item.type) }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">数量:</span>
              <span class="font-medium">{{ selectedItem.quantity }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">单价:</span>
              <span class="font-medium text-yellow-600">{{ selectedItem.item.value }} 金币</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">总价值:</span>
              <span class="font-medium text-yellow-600">{{ selectedItem.item.value * selectedItem.quantity }} 金币</span>
            </div>
          </div>
          
          <div v-if="selectedItem.item.description" class="pt-4 border-t">
            <p class="text-sm text-gray-600">{{ selectedItem.item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const gameStore = useGameStore()

// 检查认证状态
if (!authStore.isLoggedIn) {
  await navigateTo('/login')
}

const selectedType = ref('all')
const selectedItem = ref(null)

const itemTypes = [
  { value: 'resource', label: '资源' },
  { value: 'tool', label: '工具' },
  { value: 'food', label: '食物' },
  { value: 'material', label: '材料' }
]

const filteredInventory = computed(() => {
  if (selectedType.value === 'all') {
    return gameStore.inventory
  }
  return gameStore.inventoryByType(selectedType.value)
})

const totalItems = computed(() => {
  return gameStore.inventory.reduce((sum, item) => sum + item.quantity, 0)
})

const totalValue = computed(() => {
  return gameStore.inventory.reduce((sum, item) => sum + (item.item.value * item.quantity), 0)
})

const rareItems = computed(() => {
  return gameStore.inventory.filter(item => 
    ['rare', 'epic', 'legendary'].includes(item.item.rarity)
  ).length
})

const getItemIcon = (type) => {
  const icons = {
    resource: '💎',
    tool: '🔧',
    food: '🍎',
    material: '📦',
    ore: '⛏️',
    herb: '🌿',
    fish: '🐟'
  }
  return icons[type] || '📦'
}

const getTypeName = (type) => {
  const names = {
    resource: '资源',
    tool: '工具',
    food: '食物',
    material: '材料'
  }
  return names[type] || type
}

const getRarityName = (rarity) => {
  const names = {
    common: '普通',
    uncommon: '不常见',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return names[rarity] || rarity
}

// 设置页面元数据
useHead({
  title: '仓库 - 猫猫挂机游戏'
})

// 页面守卫
definePageMeta({
  middleware: 'auth'
})
</script>