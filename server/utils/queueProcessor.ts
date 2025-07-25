import { taskQueueDb, userDb, gameDataDb } from '~/server/database/db'
import type { TaskQueue } from '~/server/database/db'

// 队列处理器类
class QueueProcessor {
  private intervals: Map<number, NodeJS.Timeout> = new Map()
  private processingUsers: Set<number> = new Set()

  // 开始处理用户的队列
  startProcessing(userId: number, socketEmit?: (event: string, data: any) => void) {
    if (this.processingUsers.has(userId)) {
      return // 已经在处理中
    }

    this.processingUsers.add(userId)
    this.processUserQueue(userId, socketEmit)
  }

  // 停止处理用户的队列
  stopProcessing(userId: number) {
    const interval = this.intervals.get(userId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(userId)
    }
    this.processingUsers.delete(userId)
  }

  // 处理用户队列
  private async processUserQueue(userId: number, socketEmit?: (event: string, data: any) => void) {
    try {
      // 检查是否有正在运行的任务
      let currentTask = taskQueueDb.getCurrentRunningTask(userId)
      
      if (!currentTask) {
        // 没有正在运行的任务，尝试开始下一个
        const nextTask = taskQueueDb.getNextPendingTask(userId)
        if (nextTask) {
          currentTask = this.startTask(nextTask)
        }
      }

      if (currentTask) {
        // 设置任务进度更新定时器
        this.setupTaskProgressTimer(currentTask, socketEmit)
      } else {
        // 没有任务需要处理，停止处理
        this.stopProcessing(userId)
      }
    } catch (error) {
      console.error(`处理用户 ${userId} 队列时出错:`, error)
      this.stopProcessing(userId)
    }
  }

  // 开始执行任务
  private startTask(task: TaskQueue): TaskQueue {
    const now = new Date().toISOString()
    const endTime = new Date(Date.now() + task.duration * 1000).toISOString()
    
    const updatedTask = taskQueueDb.updateTask(task.id, {
      status: 'running',
      startTime: now,
      endTime: endTime,
      currentProgress: 0
    })

    console.log(`开始执行任务: ${task.taskName} (用户: ${task.userId})`)
    return updatedTask || task
  }

