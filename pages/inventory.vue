<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl mr-4">🐱</NuxtLink>
            <h1 class="text-xl font-bold text-gray-900">仓库管理</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex space-x-2">
              <NuxtLink to="/" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                首页
              </NuxtLink>
              <NuxtLink to="/collect" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                采集
              </NuxtLink>
              <NuxtLink to="/inventory" class="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">
                仓库
              </NuxtLink>
              <NuxtLink to="/skills" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                技能
              </NuxtLink>
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
      <!-- 仓库统计 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="cat-card text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalItems }}</div>
          <div class="text-sm text-gray-600">总物品数量</div>
        </div>
        <div class="cat-card text-center">
          <div class="text-2xl font-bold text-green-600">{{ uniqueItems }}</div>
          <div class="text-sm text-gray-600">物品种类</div>
        </div>
        <div class="cat-card text-center">
          <div class="text-2xl font-bold text-purple-600">{{ rareItems }}</div>
          <div class="text-sm text-gray-600">稀有物品</div>
        </div>
        <div class="cat-card text-center">
          <div class="text-2xl font-bold text-orange-600">{{ totalValue }}</div>
          <div class="text-sm text-gray-600">估计价值</div>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <div class="cat-card mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">筛选:</label>
            <select v-model="filterRarity" class="cat-input w-auto">
              <option value="all">全部稀有度</option>
              <option value="common">普通</option>
              <option value="uncommon">不常见</option>
              <option value="rare">稀有</option>
              <option value="epic">史诗</option>
              <option value="legendary">传说</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">排序:</label>
            <select v-model="sortBy" class="cat-input w-auto">
              <option value="name">名称</option>
              <option value="quantity">数量</option>
              <option value="rarity">稀有度</option>
              <option value="recent">最近获得</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-2">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索物品..." 
              class="cat-input w-48"
            />
          </div>
        </div>
      </div>

      <!-- 物品网格 -->
      <div class="cat-card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">物品列表</h2>
        
        <div v-if="filteredItems.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          <div 
            v-for="item in filteredItems" 
            :key="item.id"
            class="inventory-slot filled cursor-pointer hover:shadow-lg transition-shadow"
            :class="getRarityClass(item.rarity)"
            @click="selectItem(item)"
            :title="`${item.name} x${item.quantity}`"
          >
            <div class="text-center">
              <div class="text-2xl mb-1">{{ item.icon }}</div>
              <div class="text-xs font-medium text-gray-700 truncate">{{ item.name }}</div>
              <div class="text-xs text-gray-500">x{{ item.quantity }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <div class="text-4xl mb-4">📦</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">仓库空空如也</h3>
          <p class="text-gray-600 mb-4">去采集一些物品吧！</p>
          <NuxtLink to="/collect" class="cat-button cat-button-primary">
            开始采集
          </NuxtLink>
        </div>
      </div>

      <!-- 物品详情模态框 -->
      <div v-if="selectedItem" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">物品详情</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">{{ selectedItem.icon }}</div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ selectedItem.name }}</h4>
            <div class="flex items-center justify-center space-x-2 mb-2">
              <span class="text-sm text-gray-600">稀有度:</span>
              <span :class="getRarityTextClass(selectedItem.rarity)" class="text-sm font-medium">
                {{ getRarityText(selectedItem.rarity) }}
              </span>
            </div>
            <div class="text-lg font-bold text-gray-900">数量: {{ selectedItem.quantity }}</div>
          </div>
          
          <div class="space-y-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm text-gray-600 mb-1">物品描述</div>
              <div class="text-sm text-gray-900">{{ getItemDescription(selectedItem) }}</div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm text-gray-600 mb-1">估计价值</div>
              <div class="text-sm text-gray-900">{{ getItemValue(selectedItem) }} 金币</div>
            </div>
          </div>
          
          <div class="mt-6 flex space-x-3">
            <button class="flex-1 cat-button cat-button-secondary" @click="closeModal">
              关闭
            </button>
            <button class="flex-1 cat-button cat-button-primary" @click="useItem">
              使用物品
            </button>
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

