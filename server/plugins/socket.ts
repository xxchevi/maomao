import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
let io: Server

interface AuthenticatedSocket extends Socket {
  userId?: string
  characterId?: string
}
interface QueueItem {
  id: string
  [key: string]: any // 允许其他动态属性
}
export default defineNitroPlugin(async (nitroApp) => {
  // 只在开发环境或生产环境中初始化Socket.io
  if (process.env.NODE_ENV !== 'test') {
    const { Server } = await import('socket.io')
    
    nitroApp.hooks.hook('close', async () => {
      if (io) {
        io.close()
      }
    })
    
    nitroApp.hooks.hook('request', async (event) => {
      const httpServer = (event.node.res as any).socket?.server || (event.node.res as any).connection?.server;
      if (!io && httpServer) {
        io = new Server(httpServer, {
          cors: {
            origin: "*",
            methods: ["GET", "POST"]
          }
        })

        // 认证中间件
        io.use(async (socket: any, next) => {
          try {
            const token = socket.handshake.auth.token
            if (!token) {
              return next(new Error('No token provided'))
            }

            const config = useRuntimeConfig()
            const decoded = jwt.verify(token, config.jwtSecret) as any
            
            const character = await prisma.character.findUnique({
              where: { userId: decoded.userId }
            })

            if (!character) {
              return next(new Error('Character not found'))
            }

            socket.userId = decoded.userId
            socket.characterId = character.id
            next()
          } catch (error) {
            next(new Error('Authentication failed'))
          }
        })

        // 连接处理
        io.on('connection', (socket: AuthenticatedSocket) => {
          console.log(`User ${socket.userId} connected`)

          // 加入用户房间
          socket.join(`user:${socket.userId}`)

          // 处理开始活动
          socket.on('start_activity', async (data) => {
            try {
              const { type, resourceId } = data
              
              // 验证资源点
              const resource = await prisma.gameResource.findUnique({
                where: { id: resourceId }
              })

              if (!resource) {
                socket.emit('error', { message: '资源点不存在' })
                return
              }

              // 验证角色等级
              const character = await prisma.character.findUnique({
                where: { id: socket.characterId }
              })

              if (!character) {
                socket.emit('error', { message: '角色不存在' })
                return
              }

              const skillLevel = getSkillLevel(character, type)
              if (skillLevel < resource.levelReq) {
                socket.emit('error', { message: `需要 ${type} 等级 ${resource.levelReq}` })
                return
              }

              // 开始活动进度模拟
              startActivity(socket, resource, type)
            } catch (error) {
              socket.emit('error', { message: '开始活动失败' })
            }
          })

          // 处理停止活动
          socket.on('stop_activity', () => {
            stopActivity(socket)
          })

          // 队列相关事件
          socket.on('add_to_queue', async (queueData) => {
            await addToQueue(socket, queueData)
          })

          socket.on('start_immediately', async (queueData) => {
            await startImmediately(socket, queueData)
          })

          socket.on('stop_current_queue', async () => {
            await stopCurrentQueue(socket)
          })

          socket.on('remove_from_queue', async (queueId) => {
            await removeFromQueue(socket, queueId)
          })

          // 恢复队列状态
          socket.on('restore_queues', async () => {
            try {
              const queues = await getUserQueues(socket.characterId!)
              socket.emit('queue_updated', queues.pending)
              
              // 如果有当前正在进行的队列，恢复进度
              if (queues.current) {
                const queueId = `${socket.characterId}:queue`
                const existingActivity = activeQueues.get(queueId)
                
                if (!existingActivity) {
                  // 重新开始当前队列
                  await startQueueActivity(socket, queues.current)
                }
              }
            } catch (error) {
              console.error('Restore queues error:', error)
              socket.emit('error', { message: '恢复队列状态失败' })
            }
          })

          // 断开连接
          socket.on('disconnect', () => {
            console.log(`User ${socket.userId} disconnected`)
            stopActivity(socket)
            stopCurrentQueue(socket)
          })
        })
      }
    })
  }
})

// 活动管理
const activeActivities = new Map()
// 队列管理
const userQueues = new Map() // 存储用户队列数据
const activeQueues = new Map() // 存储正在执行的队列

function startActivity(socket: AuthenticatedSocket, resource: any, type: string) {
  // 停止之前的活动
  stopActivity(socket)

  const activityId = `${socket.characterId}:${type}`
  const duration = resource.baseTime * 1000 // 转换为毫秒
  const startTime = Date.now()

  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const progress = Math.min((elapsed / duration) * 100, 100)

    socket.emit('activity_progress', { progress })

    if (progress >= 100) {
      completeActivity(socket, resource, type)
    }
  }, 100)

  activeActivities.set(activityId, {
    interval,
    resource,
    type,
    startTime
  })
}

