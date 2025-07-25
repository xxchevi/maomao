import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { userDb, gameDataDb, taskQueueDb } from '~/server/database/db'
import { queueProcessor } from '~/server/utils/queueProcessor'

// 模拟数据库存储（与其他文件共享）
const users: any[] = []

export default defineNitroPlugin((nitroApp) => {
  const io = new Server(nitroApp.hooks.hookOnce('render:route', () => {}).server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : false,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  })

  // 存储用户连接
  const userConnections = new Map()

  io.on('connection', (socket) => {
    console.log('用户连接:', socket.id)

    // 用户认证
    socket.on('authenticate', async (data) => {
      try {
        const { token } = data
        const config = useRuntimeConfig()
        
        // 验证JWT token
        const decoded = jwt.verify(token, config.jwtSecret) as any
        
        // 查找用户
        const user = users.find(u => u.id === decoded.userId)
        if (!user) {
          socket.emit('auth_error', { message: '用户不存在' })
          return
        }
        
        // 保存用户连接
        socket.userId = user.id
        userConnections.set(user.id, socket)
        
        // 更新用户在线状态
        user.isOnline = true
        user.lastActiveAt = new Date().toISOString()
        
        socket.emit('authenticated', {
          success: true,
          user: {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email
          }
        })
        
        // 发送游戏状态（包括队列状态）
        sendGameStateWithQueue(socket, user)
        
        // 启动队列处理器
        queueProcessor.startProcessing(user.id, (event, data) => {
          socket.emit(event, data)
        })
        
        console.log(`用户 ${user.name} 已认证`)
      } catch (error) {
        socket.emit('auth_error', { message: '认证失败' })
      }
    })

    // 获取游戏状态
    socket.on('get_game_state', () => {
      if (!socket.userId) {
        socket.emit('error', { message: '未认证' })
        return
      }
      
      const user = users.find(u => u.id === socket.userId)
      if (user) {
        sendGameState(socket, user)
      }
    })

    // 开始采集任务
    socket.on('start_collect_task', async (data) => {
      if (!socket.userId) {
        socket.emit('error', { message: '未认证' })
        return
      }
      
      const user = users.find(u => u.id === socket.userId)
      if (!user) {
        socket.emit('error', { message: '用户不存在' })
        return
      }
      
      try {
        const { taskType, duration } = data
        
        // 创建新任务
        const now = Date.now()
        const durationMs = duration * 60 * 1000
        
        const task = {
          id: `task_${now}`,
          type: taskType,
          duration: duration,
          startTime: now,
          endTime: now + durationMs,
          progress: 0,
          rewards: getTaskRewards(taskType),
          experience: Math.floor(duration / 5) + 5
        }
        
        user.gameData.currentTask = task
        
        socket.emit('task_started', {
          success: true,
          task: task,
        })
        
        // 开始任务进度更新
        startTaskProgress(user, socket)
        
      } catch (error) {
        socket.emit('task_error', { message: '开始任务失败' })
      }
    })

    // 停止采集任务
    socket.on('stop_collect_task', () => {
      if (!socket.userId) {
        socket.emit('error', { message: '未认证' })
        return
      }
      
      const user = users.find(u => u.id === socket.userId)
      if (!user || !user.gameData.currentTask) {
        socket.emit('task_error', { message: '当前没有进行中的任务' })
        return
      }
      
      const rewards = completeTask(user)
      
      socket.emit('task_completed', {
        success: true,
        rewards: rewards,
        experience: user.gameData.experience,
        level: user.gameData.level
      })
      
      sendGameState(socket, user)
    })

    // 监听断开连接
      socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id)
        // 停止队列处理器（但保持任务在服务器端继续执行）
        if (socket.data.userId) {
          // 注意：这里不停止队列处理，因为任务应该在离线时继续执行
          console.log(`用户 ${socket.data.userId} 断开连接，队列继续在后台执行`)
        }
      })
      
      // 监听队列相关事件
      socket.on('get_queue_status', () => {
        if (socket.userId) {
          sendQueueStatus(socket, socket.userId)
        }
      })
      
      socket.on('add_task_to_queue', async (data) => {
        if (!socket.userId) {
          socket.emit('task_add_error', { message: '未认证' })
          return
        }
        
        try {
          const { taskType, count = 1 } = data
          
          // 获取用户数据
          const user = users.find(u => u.id === socket.userId)
          if (!user) {
            socket.emit('task_add_error', { message: '用户不存在' })
            return
          }
          
          // 检查队列长度限制
          const currentQueueLength = taskQueueDb.getQueueLength(socket.userId)
          if (currentQueueLength >= 20) {
            socket.emit('task_add_error', { message: '队列已满，最多只能有20个任务' })
            return
          }
          
          // 注意：已移除能量检查，任务执行不再受能量限制
          
          // 添加任务到队列
          const taskData = {
            userId: socket.userId,
            taskType,
            taskName: getTaskName(taskType),
            duration: getTaskDuration(taskType),
            totalCount: count,
            remainingCount: count,
            rewards: JSON.stringify(getTaskRewards(taskType)),
            experience: getTaskExperience(taskType),
            skillType: getTaskSkillType(taskType),
          }
          
          const taskId = taskQueueDb.addTaskForSocket(taskData)
          
          socket.emit('task_added', {
            success: true,
            taskId,
            message: '任务已添加到队列'
          })
          
          // 发送更新的队列状态
          sendQueueStatus(socket, socket.userId)
          
        } catch (error) {
          console.error('添加任务到队列失败:', error)
          socket.emit('task_add_error', { message: '添加任务失败' })
        }
      })
      
      socket.on('remove_task_from_queue', async (data) => {
        if (!socket.userId) {
          socket.emit('task_remove_error', { message: '未认证' })
          return
        }
        
        try {
          const { taskId } = data
          
          // 检查任务是否存在且属于当前用户
          const task = taskQueueDb.getTaskById(taskId)
          if (!task || task.userId !== socket.userId) {
            socket.emit('task_remove_error', { message: '任务不存在或无权限' })
            return
          }
          
          // 检查任务状态
          if (task.status === 'running') {
            socket.emit('task_remove_error', { message: '正在执行的任务无法移除' })
            return
          }
          
          // 移除任务
          taskQueueDb.removeTask(taskId)
          
          socket.emit('task_removed', {
            success: true,
            message: '任务已从队列中移除'
          })
          
          // 发送更新的队列状态
          sendQueueStatus(socket, socket.userId)
          
        } catch (error) {
          console.error('移除任务失败:', error)
          socket.emit('task_remove_error', { message: '移除任务失败' })
        }
      })
      
      socket.on('start_queue_processing', () => {
        if (socket.userId) {
          queueProcessor.startProcessing(socket.userId, (event, data) => {
            socket.emit(event, data)
          })
        }
      })
      
      socket.on('stop_queue_processing', () => {
         if (socket.userId) {
           queueProcessor.stopProcessing(socket.userId)
         }
       })
  })

  // 发送游戏状态
  function sendGameState(socket: any, user: any) {
  // 检查任务是否完成
  if (user.gameData.currentTask) {
    const task = user.gameData.currentTask
    const now = Date.now()
    
    if (task.endTime && now >= task.endTime) {
      // 任务已完成
      const rewards = completeTask(user)
      socket.emit('task_completed', {
        success: true,
        rewards: rewards,
        experience: user.gameData.experience,
        level: user.gameData.level,
        skills: {
          farming: {
            level: user.gameData.farmingLevel,
            experience: user.gameData.farmingExp,
            nextLevelExp: user.gameData.farmingLevel * 100
          },
          mining: {
            level: user.gameData.miningLevel,
            experience: user.gameData.miningExp,
            nextLevelExp: user.gameData.miningLevel * 100
          },
          agriculture: {
            level: user.gameData.agricultureLevel,
            experience: user.gameData.agricultureExp,
            nextLevelExp: user.gameData.agricultureLevel * 100
          },
          fishing: {
            level: user.gameData.fishingLevel,
            experience: user.gameData.fishingExp,
            nextLevelExp: user.gameData.fishingLevel * 100
          }
        }
      })
    } else if (task.startTime && task.endTime) {
      // 更新任务进度
      const elapsed = now - task.startTime
      const total = task.endTime - task.startTime
      task.progress = Math.min((elapsed / total) * 100, 100)
    }
  }
  
  // 计算技能进度百分比
  const farmingProgress = Math.min(Math.floor((user.gameData.farmingExp / (user.gameData.farmingLevel * 100)) * 100), 100)
  const miningProgress = Math.min(Math.floor((user.gameData.miningExp / (user.gameData.miningLevel * 100)) * 100), 100)
  const agricultureProgress = Math.min(Math.floor((user.gameData.agricultureExp / (user.gameData.agricultureLevel * 100)) * 100), 100)
  const fishingProgress = Math.min(Math.floor((user.gameData.fishingExp / (user.gameData.fishingLevel * 100)) * 100), 100)

  
  socket.emit('game_state', {
    currentTask: user.gameData.currentTask,
    inventory: user.gameData.inventory,
    experience: user.gameData.experience,
    level: user.gameData.level,
    skills: {
      farming: {
        level: user.gameData.farmingLevel,
        experience: user.gameData.farmingExp,
        nextLevelExp: user.gameData.farmingLevel * 100,
        progress: farmingProgress
      },
      mining: {
        level: user.gameData.miningLevel,
        experience: user.gameData.miningExp,
        nextLevelExp: user.gameData.miningLevel * 100,
        progress: miningProgress
      },
      agriculture: {
        level: user.gameData.agricultureLevel,
        experience: user.gameData.agricultureExp,
        nextLevelExp: user.gameData.agricultureLevel * 100,
        progress: agricultureProgress
      },
      fishing: {
        level: user.gameData.fishingLevel,
        experience: user.gameData.fishingExp,
        nextLevelExp: user.gameData.fishingLevel * 100,
        progress: fishingProgress
      }
    }
  })
}

