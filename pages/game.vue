<template>
  <div class="space-y-6">
    <!-- 角色状态栏 -->
    <div class="game-card" v-if="authStore.isLoggedIn">
  <div v-if="!authStore.character" class="text-center py-8">
    <h3 class="text-xl font-semibold mb-4">角色不存在</h3>
    <p class="mb-6">请先创建您的游戏角色</p>
    <button @click="createCharacter" class="btn-primary">创建角色</button>
  </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl mb-1">🐱</div>
          <div class="text-sm text-gray-600">{{ authStore.character?.name }}</div>
          <div class="font-semibold">Lv.{{ authStore.character?.level }}</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl mb-1">⭐</div>
          <div class="text-sm text-gray-600">经验</div>
          <div class="font-semibold">{{ authStore.character?.exp }}</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl mb-1">💰</div>
          <div class="text-sm text-gray-600">金币</div>
          <div class="font-semibold text-yellow-600">{{ authStore.character?.coins }}</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl mb-1">🔗</div>
          <div class="text-sm text-gray-600">连接状态</div>
          <div :class="gameStore.isConnected ? 'text-green-600' : 'text-red-600'" class="font-semibold">
            {{ gameStore.isConnected ? '已连接' : '未连接' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 队列面板 -->
    <QueuePanel />
    
    <!-- 测试按钮 -->
    <div class="game-card" v-if="authStore.isLoggedIn">
      <h2 class="text-xl font-bold mb-4">测试功能</h2>
      <div class="flex gap-4">
        <button @click="createTestQueue" class="btn-primary">
          创建测试队列
        </button>
        <button @click="restoreQueues" class="btn-secondary">
          恢复队列状态
        </button>
      </div>
    </div>

    <!-- 技能面板 -->
    <div class="game-card" v-if="authStore.isLoggedIn && authStore.character">
      <h2 class="text-xl font-bold mb-4">技能等级</h2>
      
      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="flex items-center">
              <span class="mr-2">⛏️</span>
              挖矿
            </span>
            <span class="font-semibold">Lv.{{ authStore.character?.miningLevel }}</span>
          </div>
          <div class="skill-bar">
            <div 
              class="skill-progress" 
              :style="{ width: getSkillProgress(authStore.character?.miningExp, authStore.character?.miningLevel) + '%' }"
            ></div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="flex items-center">
              <span class="mr-2">🌿</span>
              采集
            </span>
            <span class="font-semibold">Lv.{{ authStore.character?.gatheringLevel }}</span>
          </div>
          <div class="skill-bar">
            <div 
              class="skill-progress" 
              :style="{ width: getSkillProgress(authStore.character?.gatheringExp, authStore.character?.gatheringLevel) + '%' }"
            ></div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="flex items-center">
              <span class="mr-2">🎣</span>
              钓鱼
            </span>
            <span class="font-semibold">Lv.{{ authStore.character?.fishingLevel }}</span>
          </div>
          <div class="skill-bar">
            <div 
              class="skill-progress" 
              :style="{ width: getSkillProgress(authStore.character?.fishingExp, authStore.character?.fishingLevel) + '%' }"
            ></div>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="flex items-center">
              <span class="mr-2">🍳</span>
              烹饪
            </span>
            <span class="font-semibold">Lv.{{ authStore.character?.cookingLevel }}</span>
          </div>
          <div class="skill-bar">
            <div 
              class="skill-progress" 
              :style="{ width: getSkillProgress(authStore.character?.cookingExp, authStore.character?.cookingLevel) + '%' }"
            ></div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="flex items-center">
              <span class="mr-2">🔨</span>
              制作
            </span>
            <span class="font-semibold">Lv.{{ authStore.character?.craftingLevel }}</span>
          </div>
          <div class="skill-bar">
            <div 
              class="skill-progress" 
              :style="{ width: getSkillProgress(authStore.character?.craftingExp, authStore.character?.craftingLevel) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 资源区域 -->
    <div class="space-y-6">
      <!-- 挖矿区域 -->
      <div class="game-card">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <span class="mr-2">⛏️</span>
          挖矿区域
        </h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="resource in gameStore.resourcesByArea('mining')"
            :key="resource.id"
            class="resource-item"
            @click="openActivityModal('mining', resource)"
          >
            <div class="flex-1">
              <div class="font-semibold">{{ resource?.name }}</div>
              <div class="text-sm text-gray-600">
                需要等级: {{ resource?.levelReq }} | 经验: +{{ resource?.expReward }}
              </div>
              <div class="text-xs text-gray-500">
                基础时间: {{ resource?.baseTime }}秒
              </div>
            </div>
            <div class="text-2xl">⛏️</div>
          </div>
        </div>
      </div>
      
      <!-- 采集区域 -->
      <div class="game-card">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <span class="mr-2">🌿</span>
          采集区域
        </h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="resource in gameStore.resourcesByArea('gathering')"
            :key="resource.id"
            class="resource-item"
            @click="openActivityModal('gathering', resource)"
          >
            <div class="flex-1">
              <div class="font-semibold">{{ resource?.name }}</div>
              <div class="text-sm text-gray-600">
                需要等级: {{ resource?.levelReq }} | 经验: +{{ resource?.expReward }}
              </div>
              <div class="text-xs text-gray-500">
                基础时间: {{ resource?.baseTime }}秒
              </div>
            </div>
            <div class="text-2xl">🌿</div>
          </div>
        </div>
      </div>
      
      <!-- 钓鱼区域 -->
      <div class="game-card">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <span class="mr-2">🎣</span>
          钓鱼区域
        </h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="resource in gameStore.resourcesByArea('fishing')"
            :key="resource.id"
            class="resource-item"
            @click="openActivityModal('fishing', resource)"
          >
            <div class="flex-1">
              <div class="font-semibold">{{ resource?.name }}</div>
              <div class="text-sm text-gray-600">
                需要等级: {{ resource?.levelReq }} | 经验: +{{ resource?.expReward }}
              </div>
              <div class="text-xs text-gray-500">
                基础时间: {{ resource?.baseTime }}秒
              </div>
            </div>
            <div class="text-2xl">🎣</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 活动选择弹窗 -->
    <ActivityModal 
      :is-open="modalOpen"
      :activity-type="selectedActivityType"
      :resource="selectedResource"
      @close="closeModal"
      @add-to-queue="handleAddToQueue"
      @start-immediately="handleStartImmediately"
    />
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const gameStore = useGameStore()

// 检查认证状态
if (!authStore.isLoggedIn) {
  await navigateTo('/login')
}

// 弹窗状态
const modalOpen = ref(false)
const selectedActivityType = ref('')
const selectedResource = ref(null)

// 打开活动选择弹窗
const openActivityModal = (activityType, resource) => {
  selectedActivityType.value = activityType
  selectedResource.value = resource
  modalOpen.value = true
}

// 关闭弹窗
const closeModal = () => {
  modalOpen.value = false
  selectedActivityType.value = ''
  selectedResource.value = null
}

// 处理加入队列
const handleAddToQueue = async (params) => {
  await gameStore.addToQueue(params)
}

// 处理立即开始
const handleStartImmediately = async (params) => {
  await gameStore.startImmediately(params)
}

// 创建角色
const createCharacter = async () => {
  try {
    const characterName = prompt('请输入角色名称:')
    if (!characterName) return
    
    const { data } = await $fetch('/api/auth/create-character', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: { name: characterName }
    })
    
    authStore.updateCharacter(data.character)
    
    // 重新初始化游戏数据
    gameStore.initSocket()
    await gameStore.loadGameData()
  } catch (error) {
    console.error('创建角色失败:', error)
    alert('创建角色失败，请重试')
  }
}

// 兼容旧的方法
const startActivity = async (type, resourceId) => {
  await gameStore.startActivity(type, resourceId)
}

const stopActivity = async () => {
  await gameStore.stopActivity()
}

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

const getSkillProgress = (exp, level) => {
  const currentLevelExp = (level - 1) * (level - 1) * 100
  const nextLevelExp = level * level * 100
  const progress = ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
  return Math.max(0, Math.min(100, progress))
}

// 测试功能
const createTestQueue = () => {
  if (gameStore.socket) {
    gameStore.socket.emit('test_create_queue')
    console.log('发送创建测试队列请求')
  }
}

const restoreQueues = () => {
  if (gameStore.socket) {
    gameStore.socket.emit('restore_queues')
    console.log('发送恢复队列请求')
  }
}

// 设置页面元数据
useHead({
  title: '游戏 - 猫猫挂机游戏'
})

// 页面守卫
definePageMeta({})
</script>