function stopActivity(socket: AuthenticatedSocket) {
  const activityId = `${socket.characterId}:mining`
  const gatheringId = `${socket.characterId}:gathering`
  const fishingId = `${socket.characterId}:fishing`

  for (const id of [activityId, gatheringId, fishingId]) {
    const activity = activeActivities.get(id)
    if (activity) {
      clearInterval(activity.interval)
      activeActivities.delete(id)
    }
  }
}

async function completeActivity(socket: AuthenticatedSocket, resource: any, type: string) {
  try {
    const activityId = `${socket.characterId}:${type}`
    stopActivity(socket)

    // 获取角色信息
    const character = await prisma.character.findUnique({
      where: { id: socket.characterId }
    })

    if (!character) return

    // 计算奖励
    const expReward = resource.expReward
    const shouldDropItem = Math.random() < resource.dropRate

    // 更新角色数据
    const updates: any = {
      exp: character.exp + expReward
    }

    // 更新技能经验
    switch (type) {
      case 'mining':
        updates.miningExp = character.miningExp + expReward
        const newMiningLevel = calculateLevel(updates.miningExp)
        if (newMiningLevel > character.miningLevel) {
          updates.miningLevel = newMiningLevel
        }
        break
      case 'gathering':
        updates.gatheringExp = character.gatheringExp + expReward
        const newGatheringLevel = calculateLevel(updates.gatheringExp)
        if (newGatheringLevel > character.gatheringLevel) {
          updates.gatheringLevel = newGatheringLevel
        }
        break
      case 'fishing':
        updates.fishingExp = character.fishingExp + expReward
        const newFishingLevel = calculateLevel(updates.fishingExp)
        if (newFishingLevel > character.fishingLevel) {
          updates.fishingLevel = newFishingLevel
        }
        break
    }

    // 检查角色等级
    const newLevel = calculateLevel(updates.exp)
    if (newLevel > character.level) {
      updates.level = newLevel
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: socket.characterId },
      data: updates
    })

    // 添加物品到仓库
    if (shouldDropItem) {
      const existingItem = await prisma.inventoryItem.findUnique({
        where: {
          characterId_itemId: {
            characterId: socket.characterId!,
            itemId: resource.itemId
          }
        }
      })

      if (existingItem) {
        await prisma.inventoryItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + 1 }
        })
      } else {
        await prisma.inventoryItem.create({
          data: {
            characterId: socket.characterId!,
            itemId: resource.itemId,
            quantity: 1
          }
        })
      }
    }

    // 发送更新
    socket.emit('character_updated', updatedCharacter)
    socket.emit('activity_completed', {
      message: `获得 ${expReward} 经验${shouldDropItem ? ' 和 1 个物品' : ''}`,
      expReward,
      itemDropped: shouldDropItem
    })

    // 发送更新的仓库
    const inventory = await prisma.inventoryItem.findMany({
      where: { characterId: socket.characterId },
      include: { item: true }
    })
    socket.emit('inventory_updated', inventory)

  } catch (error) {
    console.error('Complete activity error:', error)
    socket.emit('error', { message: '完成活动时发生错误' })
  }
}

function getSkillLevel(character: any, type: string) {
  switch (type) {
    case 'mining':
      return character.miningLevel
    case 'gathering':
      return character.gatheringLevel
    case 'fishing':
      return character.fishingLevel
    case 'cooking':
      return character.cookingLevel
    case 'crafting':
      return character.craftingLevel
    default:
      return 1
  }
}

function calculateLevel(exp: number) {
  return Math.floor(Math.sqrt(exp / 100)) + 1
}

// 队列管理函数
async function getUserQueues(characterId: string) {
  if (!userQueues.has(characterId)) {
    // 从数据库恢复离线队列
    await restoreOfflineQueues(characterId)
  }
  return userQueues.get(characterId)
}

