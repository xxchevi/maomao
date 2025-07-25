import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stopCollectSchema = z.object({
  taskId: z.string().optional()
})

// 任务奖励配置
const taskRewards = {
  forest_collect: {
    experience: 2,
    skill: 'collecting',
    rewards: [
      { name: '木材', icon: '🪵', min: 1, max: 3, chance: 90.0 },
      { name: '浆果', icon: '🫐', min: 1, max: 2, chance: 60.0 },
      { name: '草药', icon: '🌿', min: 1, max: 1, chance: 30.0 },
      { name: '稀有种子', icon: '🌱', min: 1, max: 1, chance: 5.0 }
    ]
  },
  mine_collect: {
    experience: 4,
    skill: 'mining',
    rewards: [
      { name: '石头', icon: '🪨', min: 1, max: 2, chance: 95.0 },
      { name: '铁矿', icon: '⚙️', min: 1, max: 1, chance: 50.0 },
      { name: '金矿', icon: '🥇', min: 1, max: 1, chance: 20.0 },
      { name: '宝石', icon: '💎', min: 1, max: 1, chance: 3.0 }
    ]
  },
  farm_collect: {
    experience: 1,
    skill: 'farming',
    rewards: [
      { name: '小麦', icon: '🌾', min: 2, max: 4, chance: 85.0 },
      { name: '胡萝卜', icon: '🥕', min: 1, max: 3, chance: 70.0 },
      { name: '土豆', icon: '🥔', min: 1, max: 2, chance: 60.0 },
      { name: '特殊作物', icon: '🌽', min: 1, max: 1, chance: 15.0 }
    ]
  },
  fishing: {
    experience: 3,
    skill: 'fishing',
    rewards: [
      { name: '小鱼', icon: '🐟', min: 1, max: 2, chance: 80.0 },
      { name: '大鱼', icon: '🐠', min: 1, max: 1, chance: 40.0 },
      { name: '稀有鱼', icon: '🐡', min: 1, max: 1, chance: 10.0 },
      { name: '宝箱', icon: '📦', min: 1, max: 1, chance: 2.0 }
    ]
  }
}

// 计算奖励
function calculateRewards(taskType: string) {
  const config = taskRewards[taskType as keyof typeof taskRewards]
  if (!config) return { items: [], experience: 0, skill: '' }
  
  const items: any[] = []
  
  config.rewards.forEach(reward => {
    const roll = Math.random() * 100
    if (roll <= reward.chance) {
      const quantity = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min
      items.push({
        name: reward.name,
        icon: reward.icon,
        quantity
      })
    }
  })
  
  return {
    items,
    experience: config.experience,
    skill: config.skill
  }
}

export default defineEventHandler(async (event) => {
  try {
    // 验证请求方法
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // 获取并验证token
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // 验证请求体
    const body = await readBody(event)
    const validatedData = stopCollectSchema.parse(body)

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // 查找活跃的任务
    let task
    if (validatedData.taskId) {
      task = await prisma.collectTask.findFirst({
        where: {
          id: validatedData.taskId,
          userId: user.id,
          status: 'active'
        }
      })
    } else {
      task = await prisma.collectTask.findFirst({
        where: {
          userId: user.id,
          status: 'active'
        }
      })
    }

    if (!task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No active task found'
      })
    }

    // 计算任务完成度
    const now = new Date()
    const elapsed = now.getTime() - task.startTime.getTime()
    const totalDuration = task.duration * 1000
    const completionRate = Math.min(elapsed / totalDuration, 1)

    // 计算奖励
    const baseRewards = calculateRewards(task.taskType)
    const adjustedRewards = {
      ...baseRewards,
      experience: Math.floor(baseRewards.experience * completionRate),
      items: baseRewards.items.map(item => ({
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity * completionRate))
      }))
    }

    // 更新任务状态
    await prisma.collectTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        completedAt: now,
        rewards: JSON.stringify(adjustedRewards)
      }
    })

    // 更新用户数据
    const currentData = await prisma.gameData.findUnique({
      where: { userId: user.id }
    })

    if (currentData) {
      const currentInventory = JSON.parse(currentData.inventory || '{}')
      const currentSkills = JSON.parse(currentData.skills || '{}')
      
      // 更新库存
      adjustedRewards.items.forEach(item => {
        if (currentInventory[item.name]) {
          currentInventory[item.name].quantity += item.quantity
        } else {
          currentInventory[item.name] = {
            name: item.name,
            icon: item.icon,
            quantity: item.quantity
          }
        }
      })
      
      // 更新技能经验
      const skillName = adjustedRewards.skill
      if (skillName && currentSkills[skillName]) {
        currentSkills[skillName].experience += adjustedRewards.experience
        
        // 计算等级提升
        const newLevel = Math.floor(currentSkills[skillName].experience / 100) + 1
        if (newLevel > currentSkills[skillName].level) {
          currentSkills[skillName].level = newLevel
        }
      }
      
      // 更新总经验和等级
      const newTotalExperience = currentData.experience + adjustedRewards.experience
      const newLevel = Math.floor(newTotalExperience / 1000) + 1
      
      await prisma.gameData.update({
        where: { userId: user.id },
        data: {
          experience: newTotalExperience,
          level: newLevel,
          inventory: JSON.stringify(currentInventory),
          skills: JSON.stringify(currentSkills)
        }
      })
    }

    return {
      success: true,
      task: {
        id: task.id,
        taskType: task.taskType,
        completionRate,
        completedAt: now
      },
      rewards: adjustedRewards
    }

  } catch (error: any) {
    console.error('Stop collect task error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.errors
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})