// 发送包含队列状态的游戏状态
function sendGameStateWithQueue(socket: any, user: any) {
  // 发送基础游戏状态
  sendGameState(socket, user)
  
  // 发送队列状态
  sendQueueStatus(socket, user.id)
}

// 发送队列状态
function sendQueueStatus(socket: any, userId: number) {
  try {
    const queue = taskQueueDb.getUserQueue(userId)
    const currentTask = taskQueueDb.getCurrentRunningTask(userId)
    const queueLength = taskQueueDb.getQueueLength(userId)
    
    // 处理队列数据
    const processedQueue = queue.map(task => ({
      ...task,
      rewards: JSON.parse(task.rewards || '[]'),
      estimatedEndTime: task.status === 'running' && task.startTime 
        ? new Date(task.startTime).getTime() + (task.duration * 1000)
        : null,
      remainingTime: task.status === 'running' && task.startTime
        ? Math.max(0, new Date(task.startTime).getTime() + (task.duration * 1000) - Date.now())
        : null
    }))
    
    // 计算队列总预计时间
    const totalEstimatedTime = queue.reduce((total, task) => {
      if (task.status === 'pending') {
        return total + (task.duration * task.remainingCount)
      } else if (task.status === 'running') {
        const remainingTime = task.startTime 
          ? Math.max(0, new Date(task.startTime).getTime() + (task.duration * 1000) - Date.now())
          : task.duration * 1000
        return total + (remainingTime / 1000) + (task.duration * (task.remainingCount - 1))
      }
      return total
    }, 0)
    
    socket.emit('queue_status', {
      queue: processedQueue,
      currentTask: currentTask ? {
        ...currentTask,
        rewards: JSON.parse(currentTask.rewards || '[]'),
        estimatedEndTime: currentTask.startTime 
          ? new Date(currentTask.startTime).getTime() + (currentTask.duration * 1000)
          : null,
        remainingTime: currentTask.startTime
          ? Math.max(0, new Date(currentTask.startTime).getTime() + (currentTask.duration * 1000) - Date.now())
          : null
      } : null,
      queueLength,
      totalEstimatedTime: Math.ceil(totalEstimatedTime)
    })
  } catch (error) {
    console.error('发送队列状态错误:', error)
  }
}

  // 开始任务进度更新
  function startTaskProgress(user: any, socket: any) {
    const updateInterval = setInterval(() => {
      if (!user.gameData.currentTask) {
        clearInterval(updateInterval)
        return
      }
      
      const task = user.gameData.currentTask
      const now = Date.now()
      
      if (now >= task.endTime) {
        // 任务完成
        const rewards = completeTask(user)
        socket.emit('task_completed', {
          success: true,
          rewards: rewards,
          experience: user.gameData.experience,
          level: user.gameData.level,
          skills: {
            farming: {
              level: user.gameData.farmingLevel,
              experience: user.gameData.farmingExp,
              nextLevelExp: user.gameData.farmingLevel * 100
            },
            mining: {
              level: user.gameData.miningLevel,
              experience: user.gameData.miningExp,
              nextLevelExp: user.gameData.miningLevel * 100
            },
            agriculture: {
              level: user.gameData.agricultureLevel,
              experience: user.gameData.agricultureExp,
              nextLevelExp: user.gameData.agricultureLevel * 100
            },
            fishing: {
              level: user.gameData.fishingLevel,
              experience: user.gameData.fishingExp,
              nextLevelExp: user.gameData.fishingLevel * 100
            }
          }
        })
        clearInterval(updateInterval)
      } else {
        // 更新进度
        const elapsed = now - task.startTime
        const total = task.endTime - task.startTime
        task.progress = Math.min((elapsed / total) * 100, 100)
        
        socket.emit('task_progress', {
          progress: task.progress,
          remainingTime: task.endTime - now
        })
      }
    }, 1000) // 每秒更新一次
  }

  // 完成任务
  function completeTask(user: any) {
    const task = user.gameData.currentTask
    const rewards = generateTaskRewards(task)
    
    // 添加奖励到仓库
    user.gameData.inventory.push(...rewards)
    
    // 给予经验值
    user.gameData.experience += task.experience || 10
    
    // 检查升级
    const newLevel = Math.floor(user.gameData.experience / 100) + 1
    if (newLevel > user.gameData.level) {
      user.gameData.level = newLevel
    }
    
    // 处理技能经验和等级
    const taskType = task.type || ''
    const skillExperience = (task.experience || 10) * 1.5
    
    if (taskType.includes('berry') || taskType.includes('herb')) {
      // 种植技能
      user.gameData.farmingExp += skillExperience
      const newFarmingLevel = Math.floor(user.gameData.farmingExp / 100) + 1
      if (newFarmingLevel > user.gameData.farmingLevel) {
        user.gameData.farmingLevel = newFarmingLevel
      }
    } else if (taskType.includes('mineral')) {
      // 采矿技能
      user.gameData.miningExp += skillExperience
      const newMiningLevel = Math.floor(user.gameData.miningExp / 100) + 1
      if (newMiningLevel > user.gameData.miningLevel) {
        user.gameData.miningLevel = newMiningLevel
      }
    } else if (taskType.includes('farm') || taskType.includes('agriculture')) {
      // 农业技能
      user.gameData.agricultureExp += skillExperience
      const newAgricultureLevel = Math.floor(user.gameData.agricultureExp / 100) + 1
      if (newAgricultureLevel > user.gameData.agricultureLevel) {
        user.gameData.agricultureLevel = newAgricultureLevel
      }
    } else if (taskType.includes('fishing') || taskType.includes('fish')) {
      // 钓鱼技能
      user.gameData.fishingExp += skillExperience
      const newFishingLevel = Math.floor(user.gameData.fishingExp / 100) + 1
      if (newFishingLevel > user.gameData.fishingLevel) {
        user.gameData.fishingLevel = newFishingLevel
      }
    }
    
    // 清除当前任务
    user.gameData.currentTask = null
    
    return rewards
  }

  // 获取任务奖励配置
  function getTaskRewards(taskType: string) {
    const rewardConfigs: { [key: string]: any[] } = {
      'berry': [
        { item: '蓝莓', quantity: 1, chance: 80 },
        { item: '草莓', quantity: 1, chance: 60 },
        { item: '葡萄', quantity: 1, chance: 40 },
        { item: '竹子', quantity: 1, chance: 1 }
      ],
      'herb': [
        { item: '普通草药', quantity: 1, chance: 70 },
        { item: '三叶草', quantity: 1, chance: 50 },
        { item: '嫩芽', quantity: 1, chance: 30 }
      ],
      'mineral': [
        { item: '普通石头', quantity: 1, chance: 90 },
        { item: '铜矿', quantity: 1, chance: 40 },
        { item: '银矿', quantity: 1, chance: 10 }
      ]
    }
    
    return rewardConfigs[taskType] || []
  }

  // 生成任务奖励
  function generateTaskRewards(task: any) {
    const rewards = []
    
    for (const reward of task.rewards || []) {
      if (Math.random() * 100 < reward.chance) {
        rewards.push({
          id: `${reward.item}_${Date.now()}_${Math.random()}`,
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

  // 辅助函数：获取任务名称
  function getTaskName(taskType: string): string {
    const taskNames: { [key: string]: string } = {
      'forest_collect': '森林采集',
      'mine_collect': '矿洞采集',
      'farm_collect': '农场采集',
      'fishing': '钓鱼'
    }
    return taskNames[taskType] || '未知任务'
  }
  
  // 辅助函数：获取任务持续时间（秒）
  function getTaskDuration(taskType: string): number {
    const durations: { [key: string]: number } = {
      'forest_collect': 300, // 5分钟
      'mine_collect': 600,   // 10分钟
      'farm_collect': 450,   // 7.5分钟
      'fishing': 360         // 6分钟
    }
    return durations[taskType] || 300
  }
  
  // 辅助函数：获取任务经验值
  function getTaskExperience(taskType: string): number {
    const experiences: { [key: string]: number } = {
      'forest_collect': 15,
      'mine_collect': 25,
      'farm_collect': 20,
      'fishing': 18
    }
    return experiences[taskType] || 10
  }
  
  // 辅助函数：获取任务技能类型
  function getTaskSkillType(taskType: string): string {
    const skillTypes: { [key: string]: string } = {
      'forest_collect': 'farming',
      'mine_collect': 'mining',
      'farm_collect': 'agriculture',
      'fishing': 'fishing'
    }
    return skillTypes[taskType] || 'farming'
  }
  
  // 辅助函数：获取任务奖励配置
  function getTaskRewards(taskType: string): any[] {
    const rewardConfigs: { [key: string]: any[] } = {
      'forest_collect': [
        { item: '蓝莓', quantity: 2, chance: 80 },
        { item: '草莓', quantity: 1, chance: 60 },
        { item: '葡萄', quantity: 1, chance: 40 },
        { item: '竹子', quantity: 1, chance: 5 }
      ],
      'mine_collect': [
        { item: '普通石头', quantity: 3, chance: 90 },
        { item: '铜矿', quantity: 2, chance: 40 },
        { item: '银矿', quantity: 1, chance: 15 },
        { item: '金矿', quantity: 1, chance: 3 }
      ],
      'farm_collect': [
        { item: '小麦', quantity: 4, chance: 85 },
        { item: '玉米', quantity: 3, chance: 70 },
        { item: '土豆', quantity: 2, chance: 55 },
        { item: '胡萝卜', quantity: 2, chance: 45 }
      ],
      'fishing': [
        { item: '小鱼', quantity: 2, chance: 80 },
        { item: '中鱼', quantity: 1, chance: 50 },
        { item: '大鱼', quantity: 1, chance: 20 },
        { item: '稀有鱼', quantity: 1, chance: 5 }
      ]
    }
    
    return rewardConfigs[taskType] || []
  }

  console.log('Socket.IO 服务器已启动')
})