// 恢复离线队列
async function restoreOfflineQueues(characterId: string) {
  try {
    // 获取角色信息
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { offlineTasks: { where: { status: 'active' } } }
    })
    
    if (!character) return
    
    const queues = {
      current: null,
      pending: []
    }
    
    // 计算离线时间
    const offlineTime = Date.now() - new Date(character.lastOnline).getTime()
    
    // 处理离线任务
    for (const task of character.offlineTasks) {
      const taskDuration = task.duration * 1000 // 转换为毫秒
      const taskStartTime = new Date(task.startedAt).getTime()
      const taskElapsed = Date.now() - taskStartTime
      
      if (taskElapsed >= taskDuration) {
        // 任务已完成，处理奖励
        await completeOfflineTask(task)
      } else {
        // 任务仍在进行中，恢复到队列
        const resource = await prisma.gameResource.findFirst({
          where: { type: task.type }
        })
        
        if (resource) {
          const queueData = {
            id: task.id,
            activityType: task.type,
            resourceId: resource.id,
            resourceName: resource.name,
            totalRepeat: 1,
            currentRepeat: 1,
            progress: Math.min((taskElapsed / taskDuration) * 100, 100),
            remainingTime: Math.max(0, Math.ceil((taskDuration - taskElapsed) / 1000)),
            estimatedTime: resource.baseTime,
            createdAt: taskStartTime
          }
          
          if (!queues.current) {
            queues.current = queueData
          } else {
            queues.pending.push(queueData)
          }
        }
      }
    }
    
    userQueues.set(characterId, queues)
    
    // 更新最后在线时间
    await prisma.character.update({
      where: { id: characterId },
      data: { lastOnline: new Date() }
    })
    
  } catch (error) {
    console.error('Error restoring offline queues:', error)
    userQueues.set(characterId, {
      current: null,
      pending: []
    })
  }
}

// 完成离线任务
async function completeOfflineTask(task: any) {
  try {
    // 标记任务为完成
    await prisma.offlineTask.update({
      where: { id: task.id },
      data: { 
        status: 'completed',
        completedAt: new Date()
      }
    })
    
    // 处理奖励（经验、物品等）
    if (task.expReward > 0) {
      const character = await prisma.character.findUnique({
        where: { id: task.characterId }
      })
      
      if (character) {
        const skillField = getSkillField(task.type)
        const expField = getExpField(task.type)
        
        if (skillField && expField) {
          const newExp = character[expField] + task.expReward
          const newLevel = calculateLevel(newExp)
          
          await prisma.character.update({
            where: { id: task.characterId },
            data: {
              [expField]: newExp,
              [skillField]: newLevel
            }
          })
        }
      }
    }
    
    // 处理物品奖励
    if (task.itemRewards) {
      const rewards = JSON.parse(task.itemRewards)
      for (const reward of rewards) {
        await addItemToInventory(task.characterId, reward.itemId, reward.quantity)
      }
    }
    
  } catch (error) {
    console.error('Error completing offline task:', error)
  }
}

// 保存队列到数据库
async function saveQueueToDatabase(characterId: string, queueData: any) {
  try {
    const resource = await prisma.gameResource.findUnique({
      where: { id: queueData.resourceId }
    })
    
    if (!resource) return
    
    // 创建或更新离线任务
    await prisma.offlineTask.upsert({
      where: { id: queueData.id },
      update: {
        type: queueData.activityType,
        duration: resource.baseTime * (queueData.totalRepeat || 1),
        progress: queueData.progress || 0,
        expReward: resource.expReward * (queueData.totalRepeat || 1),
        startedAt: new Date(queueData.createdAt || Date.now())
      },
      create: {
        id: queueData.id,
        characterId,
        type: queueData.activityType,
        duration: resource.baseTime * (queueData.totalRepeat || 1),
        progress: queueData.progress || 0,
        expReward: resource.expReward * (queueData.totalRepeat || 1),
        startedAt: new Date(queueData.createdAt || Date.now())
      }
    })
  } catch (error) {
    console.error('Error saving queue to database:', error)
  }
}

// 取消数据库中的队列
async function cancelQueueInDatabase(queueId: string) {
  try {
    await prisma.offlineTask.updateMany({
      where: { 
        id: queueId,
        status: 'active'
      },
      data: { 
        status: 'cancelled'
      }
    })
  } catch (error) {
    console.error('Error cancelling queue in database:', error)
  }
}

// 获取技能字段名
function getSkillField(activityType: string): string | null {
  const skillMap: { [key: string]: string } = {
    'mining': 'miningLevel',
    'gathering': 'gatheringLevel', 
    'fishing': 'fishingLevel',
    'cooking': 'cookingLevel',
    'crafting': 'craftingLevel'
  }
  return skillMap[activityType] || null
}