  // 设置任务进度更新定时器
  private setupTaskProgressTimer(task: TaskQueue, socketEmit?: (event: string, data: any) => void) {
    const userId = task.userId
    
    // 清除之前的定时器
    const existingInterval = this.intervals.get(userId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // 创建新的定时器
    const interval = setInterval(() => {
      this.updateTaskProgress(task, socketEmit)
    }, 1000) // 每秒更新一次

    this.intervals.set(userId, interval)
  }

  // 更新任务进度
  private updateTaskProgress(task: TaskQueue, socketEmit?: (event: string, data: any) => void) {
    try {
      const currentTask = taskQueueDb.findById(task.id)
      if (!currentTask || currentTask.status !== 'running') {
        this.stopProcessing(task.userId)
        return
      }

      const now = Date.now()
      const startTime = new Date(currentTask.startTime!).getTime()
      const endTime = new Date(currentTask.endTime!).getTime()
      
      if (now >= endTime) {
        // 任务完成
        this.completeTask(currentTask, socketEmit)
      } else {
        // 更新进度
        const elapsed = now - startTime
        const total = endTime - startTime
        const progress = Math.min((elapsed / total) * 100, 100)
        
        taskQueueDb.updateTask(currentTask.id, {
          currentProgress: Math.round(progress)
        })

        // 通过Socket发送进度更新
        if (socketEmit) {
          socketEmit('queue_progress', {
            taskId: currentTask.id,
            progress: Math.round(progress),
            remainingTime: endTime - now
          })
        }
      }
    } catch (error) {
      console.error('更新任务进度时出错:', error)
    }
  }

  // 完成任务
  private completeTask(task: TaskQueue, socketEmit?: (event: string, data: any) => void) {
    try {
      console.log(`任务完成: ${task.taskName} (用户: ${task.userId})`)
      
      // 生成奖励
      const rewards = this.generateRewards(task)
      
      // 更新用户数据
      this.updateUserProgress(task, rewards)
      
      // 减少剩余次数
      const newRemainingCount = task.remainingCount - 1
      
      if (newRemainingCount > 0) {
        // 还有剩余次数，重置任务状态为pending
        taskQueueDb.updateTask(task.id, {
          status: 'pending',
          remainingCount: newRemainingCount,
          currentProgress: 0,
          startTime: undefined,
          endTime: undefined
        })
      } else {
        // 所有次数完成，标记为已完成
        taskQueueDb.updateTask(task.id, {
          status: 'completed',
          remainingCount: 0,
          currentProgress: 100
        })
      }

      // 通过Socket发送任务完成通知
      if (socketEmit) {
        socketEmit('task_completed', {
          taskId: task.id,
          rewards,
          remainingCount: newRemainingCount,
          isFullyCompleted: newRemainingCount === 0
        })
      }

      // 清除当前任务的定时器
      const interval = this.intervals.get(task.userId)
      if (interval) {
        clearInterval(interval)
        this.intervals.delete(task.userId)
      }

      // 继续处理下一个任务
      setTimeout(() => {
        this.processUserQueue(task.userId, socketEmit)
      }, 1000) // 1秒后开始下一个任务
      
    } catch (error) {
      console.error('完成任务时出错:', error)
    }
  }

  // 生成奖励
  private generateRewards(task: TaskQueue) {
    const rewardConfigs = JSON.parse(task.rewards)
    const rewards: any[] = []
    
    for (const config of rewardConfigs) {
      if (Math.random() * 100 < config.chance) {
        const quantity = Array.isArray(config.quantity) 
          ? Math.floor(Math.random() * (config.quantity[1] - config.quantity[0] + 1)) + config.quantity[0]
          : config.quantity
        
        rewards.push({
          id: config.item,
          name: config.item,
          quantity,
          rarity: this.getItemRarity(config.item)
        })
      }
    }
    
    return rewards
  }

  // 获取物品稀有度
  private getItemRarity(itemName: string): string {
    const rarityMap: { [key: string]: string } = {
      '蓝莓': 'common',
      '草莓': 'common',
      '葡萄': 'uncommon',
      '竹子': 'legendary',
      '普通草药': 'common',
      '三叶草': 'uncommon',
      '嫩芽': 'rare',
      '普通石头': 'common',
      '铜矿': 'uncommon',
      '银矿': 'rare'
    }
    return rarityMap[itemName] || 'common'
  }

  // 更新用户进度
  private updateUserProgress(task: TaskQueue, rewards: any[]) {
    const userId = task.userId
    
    // 获取用户和游戏数据
    const user = userDb.findById(userId)
    const gameData = gameDataDb.findByUserId(userId)
    
    if (!user || !gameData) {
      console.error('用户或游戏数据不存在')
      return
    }

    // 添加奖励到背包
    const inventory = JSON.parse(gameData.inventory || '[]')
    for (const reward of rewards) {
      const existingItem = inventory.find((item: any) => item.name === reward.name)
      if (existingItem) {
        existingItem.quantity += reward.quantity
      } else {
        inventory.push({
          id: reward.id,
          name: reward.name,
          icon: this.getItemIcon(reward.name),
          quantity: reward.quantity,
          rarity: reward.rarity
        })
      }
    }

    // 更新经验和技能
    const newExp = user.experience + task.experience
    const newLevel = Math.floor(newExp / 100) + 1
    
    let skillUpdates: any = {}
    if (task.skillType === 'farming') {
      const newSkillExp = gameData.farmingExp + task.experience
      const newSkillLevel = Math.floor(newSkillExp / 100) + 1
      skillUpdates = {
        farmingExp: newSkillExp,
        farmingLevel: newSkillLevel
      }
    } else if (task.skillType === 'mining') {
      const newSkillExp = gameData.miningExp + task.experience
      const newSkillLevel = Math.floor(newSkillExp / 100) + 1
      skillUpdates = {
        miningExp: newSkillExp,
        miningLevel: newSkillLevel
      }
    } else if (task.skillType === 'agriculture' || task.skillType === '农业') {
      const newSkillExp = gameData.agricultureExp + task.experience
      const newSkillLevel = Math.floor(newSkillExp / 100) + 1
      skillUpdates = {
        agricultureExp: newSkillExp,
        agricultureLevel: newSkillLevel
      }
    } else if (task.skillType === 'fishing' || task.skillType === '钓鱼') {
      const newSkillExp = gameData.fishingExp + task.experience
      const newSkillLevel = Math.floor(newSkillExp / 100) + 1
      skillUpdates = {
        fishingExp: newSkillExp,
        fishingLevel: newSkillLevel
      }
    }

    // 更新数据库
    userDb.update(userId, {
      experience: newExp,
      level: newLevel
    })
    
    gameDataDb.update(userId, {
      inventory: JSON.stringify(inventory),
      ...skillUpdates
    })
  }

  // 获取物品图标
  private getItemIcon(itemName: string): string {
    const iconMap: { [key: string]: string } = {
      '蓝莓': '🍎',
      '草莓': '🍓',
      '葡萄': '🍇',
      '竹子': '🎋',
      '普通草药': '🌿',
      '三叶草': '🍀',
      '嫩芽': '🌱',
      '普通石头': '🪨',
      '铜矿': '🟫',
      '银矿': '⚪'
    }
    return iconMap[itemName] || '❓'
  }

  // 获取所有正在处理的用户
  getProcessingUsers(): number[] {
    return Array.from(this.processingUsers)
  }

  // 停止所有处理
  stopAll() {
    for (const [userId, interval] of this.intervals) {
      clearInterval(interval)
    }
    this.intervals.clear()
    this.processingUsers.clear()
  }
}

// 创建全局队列处理器实例
export const queueProcessor = new QueueProcessor()

// 在服务器关闭时清理
process.on('SIGTERM', () => {
  queueProcessor.stopAll()
})

process.on('SIGINT', () => {
  queueProcessor.stopAll()
})