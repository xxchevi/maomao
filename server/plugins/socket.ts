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
            console.log(`[SERVER] 用户 ${socket.characterId} 请求添加到队列:`, queueData)
            await addToQueue(socket, queueData)
          })

          socket.on('start_immediately', async (queueData) => {
            console.log(`[SERVER] 用户 ${socket.characterId} 请求立即开始:`, queueData)
            await startImmediately(socket, queueData)
          })

          socket.on('stop_current_queue', async () => {
            console.log(`[SERVER] 用户 ${socket.characterId} 请求停止当前队列`)
            await stopCurrentQueueByUser(socket)
          })

          socket.on('remove_from_queue', async (queueId) => {
            console.log(`[SERVER] 用户 ${socket.characterId} 请求移除队列:`, queueId)
            await removeFromQueue(socket, queueId)
          })

          // 测试：清理并创建测试数据
          socket.on('test_create_queue', async () => {
            console.log(`[SERVER] 创建测试队列数据`)
            try {
              // 清理所有cancelled任务
              await prisma.offlineTask.deleteMany({
                where: {
                  characterId: socket.characterId!,
                  status: 'cancelled'
                }
              })
              
              // 获取一个挖矿资源
              const resource = await prisma.gameResource.findFirst({
                where: { type: 'mining' }
              })
              
              if (resource) {
                // 创建一个测试队列
                const testQueue = {
                  id: `test_queue_${Date.now()}`,
                  characterId: socket.characterId!,
                  type: 'mining',
                  targetId: resource.id,
                  duration: resource.baseTime * 1000,
                  progress: 0,
                  totalRepeat: 1000,
                  currentRepeat: 1,
                  expReward: resource.expReward * 1000,
                  startedAt: new Date(),
                  status: 'active'
                }
                
                await prisma.offlineTask.create({
                  data: testQueue
                })
                
                console.log(`[SERVER] 创建测试队列成功:`, testQueue)
                socket.emit('test_queue_created', { message: '测试队列已创建' })
              }
            } catch (error) {
              console.error('[SERVER] 创建测试队列失败:', error)
            }
          })

          // 恢复队列状态
  socket.on('restore_queues', async () => {
    console.log(`[SERVER] 用户 ${socket.characterId} 请求恢复队列状态`)
    try {
      // 先查询所有该用户的离线任务
      const allTasks = await prisma.offlineTask.findMany({
        where: {
          characterId: socket.characterId!
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
      
      console.log(`[SERVER] 数据库中该用户所有离线任务:`, allTasks.map(t => ({ id: t.id, status: t.status, type: t.type, totalRepeat: t.totalRepeat, currentRepeat: t.currentRepeat })))
      
      // 直接从数据库获取离线任务
      const offlineTasks = await prisma.offlineTask.findMany({
        where: {
          characterId: socket.characterId!,
          status: 'active'
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
      
      console.log(`[SERVER] 从数据库获取到 ${offlineTasks.length} 个活跃的离线任务`)
      
      // 获取资源信息
      const resourceIds = offlineTasks.map(task => task.targetId).filter(Boolean)
      const resources = await prisma.gameResource.findMany({
        where: {
          id: { in: resourceIds }
        }
      })
      
      const resourceMap = new Map(resources.map(r => [r.id, r]))
      
      // 转换为队列格式
      const pending = offlineTasks.map(task => {
        const resource = resourceMap.get(task.targetId || '')
        const baseTime = resource?.baseTime || 10
        const totalRepeat = task.totalRepeat || 1
        const currentRepeat = task.currentRepeat || 1
        
        return {
          id: task.id,
          activityType: task.type,
          resourceId: task.targetId,
          resourceName: resource?.name || '未知资源',
          repeatCount: totalRepeat,
          currentRepeat: currentRepeat,
          totalRepeat: totalRepeat,
          baseTime: baseTime,
          expReward: resource?.expReward || 10,
          progress: 0, // 恢复时重置进度
          remainingTime: baseTime, // 设置剩余时间为基础时间
          estimatedTime: baseTime * (totalRepeat - currentRepeat + 1), // 计算剩余预计时间
          createdAt: task.createdAt.toISOString()
        }
      })
      
      console.log(`[SERVER] 转换后的队列数据:`, pending)
      
      // 检查是否有正在执行的队列
      const queueId = `${socket.characterId}:queue`
      const currentActivity = activeQueues.get(queueId)
      
      if (currentActivity && currentActivity.queueData) {
        // 有正在执行的队列，将其设为当前队列，其余为待处理队列
        const currentQueue = pending.find(q => q.id === currentActivity.queueData.id)
        const pendingQueues = pending.filter(q => q.id !== currentActivity.queueData.id)
        
        if (currentQueue) {
          socket.emit('current_queue_updated', currentQueue)
          console.log(`[SERVER] 发送current_queue_updated事件:`, currentQueue)
        }
        
        socket.emit('queue_updated', pendingQueues)
        console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pendingQueues.length}`)
      } else {
        // 没有正在执行的队列
        socket.emit('current_queue_updated', null)
        
        if (pending.length > 0) {
          console.log(`[SERVER] 开始执行第一个队列任务:`, pending[0])
          
          // 确保队列数据包含正确的进度信息
          const firstQueue = {
            ...pending[0],
            progress: 0, // 重新开始时进度为0
            remainingTime: pending[0].baseTime // 剩余时间为基础时间
          }
          
          startQueueActivity(socket, firstQueue)
          
          // 第一个队列开始执行，其余为待处理队列
          socket.emit('current_queue_updated', firstQueue)
          socket.emit('queue_updated', pending.slice(1))
          console.log(`[SERVER] 发送current_queue_updated事件:`, firstQueue)
          console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pending.slice(1).length}`)
        } else {
          socket.emit('queue_updated', [])
          console.log(`[SERVER] 没有待处理的队列任务`)
        }
      }
    } catch (error) {
      console.error('[SERVER] 恢复队列状态失败:', error)
      socket.emit('queue_updated', [])
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

// 队列管理函数已移除，现在完全通过Socket直接操作数据库

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
  console.log(`[SERVER] saveQueueToDatabase - 保存队列到数据库，用户: ${characterId}，数据:`, queueData)
  try {
    const resource = await prisma.gameResource.findUnique({
      where: { id: queueData.resourceId }
    })
    
    if (!resource) {
      console.log(`[SERVER] 资源不存在，无法保存队列: ${queueData.resourceId}`)
      return
    }
    
    const taskData = {
      type: queueData.activityType,
      targetId: queueData.resourceId,
      duration: resource.baseTime * (queueData.totalRepeat || 1),
      progress: queueData.progress || 0,
      totalRepeat: queueData.totalRepeat || 1,
      currentRepeat: queueData.currentRepeat || 1,
      expReward: resource.expReward * (queueData.totalRepeat || 1),
      startedAt: new Date(queueData.createdAt || Date.now()),
      status: 'active'
    }
    
    console.log(`[SERVER] 准备创建/更新离线任务:`, taskData)
    
    // 创建或更新离线任务
    const savedTask = await prisma.offlineTask.upsert({
      where: { id: queueData.id },
      update: taskData,
      create: {
        id: queueData.id,
        characterId,
        ...taskData
      }
    })
    
    console.log(`[SERVER] 离线任务保存成功:`, savedTask)
  } catch (error) {
    console.error('[SERVER] 保存队列到数据库失败:', error)
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
  console.log(`[SERVER] addToQueue开始处理，用户: ${socket.characterId}，数据:`, queueData)
  try {
    // 创建新队列数据
    const newQueue = {
      ...queueData,
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    console.log(`[SERVER] 创建新队列数据:`, newQueue)
    
    // 保存到数据库
    console.log(`[SERVER] 保存队列到数据库`)
    await saveQueueToDatabase(socket.characterId!, newQueue)
    
    // 获取当前所有待处理队列
    const offlineTasks = await prisma.offlineTask.findMany({
      where: {
        characterId: socket.characterId!,
        status: 'active'
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    // 获取资源信息并转换为队列格式
    const resourceIds = offlineTasks.map(task => task.targetId).filter(Boolean)
    const resources = await prisma.gameResource.findMany({
      where: {
        id: { in: resourceIds }
      }
    })
    
    const resourceMap = new Map(resources.map(r => [r.id, r]))
    
    const pending = offlineTasks.map(task => {
      const resource = resourceMap.get(task.targetId || '')
      const baseTime = resource?.baseTime || 10
      const totalRepeat = task.totalRepeat || 1
      return {
        id: task.id,
        activityType: task.type,
        resourceId: task.targetId,
        resourceName: resource?.name || '未知资源',
        repeatCount: totalRepeat,
        currentRepeat: task.currentRepeat || 1,
        totalRepeat: totalRepeat,
        baseTime: baseTime,
        expReward: resource?.expReward || 10,
        progress: 0,
        remainingTime: baseTime,
        estimatedTime: baseTime * totalRepeat,
        createdAt: task.createdAt.toISOString()
      }
    })
    
    console.log(`[SERVER] 当前待处理队列数量: ${pending.length}`)
    
    // 检查是否有正在执行的队列
    const queueId = `${socket.characterId}:queue`
    const currentActivity = activeQueues.get(queueId)
    
    if (currentActivity && currentActivity.queueData) {
      // 有正在执行的队列，将其设为当前队列，其余为待处理队列
      const currentQueue = pending.find(q => q.id === currentActivity.queueData.id)
      const pendingQueues = pending.filter(q => q.id !== currentActivity.queueData.id)
      
      if (currentQueue) {
        socket.emit('current_queue_updated', currentQueue)
        console.log(`[SERVER] 发送current_queue_updated事件:`, currentQueue)
      }
      
      socket.emit('queue_updated', pendingQueues)
      console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pendingQueues.length}`)
    } else {
      // 没有正在执行的队列
      socket.emit('current_queue_updated', null)
      
      if (pending.length > 0) {
        console.log(`[SERVER] 当前没有活动，开始执行第一个队列`)
        await startQueueActivity(socket, pending[0])
        
        // 第一个队列开始执行，其余为待处理队列
        socket.emit('current_queue_updated', pending[0])
        socket.emit('queue_updated', pending.slice(1))
        console.log(`[SERVER] 发送current_queue_updated事件:`, pending[0])
        console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pending.slice(1).length}`)
      } else {
        socket.emit('queue_updated', [])
        console.log(`[SERVER] 没有待处理队列任务`)
      }
    }
    
  } catch (error) {
    console.error('[SERVER] 添加到队列失败:', error)
    socket.emit('error', { message: '添加到队列失败' })
  }
}

async function startImmediately(socket: AuthenticatedSocket, queueData: any) {
  // 先停止当前正在运行的队列活动
  const queueId = `${socket.characterId}:queue`
  const activity = activeQueues.get(queueId)
  if (activity) {
    clearInterval(activity.interval)
    activeQueues.delete(queueId)
  }
  
  // 开始新队列，确保设置初始重复次数
  queueData.currentRepeat = queueData.currentRepeat || 1
  
  // 持久化当前队列
  await saveQueueToDatabase(socket.characterId!, queueData)
  
  startQueueActivity(socket, queueData)
  
  // 获取更新后的队列并通知客户端
  const offlineTasks = await prisma.offlineTask.findMany({
    where: {
      characterId: socket.characterId!,
      status: 'active'
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  
  const resourceIds = offlineTasks.map(task => task.targetId).filter(Boolean)
  const resources = await prisma.gameResource.findMany({
    where: {
      id: { in: resourceIds }
    }
  })
  
  const resourceMap = new Map(resources.map(r => [r.id, r]))
  
  const pending = offlineTasks.map(task => {
    const resource = resourceMap.get(task.targetId || '')
    const baseTime = resource?.baseTime || 10
    const totalRepeat = task.totalRepeat || 1
    const currentRepeat = task.currentRepeat || 1
    
    return {
      id: task.id,
      activityType: task.type,
      resourceId: task.targetId,
      resourceName: resource?.name || '未知资源',
      repeatCount: totalRepeat,
      currentRepeat: currentRepeat,
      totalRepeat: totalRepeat,
      baseTime: baseTime,
      expReward: resource?.expReward || 10,
      progress: 0, // 重置进度
      remainingTime: baseTime, // 设置剩余时间
      estimatedTime: baseTime * totalRepeat, // 计算预计总时间
      createdAt: task.createdAt.toISOString()
    }
  })
  
  // 发送当前队列和待处理队列更新
  socket.emit('current_queue_updated', queueData)
  socket.emit('queue_updated', pending.filter(q => q.id !== queueData.id))
}

// 用户主动停止当前队列（会取消数据库任务）
async function stopCurrentQueueByUser(socket: AuthenticatedSocket) {
  const queueId = `${socket.characterId}:queue`
  
  // 停止当前队列活动
  const activity = activeQueues.get(queueId)
  if (activity) {
    clearInterval(activity.interval)
    activeQueues.delete(queueId)
    
    // 用户主动停止时取消数据库中的任务
    if (activity.queueData) {
      await cancelQueueInDatabase(activity.queueData.id)
      console.log(`[SERVER] 用户主动停止队列，取消数据库任务: ${activity.queueData.id}`)
    }
  }
  
  // 获取剩余的待处理队列
  const offlineTasks = await prisma.offlineTask.findMany({
    where: {
      characterId: socket.characterId!,
      status: 'active'
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  
  // 自动开始下一个队列
  if (offlineTasks.length > 0) {
    const resourceIds = offlineTasks.map(task => task.targetId).filter(Boolean)
    const resources = await prisma.gameResource.findMany({
      where: {
        id: { in: resourceIds }
      }
    })
    
    const resourceMap = new Map(resources.map(r => [r.id, r]))
    
    const pending = offlineTasks.map(task => {
      const resource = resourceMap.get(task.targetId || '')
      const baseTime = resource?.baseTime || 10
      const totalRepeat = task.totalRepeat || 1
      return {
        id: task.id,
        activityType: task.type,
        resourceId: task.targetId,
        resourceName: resource?.name || '未知资源',
        repeatCount: totalRepeat,
        currentRepeat: task.currentRepeat || 1,
        totalRepeat: totalRepeat,
        baseTime: baseTime,
        expReward: resource?.expReward || 10,
        progress: 0,
        remainingTime: baseTime,
        estimatedTime: baseTime * totalRepeat,
        createdAt: task.createdAt.toISOString()
      }
    })
    
    if (pending.length > 0) {
      startQueueActivity(socket, pending[0])
      socket.emit('current_queue_updated', pending[0])
      socket.emit('queue_updated', pending.slice(1))
      console.log(`[SERVER] 发送current_queue_updated事件:`, pending[0])
      console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pending.slice(1).length}`)
    } else {
      socket.emit('current_queue_updated', null)
      socket.emit('queue_updated', [])
      console.log(`[SERVER] 没有待处理队列任务`)
    }
  } else {
    socket.emit('current_queue_updated', null)
    socket.emit('queue_updated', [])
  }
}

// 系统内部停止当前队列（不取消数据库任务，用于队列切换）
async function stopCurrentQueue(socket: AuthenticatedSocket) {
  const queueId = `${socket.characterId}:queue`
  
  // 停止当前队列活动
  const activity = activeQueues.get(queueId)
  if (activity) {
    clearInterval(activity.interval)
    activeQueues.delete(queueId)
    
    // 系统内部停止时不取消数据库任务，让任务保持active状态以便恢复
    if (activity.queueData) {
      console.log(`[SERVER] 系统停止当前队列但保持数据库任务为active状态: ${activity.queueData.id}`)
    }
  }
  
  // 获取剩余的待处理队列
  const offlineTasks = await prisma.offlineTask.findMany({
    where: {
      characterId: socket.characterId!,
      status: 'active'
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  
  // 自动开始下一个队列
  if (offlineTasks.length > 0) {
    const resourceIds = offlineTasks.map(task => task.targetId).filter(Boolean)
    const resources = await prisma.gameResource.findMany({
      where: {
        id: { in: resourceIds }
      }
    })
    
    const resourceMap = new Map(resources.map(r => [r.id, r]))
    
    const pending = offlineTasks.map(task => {
      const resource = resourceMap.get(task.targetId || '')
      const baseTime = resource?.baseTime || 10
      const totalRepeat = task.totalRepeat || 1
      return {
        id: task.id,
        activityType: task.type,
        resourceId: task.targetId,
        resourceName: resource?.name || '未知资源',
        repeatCount: totalRepeat,
        currentRepeat: task.currentRepeat || 1,
        totalRepeat: totalRepeat,
        baseTime: baseTime,
        expReward: resource?.expReward || 10,
        progress: 0,
        remainingTime: baseTime,
        estimatedTime: baseTime * totalRepeat,
        createdAt: task.createdAt.toISOString()
      }
    })
    
    if (pending.length > 0) {
    startQueueActivity(socket, pending[0])
    socket.emit('current_queue_updated', pending[0])
    socket.emit('queue_updated', pending.slice(1))
    console.log(`[SERVER] 发送current_queue_updated事件:`, pending[0])
    console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pending.slice(1).length}`)
  } else {
    socket.emit('current_queue_updated', null)
    socket.emit('queue_updated', [])
    console.log(`[SERVER] 没有待处理队列任务`)
  }
  } else {
    socket.emit('queue_updated', [])
  }
}

async function removeFromQueue(socket: AuthenticatedSocket, queueId: string) {
  // 取消指定的队列任务
  await cancelQueueInDatabase(queueId)
  console.log(`[SERVER] 从队列中移除任务: ${queueId}`)
  
  // 获取更新后的队列
  const offlineTasks = await prisma.offlineTask.findMany({
    where: {
      characterId: socket.characterId!,
      status: 'active'
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  
  const resourceIds = offlineTasks.map(task => task.targetId).filter(Boolean)
  const resources = await prisma.gameResource.findMany({
    where: {
      id: { in: resourceIds }
    }
  })
  
  const resourceMap = new Map(resources.map(r => [r.id, r]))
  
  const pending = offlineTasks.map(task => {
    const resource = resourceMap.get(task.targetId || '')
    const baseTime = resource?.baseTime || 10
    const totalRepeat = task.totalRepeat || 1
    return {
      id: task.id,
      activityType: task.type,
      resourceId: task.targetId,
      resourceName: resource?.name || '未知资源',
      repeatCount: totalRepeat,
      currentRepeat: task.currentRepeat || 1,
      totalRepeat: totalRepeat,
      baseTime: baseTime,
      expReward: resource?.expReward || 10,
      progress: 0,
      remainingTime: baseTime,
      estimatedTime: baseTime * totalRepeat,
      createdAt: task.createdAt.toISOString()
    }
  })
  
  // 检查是否有正在执行的队列
  const currentActivity = activeQueues.get(`${socket.characterId}:queue`)
  
  if (currentActivity && currentActivity.queueData) {
    // 有正在执行的队列，将其设为当前队列，其余为待处理队列
    const currentQueue = pending.find(q => q.id === currentActivity.queueData.id)
    const pendingQueues = pending.filter(q => q.id !== currentActivity.queueData.id)
    
    if (currentQueue) {
      socket.emit('current_queue_updated', currentQueue)
      console.log(`[SERVER] 发送current_queue_updated事件:`, currentQueue)
    }
    
    socket.emit('queue_updated', pendingQueues)
    console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pendingQueues.length}`)
  } else {
    // 没有正在执行的队列
    socket.emit('current_queue_updated', null)
    socket.emit('queue_updated', pending)
    console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pending.length}`)
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
    
    // 立即发送初始进度更新
    socket.emit('queue_progress', {
      progress: 0,
      remainingTime: resource.baseTime,
      currentRepeat: queueData.currentRepeat || 1,
      totalRepeat: queueData.totalRepeat || 1
    })
    
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
    
    console.log(`[SERVER] 开始队列活动 - 用户: ${socket.characterId}, 活动: ${queueData.activityType}, 当前重复: ${queueData.currentRepeat}/${queueData.totalRepeat}`)
    
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
    
    console.log(`[SERVER] 离线操作完成 - 用户: ${socket.characterId}, 活动: ${queueData.activityType}, 资源: ${queueData.resourceName}`)
    
    // 处理奖励（复用原有逻辑）
    await processActivityReward(socket, resource, queueData.activityType)
    
    // 确保有正确的重复次数设置
    const currentRepeat = queueData.currentRepeat || 1
    const totalRepeat = queueData.totalRepeat || 1
    
    // 检查是否还有重复次数
    if (currentRepeat < totalRepeat) {
      console.log(`[SERVER] 继续重复操作 - 当前: ${currentRepeat}/${totalRepeat}`)
      // 更新重复次数并继续
      queueData.currentRepeat = currentRepeat + 1
      
      // 更新数据库中的任务进度
      await saveQueueToDatabase(socket.characterId!, queueData)
      
      // 延迟一小段时间再开始下一次，避免立即重复
      setTimeout(() => {
        startQueueActivity(socket, queueData)
      }, 100)
    } else {
      console.log(`[SERVER] 队列任务完全完成 - ID: ${queueData.id}, 活动: ${queueData.activityType}`)
      
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
      
      // 发送队列完成事件和客户端提示
      socket.emit('queue_completed', {
        queueId: queueData.id,
        activityType: queueData.activityType,
        resourceName: queueData.resourceName,
        message: `${queueData.resourceName} 的 ${getActivityName(queueData.activityType)} 任务已完成！`
      })
      
      console.log(`[SERVER] 发送队列完成通知给客户端`)
      
      // 获取剩余的待处理队列
      const offlineTasks = await prisma.offlineTask.findMany({
        where: {
          characterId: socket.characterId!,
          status: 'active'
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
      
      // 获取资源信息并转换为队列格式
      const resourceIds = offlineTasks.map(task => task.targetId).filter(Boolean)
      const resources = await prisma.gameResource.findMany({
        where: {
          id: { in: resourceIds }
        }
      })
      
      const resourceMap = new Map(resources.map(r => [r.id, r]))
      
      const pending = offlineTasks.map(task => {
        const resource = resourceMap.get(task.targetId || '')
        const baseTime = resource?.baseTime || 10
        const totalRepeat = task.totalRepeat || 1
        const currentRepeat = task.currentRepeat || 1
        
        return {
          id: task.id,
          activityType: task.type,
          resourceId: task.targetId,
          resourceName: resource?.name || '未知资源',
          repeatCount: totalRepeat,
          currentRepeat: currentRepeat,
          totalRepeat: totalRepeat,
          baseTime: baseTime,
          expReward: resource?.expReward || 10,
          progress: 0, // 新队列重置进度
          remainingTime: baseTime, // 设置剩余时间
          estimatedTime: baseTime * totalRepeat, // 计算预计总时间
          createdAt: task.createdAt.toISOString()
        }
      })
      
      console.log(`[SERVER] 剩余待处理队列数量: ${pending.length}`)
      
      // 开始下一个队列（如果有）
      if (pending.length > 0) {
        console.log(`[SERVER] 开始执行下一个队列任务:`, pending[0])
        // 延迟一小段时间再开始下一个队列
        setTimeout(() => {
          startQueueActivity(socket, pending[0])
          // 发送队列更新
          socket.emit('current_queue_updated', pending[0])
          socket.emit('queue_updated', pending.slice(1))
          console.log(`[SERVER] 发送current_queue_updated事件:`, pending[0])
          console.log(`[SERVER] 发送queue_updated事件，待处理队列数量: ${pending.slice(1).length}`)
        }, 500)
      } else {
        console.log(`[SERVER] 所有队列任务已完成`)
        socket.emit('current_queue_updated', null)
        socket.emit('queue_updated', [])
      }
    }
    
  } catch (error) {
    console.error('[SERVER] 完成队列活动时出错:', error)
  }
}

// 获取活动名称
function getActivityName(activityType: string): string {
  const names: { [key: string]: string } = {
    'mining': '挖矿',
    'gathering': '采集',
    'fishing': '钓鱼',
    'cooking': '烹饪',
    'crafting': '制作'
  }
  return names[activityType] || activityType
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