// 获取经验字段名
function getExpField(activityType: string): string | null {
  const expMap: { [key: string]: string } = {
    'mining': 'miningExp',
    'gathering': 'gatheringExp',
    'fishing': 'fishingExp', 
    'cooking': 'cookingExp',
    'crafting': 'craftingExp'
  }
  return expMap[activityType] || null
}

async function addToQueue(socket: AuthenticatedSocket, queueData: any) {
  const queues = await getUserQueues(socket.characterId!)
  queues.pending.push(queueData)
  
  // 持久化队列到数据库
  await saveQueueToDatabase(socket.characterId!, queueData)
  
  // 通知客户端队列更新
  socket.emit('queue_updated', queues.pending)
}

async function startImmediately(socket: AuthenticatedSocket, queueData: any) {
  const queues = await getUserQueues(socket.characterId!)
  
  // 先停止当前正在运行的队列活动
  const queueId = `${socket.characterId}:queue`
  const activity = activeQueues.get(queueId)
  if (activity) {
    clearInterval(activity.interval)
    activeQueues.delete(queueId)
  }
  
  // 如果有当前队列，将其移到待开始队列的第一位
  if (queues.current) {
    queues.pending.unshift(queues.current)
    await saveQueueToDatabase(socket.characterId!, queues.current)
  }
  
  // 开始新队列，确保设置初始重复次数
  queueData.currentRepeat = queueData.currentRepeat || 1
  queues.current = queueData
  
  // 持久化当前队列
  await saveQueueToDatabase(socket.characterId!, queueData)
  
  startQueueActivity(socket, queueData)
  
  // 通知客户端
  socket.emit('queue_updated', queues.pending)
}

async function stopCurrentQueue(socket: AuthenticatedSocket) {
  const queues = await getUserQueues(socket.characterId!)
  const queueId = `${socket.characterId}:queue`
  
  // 停止当前队列活动
  const activity = activeQueues.get(queueId)
  if (activity) {
    clearInterval(activity.interval)
    activeQueues.delete(queueId)
  }
  
  // 取消数据库中的当前任务
  if (queues.current) {
    await cancelQueueInDatabase(queues.current.id)
  }
  
  queues.current = null
  
  // 自动开始下一个队列
  if (queues.pending.length > 0) {
    const nextQueue = queues.pending.shift()
    queues.current = nextQueue
    await saveQueueToDatabase(socket.characterId!, nextQueue)
    startQueueActivity(socket, nextQueue)
    socket.emit('queue_updated', queues.pending)
  }
}

async function removeFromQueue(socket: AuthenticatedSocket, queueId: string) {
  const queues = await getUserQueues(socket.characterId!)
  const index = queues.pending.findIndex((q:QueueItem) => q.id === queueId)
  
  if (index !== -1) {
    queues.pending.splice(index, 1)
    await cancelQueueInDatabase(queueId)
    socket.emit('queue_updated', queues.pending)
  }
}

async function startQueueActivity(socket: AuthenticatedSocket, queueData: any) {
  try {
    // 获取资源信息
    const resource = await prisma.gameResource.findUnique({
      where: { id: queueData.resourceId }
    })
    
    if (!resource) {
      socket.emit('error', { message: '资源点不存在' })
      return
    }
    
    const queueId = `${socket.characterId}:queue`
    
    // 检查是否已有活动在运行，如果有则先停止
    const existingActivity = activeQueues.get(queueId)
    if (existingActivity) {
      clearInterval(existingActivity.interval)
      activeQueues.delete(queueId)
    }
    
    const duration = resource.baseTime * 1000 // 转换为毫秒
    const startTime = Date.now()
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      const remainingTime = Math.max(0, duration - elapsed)
      
      // 发送进度更新
      socket.emit('queue_progress', {
        progress,
        remainingTime: Math.ceil(remainingTime / 1000),
        currentRepeat: queueData.currentRepeat || 1,
        totalRepeat: queueData.totalRepeat || 1
      })
      
      if (progress >= 100) {
        completeQueueActivity(socket, queueData, resource)
      }
    }, 100)
    
    activeQueues.set(queueId, {
      interval,
      queueData,
      resource,
      startTime
    })
    
  } catch (error) {
    console.error('Start queue activity error:', error)
    socket.emit('error', { message: '开始队列活动失败' })
  }
}

