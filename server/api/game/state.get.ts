import jwt from 'jsonwebtoken'
import { userDb, gameDataDb } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: '未提供认证令牌'
      })
    }
    
    const token = authHeader.substring(7)
    
    // 验证JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as any
    
    // 查找用户
    const user = userDb.findById(decoded.userId)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户不存在'
      })
    }
    
    // 获取游戏数据
    const gameData = gameDataDb.findByUserId(user.id)
    if (!gameData) {
      throw createError({
        statusCode: 404,
        statusMessage: '游戏数据不存在'
      })
    }
    
    // 检查是否有正在进行的任务
    let currentTask = null
    if (gameData.isCollecting && gameData.collectingTaskId) {
      // 从数据库获取任务信息
      const now = Date.now()
      const startTime = gameData.collectingStartTime ? new Date(gameData.collectingStartTime).getTime() : now
      
      // 计算任务进度
      const elapsed = now - startTime
      const duration = 3600000 // 假设任务持续1小时
      const progress = Math.min((elapsed / duration) * 100, 100)
      
      currentTask = {
        id: gameData.collectingTaskId,
        progress: progress,
        isActive: true,
        startTime: startTime,
        endTime: startTime + duration
      }
    }
    
    // 解析库存数据（从JSON字符串转换为对象）
    let inventory = []
    try {
      inventory = JSON.parse(gameData.inventory || '[]')
    } catch (e) {
      console.error('解析库存数据失败:', e)
    }
    
    // 计算技能进度百分比
    const farmingProgress = Math.min(Math.floor((gameData.farmingExp / (gameData.farmingLevel * 100)) * 100), 100)
    const miningProgress = Math.min(Math.floor((gameData.miningExp / (gameData.miningLevel * 100)) * 100), 100)
    
    return {
      success: true,
      data: {
        currentTask: currentTask,
        inventory: inventory,
        experience: user.experience,
        level: user.level,
        // 添加技能等级信息
        skills: {
          farming: {
            level: gameData.farmingLevel,
            experience: gameData.farmingExp,
            nextLevelExp: gameData.farmingLevel * 100,
            progress: farmingProgress
          },
          mining: {
            level: gameData.miningLevel,
            experience: gameData.miningExp,
            nextLevelExp: gameData.miningLevel * 100,
            progress: miningProgress
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: '无效的认证令牌'
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '获取游戏状态失败'
    })
  }
})

// 生成任务奖励
function generateTaskRewards(task: any) {
  const rewards = []
  
  for (const reward of task.rewards || []) {
    if (Math.random() * 100 < reward.chance) {
      rewards.push({
        id: reward.item,
        name: reward.item,
        icon: getItemIcon(reward.item),
        quantity: reward.quantity,
        rarity: getItemRarity(reward.item)
      })
    }
  }
  
  return rewards
}

// 获取物品图标
function getItemIcon(itemName: string) {
  const icons: { [key: string]: string } = {
    '蓝莓': '🍎',
    '草莓': '🍓',
    '葡萄': '🍇',
    '竹子': '🥝',
    '普通草药': '🌿',
    '三叶草': '🍀',
    '嫩芽': '🌱',
    '普通石头': '🪨',
    '铜矿': '🥉',
    '银矿': '🥈'
  }
  return icons[itemName] || '📦'
}

// 获取物品稀有度
function getItemRarity(itemName: string) {
  const rarities: { [key: string]: string } = {
    '蓝莓': 'common',
    '草莓': 'common',
    '葡萄': 'common',
    '竹子': 'legendary',
    '普通草药': 'common',
    '三叶草': 'common',
    '嫩芽': 'common',
    '普通石头': 'common',
    '铜矿': 'common',
    '银矿': 'uncommon'
  }
  return rarities[itemName] || 'common'
}