// 响应式数据
const filterRarity = ref('all')
const sortBy = ref('name')
const searchQuery = ref('')
const selectedItem = ref(null)

// 计算属性
const totalItems = computed(() => {
  return gameStore.inventory.reduce((sum, item) => sum + item.quantity, 0)
})

const uniqueItems = computed(() => {
  return gameStore.inventory.length
})

const rareItems = computed(() => {
  return gameStore.inventory.filter(item => 
    ['rare', 'epic', 'legendary'].includes(item.rarity)
  ).reduce((sum, item) => sum + item.quantity, 0)
})

const totalValue = computed(() => {
  return gameStore.inventory.reduce((sum, item) => {
    return sum + (getItemValue(item) * item.quantity)
  }, 0)
})

const filteredItems = computed(() => {
  let items = [...gameStore.inventory]
  
  // 稀有度筛选
  if (filterRarity.value !== 'all') {
    items = items.filter(item => item.rarity === filterRarity.value)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(query)
    )
  }
  
  // 排序
  items.sort((a, b) => {
    switch (sortBy.value) {
      case 'quantity':
        return b.quantity - a.quantity
      case 'rarity':
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 }
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0)
      case 'recent':
        // 这里可以根据获得时间排序，暂时按ID排序
        return b.id.localeCompare(a.id)
      default: // name
        return a.name.localeCompare(b.name)
    }
  })
  
  return items
})

// 方法
const handleLogout = async () => {
  await authStore.logout()
}

const selectItem = (item) => {
  selectedItem.value = item
}

const closeModal = () => {
  selectedItem.value = null
}

const getRarityClass = (rarity) => {
  const classes = {
    common: 'border-gray-300 bg-gray-50',
    uncommon: 'border-green-300 bg-green-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50'
  }
  return classes[rarity] || classes.common
}

const getRarityTextClass = (rarity) => {
  const classes = {
    common: 'text-gray-600',
    uncommon: 'text-green-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600'
  }
  return classes[rarity] || classes.common
}

const getRarityText = (rarity) => {
  const texts = {
    common: '普通',
    uncommon: '不常见',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return texts[rarity] || '未知'
}

const getItemDescription = (item) => {
  const descriptions = {
    '🫐': '新鲜的蓝莓，富含维生素和抗氧化剂。',
    '🍓': '甜美的草莓，猫咪们的最爱。',
    '🍇': '紫色的葡萄，可以制作果汁。',
    '🌿': '常见的草药，具有基础的治疗效果。',
    '🍀': '幸运的三叶草，据说能带来好运。',
    '🌱': '嫩绿的芽菜，充满生命力。',
    '🪨': '普通的石头，可以用来建造。',
    '🥉': '含铜的矿石，可以冶炼成铜锭。',
    '🥈': '珍贵的银矿，价值不菲。',
    '🥝': '神秘的竹子，传说中的稀有材料。',
    '🏠': '特殊的竹子，可以用来建造房屋。',
    '🏆': '传说中的竹子，极其珍贵。'
  }
  return descriptions[item.icon] || '一个神秘的物品，等待你去发现它的用途。'
}

const getItemValue = (item) => {
  const baseValues = {
    common: 1,
    uncommon: 5,
    rare: 25,
    epic: 100,
    legendary: 500
  }
  return baseValues[item.rarity] || 1
}

const useItem = () => {
  if (!selectedItem.value) return
  
  // 这里可以实现物品使用逻辑
  console.log('使用物品:', selectedItem.value.name)
  closeModal()
}

// 页面标题
useHead({
  title: '仓库管理 - 猫猫挂机游戏'
})
</script>

<style scoped>
.inventory-slot {
  min-height: 80px;
  padding: 8px;
}
</style>