async function completeQueueActivity(socket: AuthenticatedSocket, queueData: any, resource: any) {
  try {
    const queueId = `${socket.characterId}:queue`
    const activity = activeQueues.get(queueId)
    
    // 确保清理当前活动
    if (activity) {
      clearInterval(activity.interval)
      activeQueues.delete(queueId)
    }
    
    // 处理奖励（复用原有逻辑）
    await processActivityReward(socket, resource, queueData.activityType)
    
    const queues = await getUserQueues(socket.characterId!)
    
    // 确保有正确的重复次数设置
    const currentRepeat = queueData.currentRepeat || 1
    const totalRepeat = queueData.totalRepeat || 1
    
    // 检查是否还有重复次数
    if (currentRepeat < totalRepeat) {
      // 更新重复次数并继续
      queueData.currentRepeat = currentRepeat + 1
      
      // 更新数据库中的任务进度
      await saveQueueToDatabase(socket.characterId!, queueData)
      
      // 延迟一小段时间再开始下一次，避免立即重复
      setTimeout(() => {
        startQueueActivity(socket, queueData)
      }, 100)
    } else {
      // 队列完成，标记数据库任务为完成
      await prisma.offlineTask.updateMany({
        where: { 
          id: queueData.id,
          status: 'active'
        },
        data: { 
          status: 'completed',
          completedAt: new Date()
        }
      })
      
      queues.current = null
      socket.emit('queue_completed', {
        message: `队列完成: ${queueData.resourceName} x${totalRepeat}`
      })
      
      // 自动开始下一个队列
      if (queues.pending.length > 0) {
        const nextQueue = queues.pending.shift()
        nextQueue.currentRepeat = 1
        queues.current = nextQueue
        
        // 持久化新的当前队列
        await saveQueueToDatabase(socket.characterId!, nextQueue)
        
        // 延迟一小段时间再开始下一个队列
        setTimeout(() => {
          startQueueActivity(socket, nextQueue)
        }, 100)
        socket.emit('queue_updated', queues.pending)
      }
    }
    
  } catch (error) {
    console.error('Complete queue activity error:', error)
    socket.emit('error', { message: '完成队列活动时发生错误' })
  }
}

async function processActivityReward(socket: AuthenticatedSocket, resource: any, type: string) {
  // 获取角色信息
  const character = await prisma.character.findUnique({
    where: { id: socket.characterId }
  })
  
  if (!character) return
  
  // 计算奖励
  const expReward = resource.expReward
  
  // 更新角色数据
  const updates: any = {
    exp: character.exp + expReward
  }
  
  // 获取当前技能等级用于掉落计算
  let currentSkillLevel = 1
  
  // 更新技能经验并获取当前技能等级
  switch (type) {
    case 'mining':
      updates.miningExp = character.miningExp + expReward
      currentSkillLevel = character.miningLevel
      const newMiningLevel = calculateLevel(updates.miningExp)
      if (newMiningLevel > character.miningLevel) {
        updates.miningLevel = newMiningLevel
      }
      break
    case 'gathering':
      updates.gatheringExp = character.gatheringExp + expReward
      currentSkillLevel = character.gatheringLevel
      const newGatheringLevel = calculateLevel(updates.gatheringExp)
      if (newGatheringLevel > character.gatheringLevel) {
        updates.gatheringLevel = newGatheringLevel
      }
      break
    case 'fishing':
      updates.fishingExp = character.fishingExp + expReward
      currentSkillLevel = character.fishingLevel
      const newFishingLevel = calculateLevel(updates.fishingExp)
      if (newFishingLevel > character.fishingLevel) {
        updates.fishingLevel = newFishingLevel
      }
      break
  }
  
  // 检查角色等级
  const newLevel = calculateLevel(updates.exp)
  if (newLevel > character.level) {
    updates.level = newLevel
  }
  
  const updatedCharacter = await prisma.character.update({
    where: { id: socket.characterId },
    data: updates
  })
  
  // 改进的物品掉落系统
  const droppedItems = await calculateItemDrops(type, currentSkillLevel, resource)
  
  // 添加掉落的物品到仓库
  for (const drop of droppedItems) {
    const existingItem = await prisma.inventoryItem.findUnique({
      where: {
        characterId_itemId: {
          characterId: socket.characterId!,
          itemId: drop.itemId
        }
      }
    })
    
    if (existingItem) {
      await prisma.inventoryItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + drop.quantity }
      })
    } else {
      await prisma.inventoryItem.create({
        data: {
          characterId: socket.characterId!,
          itemId: drop.itemId,
          quantity: drop.quantity
        }
      })
    }
  }
  
  // 发送更新
  socket.emit('character_updated', updatedCharacter)
  
  // 发送更新的仓库
  const inventory = await prisma.inventoryItem.findMany({
    where: { characterId: socket.characterId },
    include: { item: true }
  })
  socket.emit('inventory_updated', inventory)
  
  // 发送掉落通知
  if (droppedItems.length > 0) {
    const itemNames = await Promise.all(
      droppedItems.map(async (drop) => {
        const item = await prisma.item.findUnique({ where: { id: drop.itemId } })
        return `${item?.name} x${drop.quantity}`
      })
    )
    socket.emit('item_dropped', {
      message: `获得物品: ${itemNames.join(', ')}`,
      items: droppedItems
    })
  }
}

