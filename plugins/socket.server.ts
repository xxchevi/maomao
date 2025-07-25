import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import type { NitroApp } from 'nitropack'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 存储用户会话
const userSessions = new Map<string, {
  userId: string
  socketId: string
  currentTask?: any
}>()

// 存储Socket实例
const userSockets = new Map<string, any>()

// 防止重复启动服务器
let socketServer: any = null

export default defineNuxtPlugin(async (nuxtApp) => {
  // 只在服务器端运行
  if (process.client) return
  
  // 在开发模式下创建Socket.io服务器
  if (process.dev && !socketServer) {
    const { createServer } = await import('http')
    const httpServer = createServer()
    
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    // 中间件：验证JWT token
    io.use((socket, next) => {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        socket.userId = decoded.userId
        next()
      } catch (err) {
        next(new Error('Authentication error: Invalid token'))
      }
    })

    io.on('connection', (socket) => {
      console.log(`用户 ${socket.userId} 连接到Socket.io`)
      
      // 存储用户socket连接
      userSockets.set(socket.userId, socket)
      userSessions.set(socket.userId, {
        userId: socket.userId,
        socketId: socket.id
      })

      // 发送认证成功事件
      socket.emit('authenticated', { userId: socket.userId })

      // 监听用户认证事件
      socket.on('authenticate', (data) => {
        socket.emit('authenticated', { userId: socket.userId })
      })

      // 监听开始采集任务事件
      socket.on('start_collect_task', (taskData) => {
        console.log(`用户 ${socket.userId} 开始采集任务:`, taskData)
        
        // 更新用户会话中的当前任务
        const session = userSessions.get(socket.userId)
        if (session) {
          session.currentTask = taskData
          userSessions.set(socket.userId, session)
        }

        // 发送任务开始确认
        socket.emit('task_started', taskData)

        // 模拟任务进度更新
        const progressInterval = setInterval(() => {
          const currentSession = userSessions.get(socket.userId)
          if (!currentSession?.currentTask) {
            clearInterval(progressInterval)
            return
          }

          const task = currentSession.currentTask
          const elapsed = Date.now() - task.startTime
          const progress = Math.min((elapsed / (task.duration * 60 * 1000)) * 100, 100)

          socket.emit('task_progress', {
            taskId: task.id,
            progress: Math.floor(progress),
            timeRemaining: Math.max(0, task.duration * 60 - Math.floor(elapsed / 1000))
          })

          // 任务完成
          if (progress >= 100) {
            clearInterval(progressInterval)
            
            const rewards = {
              items: task.rewards?.items || [],
              experience: task.rewards?.experience || 0,
              levelUp: false
            }

            socket.emit('task_completed', {
              taskId: task.id,
              rewards
            })

            // 清除任务
            if (currentSession) {
              currentSession.currentTask = undefined
              userSessions.set(socket.userId, currentSession)
            }
          }
        }, 1000)
      })

      // 监听停止采集任务事件
      socket.on('stop_collect_task', (data) => {
        console.log(`用户 ${socket.userId} 停止采集任务`)
        
        const session = userSessions.get(socket.userId)
        if (session?.currentTask) {
          const task = session.currentTask
          const elapsed = Date.now() - task.startTime
          const progress = Math.min((elapsed / (task.duration * 60 * 1000)) * 100, 100)
          
          // 计算部分奖励
          const partialRewards = {
            items: progress > 50 ? task.rewards?.items || [] : [],
            experience: Math.floor((task.rewards?.experience || 0) * (progress / 100)),
            levelUp: false
          }

          socket.emit('task_completed', {
            taskId: task.id,
            rewards: partialRewards,
            partial: true
          })

          // 清除任务
          session.currentTask = undefined
          userSessions.set(socket.userId, session)
        }
      })

      // 处理断开连接
      socket.on('disconnect', () => {
        console.log(`用户 ${socket.userId} 断开连接`)
        userSockets.delete(socket.userId)
        userSessions.delete(socket.userId)
      })

      // 队列相关事件处理
      socket.on('add_task_to_queue', (data) => {
        console.log(`用户 ${socket.userId} 添加任务到队列:`, data)
        
        // 模拟添加任务到队列
        const taskId = Date.now()
        const task = {
          id: taskId,
          taskType: data.taskType,
          count: data.count,
          status: 'pending',
          progress: 0
        }
        
        socket.emit('task_added', {
          success: true,
          task
        })
        
        // 更新队列状态
        socket.emit('queue_status_updated', {
          queueLength: 1, // 简化实现
          isProcessing: false,
          currentTask: null
        })
      })
      
      socket.on('remove_task_from_queue', (data) => {
        console.log(`用户 ${socket.userId} 从队列移除任务:`, data)
        
        socket.emit('task_removed', {
          success: true,
          taskId: data.taskId
        })
        
        // 更新队列状态
        socket.emit('queue_status_updated', {
          queueLength: 0,
          isProcessing: false,
          currentTask: null
        })
      })
      
      socket.on('start_queue_processing', () => {
        console.log(`用户 ${socket.userId} 开始队列处理`)
        
        // 模拟队列处理
        socket.emit('queue_task_started', {
          taskId: Date.now(),
          taskType: 'forest_collect',
          duration: 30
        })
        
        // 模拟任务进度
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += 10
          
          socket.emit('queue_task_progress', {
            taskId: Date.now(),
            progress,
            timeRemaining: Math.max(0, 30 - (progress / 10) * 3)
          })
          
          if (progress >= 100) {
            clearInterval(progressInterval)
            
            socket.emit('queue_task_completed', {
              taskId: Date.now(),
              rewards: {
                items: [{ name: '木材', icon: '🪵', quantity: 2 }],
                experience: 2
              }
            })
            
            // 更新队列状态
            socket.emit('queue_status_updated', {
              queueLength: 0,
              isProcessing: false,
              currentTask: null
            })
          }
        }, 3000) // 每3秒更新一次进度
      })
      
      socket.on('stop_queue_processing', () => {
        console.log(`用户 ${socket.userId} 停止队列处理`)
        
        socket.emit('queue_status_updated', {
          queueLength: 0,
          isProcessing: false,
          currentTask: null
        })
      })
      
      socket.on('get_queue_status', () => {
        console.log(`用户 ${socket.userId} 请求队列状态`)
        
        socket.emit('queue_status_updated', {
          queueLength: 0,
          isProcessing: false,
          currentTask: null
        })
      })
      
      // 错误处理
      socket.on('error', (error) => {
        console.error(`Socket错误 (用户 ${socket.userId}):`, error)
        socket.emit('error', { message: '服务器错误' })
      })
    })

    // 启动Socket.io服务器，添加错误处理
    const startServer = (port: number) => {
      httpServer.listen(port, () => {
        console.log(`Socket.io服务器运行在端口 ${port}`)
        socketServer = httpServer // 标记服务器已启动
      }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`端口 ${port} 已被占用，尝试使用端口 ${port + 1}`)
          startServer(port + 1)
        } else {
          console.error('Socket.io服务器启动失败:', err)
        }
      })
    }
    
    startServer(3001)
  }
})

// 导出辅助函数
export const getSocketForUser = (userId: string) => {
  return userSockets.get(userId)
}

export const getUserSession = (userId: string) => {
  return userSessions.get(userId)
}

export const broadcastToUser = (userId: string, event: string, data: any) => {
  const socket = userSockets.get(userId)
  if (socket) {
    socket.emit(event, data)
  }
}