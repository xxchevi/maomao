<template>
  <div class="space-y-8">
    <!-- 英雄区域 -->
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🐱</div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        猫猫挂机游戏
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        一款轻松的放置类游戏，支持离线挂机、采集、挖矿等多种玩法。即使离线也能持续获得收益！
      </p>
      
      <div class="space-x-4" v-if="!authStore.isLoggedIn">
        <NuxtLink to="/register" class="btn-primary">
          开始游戏
        </NuxtLink>
        <NuxtLink to="/login" class="btn-secondary">
          已有账号
        </NuxtLink>
      </div>
      
      <div v-else>
        <NuxtLink to="/game" class="btn-primary">
          进入游戏
        </NuxtLink>
      </div>
    </div>

    <!-- 功能特色 -->
    <div class="grid md:grid-cols-3 gap-8">
      <div class="game-card text-center">
        <div class="text-4xl mb-4">⚒️</div>
        <h3 class="text-xl font-semibold mb-2">多种技能</h3>
        <p class="text-gray-600">
          挖矿、采集、钓鱼、烹饪、制作等多种技能等你来体验
        </p>
      </div>
      
      <div class="game-card text-center">
        <div class="text-4xl mb-4">⏰</div>
        <h3 class="text-xl font-semibold mb-2">离线挂机</h3>
        <p class="text-gray-600">
          设置离线任务，即使不在线也能持续获得经验和资源
        </p>
      </div>
      
      <div class="game-card text-center">
        <div class="text-4xl mb-4">📈</div>
        <h3 class="text-xl font-semibold mb-2">角色成长</h3>
        <p class="text-gray-600">
          升级角色和技能，解锁更多内容和更高效的收益
        </p>
      </div>
    </div>

    <!-- 游戏截图/预览 -->
    <div class="game-card" v-if="authStore.isLoggedIn && authStore.character">
      <h2 class="text-2xl font-bold mb-6 text-center">角色概览</h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 角色信息 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">角色信息</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>角色名:</span>
              <span class="font-medium">{{ authStore.character.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>等级:</span>
              <span class="font-medium">{{ authStore.character.level }}</span>
            </div>
            <div class="flex justify-between">
              <span>经验:</span>
              <span class="font-medium">{{ authStore.character.exp }}</span>
            </div>
            <div class="flex justify-between">
              <span>金币:</span>
              <span class="font-medium text-yellow-600">{{ authStore.character.coins }}</span>
            </div>
          </div>
        </div>
        
        <!-- 技能等级 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">技能等级</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>⛏️ 挖矿:</span>
              <span class="font-medium">Lv.{{ authStore.character.miningLevel }}</span>
            </div>
            <div class="flex justify-between">
              <span>🌿 采集:</span>
              <span class="font-medium">Lv.{{ authStore.character.gatheringLevel }}</span>
            </div>
            <div class="flex justify-between">
              <span>🎣 钓鱼:</span>
              <span class="font-medium">Lv.{{ authStore.character.fishingLevel }}</span>
            </div>
            <div class="flex justify-between">
              <span>🍳 烹饪:</span>
              <span class="font-medium">Lv.{{ authStore.character.cookingLevel }}</span>
            </div>
            <div class="flex justify-between">
              <span>🔨 制作:</span>
              <span class="font-medium">Lv.{{ authStore.character.craftingLevel }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 text-center">
        <NuxtLink to="/game" class="btn-primary">
          继续游戏
        </NuxtLink>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-card">
      <h2 class="text-2xl font-bold mb-6 text-center">游戏玩法</h2>
      
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-3 flex items-center">
            <span class="mr-2">🎮</span>
            在线游戏
          </h3>
          <ul class="space-y-2 text-gray-600">
            <li>• 点击资源点开始采集活动</li>
            <li>• 实时获得经验和物品奖励</li>
            <li>• 升级技能解锁更多内容</li>
            <li>• 管理仓库中的物品</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-3 flex items-center">
            <span class="mr-2">💤</span>
            离线挂机
          </h3>
          <ul class="space-y-2 text-gray-600">
            <li>• 设置离线任务持续收益</li>
            <li>• 选择任务类型和持续时间</li>
            <li>• 离线期间自动完成任务</li>
            <li>• 上线后领取丰厚奖励</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()

// 如果已登录，直接跳转到游戏页面
if (authStore.isLoggedIn) {
  await navigateTo('/game')
}

// 设置页面元数据
useHead({
  title: '猫猫挂机游戏 - 轻松的放置类游戏',
  meta: [
    {
      name: 'description',
      content: '一款轻松的放置类游戏，支持离线挂机、采集、挖矿等多种玩法。即使离线也能持续获得收益！'
    }
  ]
})
</script>