// 新增：计算物品掉落的函数
async function calculateItemDrops(activityType: string, skillLevel: number, resource: any) {
  const drops: Array<{ itemId: string; quantity: number }> = []
  
  // 基础掉落：资源点的主要物品
  const baseDropRate = Math.min(0.8 + (skillLevel * 0.01), 0.95) // 80%基础掉落率，技能等级每级+1%，最高95%
  if (Math.random() < baseDropRate) {
    drops.push({ itemId: resource.itemId, quantity: 1 })
  }
  
  // 根据活动类型获取可能的额外掉落物品
  const possibleItems = await getPossibleDropsByActivity(activityType, skillLevel)
  
  // 计算额外掉落
  for (const item of possibleItems) {
    const dropChance = item.dropRate * (1 + skillLevel * 0.005) // 技能等级影响掉落率
    if (Math.random() < dropChance) {
      drops.push({ itemId: item.id, quantity: 1 })
    }
  }
  
  return drops
}

// 新增：根据活动类型获取可能的掉落物品
async function getPossibleDropsByActivity(activityType: string, skillLevel: number) {
  const items = []
  
  switch (activityType) {
    case 'mining':
      // 挖矿可能掉落的物品
      const miningItems = await prisma.item.findMany({
        where: {
          type: 'material',
          name: {
            contains: '矿石'
          }
        }
      })
      
      for (const item of miningItems) {
        let dropRate = 0
        switch (item.rarity) {
          case 'common': dropRate = skillLevel >= 1 ? 0.15 : 0; break
          case 'uncommon': dropRate = skillLevel >= 10 ? 0.08 : 0; break
          case 'rare': dropRate = skillLevel >= 25 ? 0.04 : 0; break
          case 'epic': dropRate = skillLevel >= 40 ? 0.02 : 0; break
          case 'legendary': dropRate = skillLevel >= 60 ? 0.01 : 0; break
        }
        if (dropRate > 0) {
          items.push({ ...item, dropRate })
        }
      }
      break
      
    case 'gathering':
      // 采集可能掉落的物品
      const gatheringItems = await prisma.item.findMany({
        where: {
          OR: [
            { name: { contains: '草' } },
            { name: { contains: '莓' } },
            { name: { contains: '药' } },
            { name: { contains: '花' } },
            { name: { contains: '叶' } },
            { name: { contains: '果实' } }
          ]
        }
      })
      
      for (const item of gatheringItems) {
        let dropRate = 0
        switch (item.rarity) {
          case 'common': dropRate = skillLevel >= 1 ? 0.12 : 0; break
          case 'uncommon': dropRate = skillLevel >= 8 ? 0.06 : 0; break
          case 'rare': dropRate = skillLevel >= 20 ? 0.03 : 0; break
          case 'epic': dropRate = skillLevel >= 35 ? 0.015 : 0; break
          case 'legendary': dropRate = skillLevel >= 55 ? 0.008 : 0; break
        }
        if (dropRate > 0) {
          items.push({ ...item, dropRate })
        }
      }
      break
      
    case 'fishing':
      // 钓鱼可能掉落的物品
      const fishingItems = await prisma.item.findMany({
        where: {
          name: {
            contains: '鱼'
          }
        }
      })
      
      for (const item of fishingItems) {
        let dropRate = 0
        switch (item.rarity) {
          case 'common': dropRate = skillLevel >= 1 ? 0.18 : 0; break
          case 'uncommon': dropRate = skillLevel >= 12 ? 0.09 : 0; break
          case 'rare': dropRate = skillLevel >= 28 ? 0.045 : 0; break
          case 'epic': dropRate = skillLevel >= 45 ? 0.02 : 0; break
          case 'legendary': dropRate = skillLevel >= 65 ? 0.01 : 0; break
        }
        if (dropRate > 0) {
          items.push({ ...item, dropRate })
        }
      }
      break
  }
  
  return items
}