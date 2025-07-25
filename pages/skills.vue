<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl mr-4">🐱</NuxtLink>
            <h1 class="text-xl font-bold text-gray-900">技能等级</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex space-x-2">
              <NuxtLink to="/" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                首页
              </NuxtLink>
              <NuxtLink to="/collect" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                采集
              </NuxtLink>
              <NuxtLink to="/inventory" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                仓库
              </NuxtLink>
              <NuxtLink to="/skills" class="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">
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
      <div class="skills-page">
    
    <div class="skills-container">
      <!-- 种植技能 -->
      <div class="skill-card">
        <div class="skill-header">
          <div class="skill-icon farming-icon">🌱</div>
          <div class="skill-info">
            <h2 class="skill-name">种植</h2>
            <div class="skill-level">等级: {{ gameStore.skills.farming.level }}</div>
          </div>
        </div>
        
        <div class="skill-progress-container">
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" :style="{ width: `${gameStore.skills.farming.progress}%` }"></div>
          </div>
          <div class="skill-progress-text">
            {{ gameStore.skills.farming.experience }} / {{ gameStore.skills.farming.nextLevelExp }}
          </div>
        </div>
        
        <div class="skill-description">
          <p>提高种植效率和产量。每提升一级，种植任务的经验值奖励增加5%。</p>
        </div>
        
        <div class="skill-benefits">
          <h3>等级特权</h3>
          <ul>
            <li>等级 5: 种植任务能量消耗减少10%</li>
            <li>等级 10: 种植任务完成时间减少5%</li>
            <li>等级 15: 种植任务奖励物品数量增加10%</li>
            <li>等级 20: 解锁稀有种子</li>
          </ul>
        </div>
      </div>
      
      <!-- 采矿技能 -->
      <div class="skill-card">
        <div class="skill-header">
          <div class="skill-icon mining-icon">⛏️</div>
          <div class="skill-info">
            <h2 class="skill-name">采矿</h2>
            <div class="skill-level">等级: {{ gameStore.skills.mining.level }}</div>
          </div>
        </div>
        
        <div class="skill-progress-container">
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" :style="{ width: `${gameStore.skills.mining.progress}%` }"></div>
          </div>
          <div class="skill-progress-text">
            {{ gameStore.skills.mining.experience }} / {{ gameStore.skills.mining.nextLevelExp }}
          </div>
        </div>
        
        <div class="skill-description">
          <p>提高采矿效率和稀有矿物发现率。每提升一级，采矿任务的经验值奖励增加5%。</p>
        </div>
        
        <div class="skill-benefits">
          <h3>等级特权</h3>
          <ul>
            <li>等级 5: 采矿任务能量消耗减少10%</li>
            <li>等级 10: 采矿任务完成时间减少5%</li>
            <li>等级 15: 发现稀有矿物的几率增加10%</li>
            <li>等级 20: 解锁稀有矿石</li>
          </ul>
        </div>
      </div>
      
      <!-- 农业技能 -->
      <div class="skill-card">
        <div class="skill-header">
          <div class="skill-icon agriculture-icon">🌾</div>
          <div class="skill-info">
            <h2 class="skill-name">农业</h2>
            <div class="skill-level">等级: {{ gameStore.skills.agriculture.level }}</div>
          </div>
        </div>
        
        <div class="skill-progress-container">
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" :style="{ width: `${gameStore.skills.agriculture.progress}%` }"></div>
          </div>
          <div class="skill-progress-text">
            {{ gameStore.skills.agriculture.experience }} / {{ gameStore.skills.agriculture.nextLevelExp }}
          </div>
        </div>
        
        <div class="skill-description">
          <p>提高农场作物的产量和品质。每提升一级，农业任务的经验值奖励增加5%。</p>
        </div>
        
        <div class="skill-benefits">
          <h3>等级特权</h3>
          <ul>
            <li>等级 5: 农业任务能量消耗减少10%</li>
            <li>等级 10: 农业任务完成时间减少5%</li>
            <li>等级 15: 农业任务奖励物品数量增加15%</li>
            <li>等级 20: 解锁稀有作物种子</li>
          </ul>
        </div>
      </div>
      
      <!-- 钓鱼技能 -->
      <div class="skill-card">
        <div class="skill-header">
          <div class="skill-icon fishing-icon">🎣</div>
          <div class="skill-info">
            <h2 class="skill-name">钓鱼</h2>
            <div class="skill-level">等级: {{ gameStore.skills.fishing.level }}</div>
          </div>
        </div>
        
        <div class="skill-progress-container">
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" :style="{ width: `${gameStore.skills.fishing.progress}%` }"></div>
          </div>
          <div class="skill-progress-text">
            {{ gameStore.skills.fishing.experience }} / {{ gameStore.skills.fishing.nextLevelExp }}
          </div>
        </div>
        
        <div class="skill-description">
          <p>提高钓鱼成功率和稀有鱼类捕获几率。每提升一级，钓鱼任务的经验值奖励增加5%。</p>
        </div>
        
        <div class="skill-benefits">
          <h3>等级特权</h3>
          <ul>
            <li>等级 5: 钓鱼任务能量消耗减少10%</li>
            <li>等级 10: 钓鱼任务完成时间减少5%</li>
            <li>等级 15: 稀有鱼类捕获几率增加20%</li>
            <li>等级 20: 解锁传说级鱼类</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
    </main>
  </div>
</template>

<script setup>
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'

const gameStore = useGameStore()
const authStore = useAuthStore()

// 确保游戏状态已加载
onMounted(async () => {
  if (!gameStore.connected) {
    await gameStore.loadGameState()
  }
})

// 登出功能
const handleLogout = async () => {
  await authStore.logout()
  await navigateTo('/login')
}
</script>

<style scoped>
.skills-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #4a5568;
}

.skills-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.skill-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.2s;
}

.skill-card:hover {
  transform: translateY(-5px);
}

.skill-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.skill-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.farming-icon {
  background-color: #c6f6d5;
  color: #38a169;
}

.mining-icon {
  background-color: #e9d8fd;
  color: #805ad5;
}

.agriculture-icon {
  background-color: #fef5e7;
  color: #d69e2e;
}

.fishing-icon {
  background-color: #e6fffa;
  color: #319795;
}

.skill-info {
  flex: 1;
}

.skill-name {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.skill-level {
  font-size: 1.1rem;
  color: #4a5568;
  font-weight: 500;
}

.skill-progress-container {
  margin-bottom: 20px;
}

.skill-progress-bar {
  height: 10px;
  background-color: #edf2f7;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 5px;
}

.skill-progress-fill {
  height: 100%;
  background-color: #4299e1;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.skill-progress-text {
  text-align: right;
  font-size: 0.9rem;
  color: #718096;
}

.skill-description {
  margin-bottom: 20px;
  color: #4a5568;
  line-height: 1.5;
}

.skill-benefits h3 {
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 10px;
}

.skill-benefits ul {
  padding-left: 20px;
  color: #4a5568;
}

.skill-benefits li {
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .skills-container {
    grid-template-columns: 1fr;
  }
}
</style>