import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'

interface InventoryItem {
  id: string
  itemId: string
  quantity: number
  item: {
    id: string
    name: string
    type: string
    rarity: string
    value: number
  }
}

interface GameResource {
  id: string
  name: string
  type: string
  area: string
  itemId: string
  baseTime: number
  expReward: number
  levelReq: number
  rarity: string
  dropRate: number
}

interface ActivityQueue {
  id: string
  activityType: string
  resourceId: string
  resourceName: string
  totalRepeat: number
  currentRepeat: number
  progress: number
  remainingTime: number
  estimatedTime: number
  createdAt: number
}



export const useGameStore = defineStore('game', {
  state: () => ({
    socket: null as Socket | null,
    isConnected: false,
    inventory: [] as InventoryItem[],
    resources: [] as GameResource[],

    // 队列系统
    currentQueue: null as ActivityQueue | null,
    pendingQueues: [] as ActivityQueue[],
    progressTimer: null as NodeJS.Timeout | null,
    
    // 保留兼容性
    currentActivity: null as string | null,
    activityProgress: 0,
    activityTarget: null as GameResource | null,
    // 通知系统
    notifications: [] as Array<{
      id: string
      message: string
      type: 'success' | 'error' | 'info'
      timestamp: number
    }>
  }),

  getters: {
    inventoryByType: (state) => (type:any) => {
      return state.inventory.filter(item => item.item.type === type)
    },
    
    resourcesByArea: (state) => (area:any) => {
      return state.resources.filter(resource => resource.area === area)
    },
    

  },

  actions: {
    initSocket() {
      if (process.client && !this.socket) {
        const authStore = useAuthStore()
        const token = authStore.token
        
        if (!token) {
          console.error('No token available for socket connection')
          return
        }

        this.socket = io('http://localhost:3000', {
          auth: {
            token: token
          },
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        })

        this.socket.on('connect', () => {
          this.isConnected = true
          console.log('[CLIENT] Socket连接成功')
          
          // 连接成功后请求恢复队列状态
          console.log('[CLIENT] 发送restore_queues请求')
          this.socket?.emit('restore_queues')
        })

        this.socket.on('disconnect', () => {
          this.isConnected = false
          console.log('[CLIENT] Socket连接断开')
        })

        // 监听游戏事件
        this.socket.on('character_updated', (character) => {
          console.log('[CLIENT] 收到character_updated事件:', character)
          const authStore = useAuthStore()
          authStore.updateCharacter(character)
        })

        this.socket.on('inventory_updated', (inventory) => {
          console.log('[CLIENT] 收到inventory_updated事件:', inventory)
          this.inventory = inventory
        })

        // 队列相关事件 - 移除queue_progress监听，改为本地计算

        this.socket.on('queue_completed', (data) => {
          console.log('[CLIENT] [DEBUG] 收到queue_completed事件:', data)
          console.log('[CLIENT] [DEBUG] 当前队列状态:', {
            currentQueue: this.currentQueue,
            currentActivity: this.currentActivity,
            activityProgress: this.activityProgress,
            pendingQueues: this.pendingQueues.length
          })
          
          // 显示完成提示
           if (data.message) {
             // 在页面上显示提示信息
             this.addNotification(data.message, 'success')
             console.log('[CLIENT] [DEBUG] 显示队列完成提示:', data.message)
           }
          
          // 处理队列完成逻辑
          console.log(`[CLIENT] [DEBUG] 队列任务完成 - ${data.activityType}: ${data.resourceName}`)
          
          // 停止本地进度计算
          this.stopLocalProgressCalculation()
          
          this.currentQueue = null
          this.currentActivity = null
          this.activityProgress = 0
          this.activityTarget = null
          
          console.log('[CLIENT] [DEBUG] 队列完成后状态重置完毕，准备开始下一个队列')
          
          // 自动开始下一个队列
          this.startNextQueue()
        })

        this.socket.on('current_queue_updated', (currentQueue) => {
          console.log('[CLIENT] [DEBUG] 收到current_queue_updated事件，当前队列:', currentQueue)
          if (currentQueue) {
            // 使用服务器提供的 startTime，如果没有则使用当前时间
            const startTime = currentQueue.startTime || Date.now()
            
            console.log('[CLIENT] [DEBUG] 更新当前队列:', {
              id: currentQueue.id,
              activityType: currentQueue.activityType,
              resourceName: currentQueue.resourceName,
              currentRepeat: currentQueue.currentRepeat,
              totalRepeat: currentQueue.totalRepeat,
              serverStartTime: currentQueue.startTime,
              useStartTime: startTime,
              serverProgress: currentQueue.progress
            })
            
            this.currentQueue = {
              ...currentQueue,
              startTime: startTime,
              progress: 0 // 重置进度，让本地计算接管
            }
            this.currentActivity = currentQueue.activityType
            this.activityTarget = this.resources.find(r => r.id === currentQueue.resourceId)
            this.activityProgress = 0 // 重置进度
            
            // 启动本地进度计算
            this.startLocalProgressCalculation()
          } else {
            console.log('[CLIENT] [DEBUG] 清空当前队列')
            this.currentQueue = null
            this.currentActivity = null
            this.activityTarget = null
            this.activityProgress = 0
            
            // 停止进度计算
            this.stopLocalProgressCalculation()
          }
        })

        this.socket.on('queue_updated', (queues) => {
          console.log('[CLIENT] 收到queue_updated事件，待处理队列:', queues)
          this.pendingQueues = queues
        })

        // 物品掉落通知
        this.socket.on('item_dropped', (data) => {
          this.addNotification(data.message, 'success')
        })
        
        this.socket.on('test_queue_created', (data) => {
          console.log('测试队列创建成功:', data)
          alert('测试队列创建成功！')
        })
      }
    },

    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
        this.isConnected = false
      }
      this.stopLocalProgressCalculation()
    },

    // 本地进度计算方法
    startLocalProgressCalculation() {
      this.stopLocalProgressCalculation() // 先停止之前的计时器
      
      if (!this.currentQueue) {
        console.log('[CLIENT] [DEBUG] 无当前队列，停止进度计算')
        return
      }
      
      console.log('[CLIENT] [DEBUG] 开始本地进度计算，当前队列:', {
        id: this.currentQueue.id,
        activityType: this.currentQueue.activityType,
        resourceName: this.currentQueue.resourceName,
        currentRepeat: this.currentQueue.currentRepeat,
        totalRepeat: this.currentQueue.totalRepeat,
        baseTime: this.currentQueue.baseTime,
        startTime: this.currentQueue.startTime,
        progress: this.currentQueue.progress
      })
      
      this.progressTimer = setInterval(() => {
        if (!this.currentQueue) {
          console.log('[CLIENT] [DEBUG] 队列已清空，停止进度计算')
          this.stopLocalProgressCalculation()
          return
        }
        
        const now = Date.now()
        const startTime = this.currentQueue.startTime || now
        const elapsed = now - startTime
        const duration = this.currentQueue.baseTime * 1000 // 转换为毫秒
        
        const progress = Math.min((elapsed / duration) * 100, 100)
        const remainingTime = Math.max(0, Math.ceil((duration - elapsed) / 1000))
        
        // 详细调试信息
        if (progress >= 99) {
          console.log('[CLIENT] [DEBUG] 进度接近或达到100%:', {
            now,
            startTime,
            elapsed,
            duration,
            progress,
            remainingTime,
            currentRepeat: this.currentQueue.currentRepeat,
            totalRepeat: this.currentQueue.totalRepeat,
            queueId: this.currentQueue.id
          })
        }
        
        this.currentQueue.progress = progress
        this.currentQueue.remainingTime = remainingTime
        this.activityProgress = progress
        
        // 如果进度达到100%，等待服务器的queue_completed事件
        if (progress >= 100) {
          console.log('[CLIENT] [DEBUG] 进度达到100%，停止本地计算，等待服务器queue_completed事件')
          this.stopLocalProgressCalculation()
        }
      }, 100)
    },
    
    stopLocalProgressCalculation() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
    },

    async loadGameData() {
      console.log('[CLIENT] 开始加载游戏数据')
      try {
        const authStore = useAuthStore()
        if (!authStore.token) return

        // 加载仓库
        console.log('[CLIENT] 加载库存数据')
        const inventoryData = await $fetch('/api/game/inventory', {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        this.inventory = inventoryData.data
        console.log('[CLIENT] 库存数据加载完成:', this.inventory)

        // 加载资源点
        console.log('[CLIENT] 加载资源点数据')
        const resourcesData = await $fetch('/api/game/resources')
        this.resources = resourcesData.data
        console.log('[CLIENT] 资源点数据加载完成:', this.resources)

        // 通过Socket获取队列数据
        console.log('[CLIENT] 通过Socket请求恢复队列状态')
        if (this.socket) {
          this.socket.emit('restore_queues')
        }

      } catch (error) {
        console.error('[CLIENT] 加载游戏数据失败:', error)
      }
    },

    // 队列管理方法
    async addToQueue(params: { activityType: string; resourceId: string; repeatCount: number }) {
      console.log('[CLIENT] 添加到队列 - 参数:', params)
      const resource = this.resources.find(r => r.id === params.resourceId)
      if (!resource) {
        this.addNotification('资源点不存在', 'error')
        return
      }

      // 如果没有当前队列，直接立即执行
      if (!this.currentQueue) {
        await this.startImmediately(params)
        return
      }

      if (this.pendingQueues.length >= 20) {
        this.addNotification('待开始队列已满(最多20个)', 'warning')
        return
      }

      const queue: ActivityQueue = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        activityType: params.activityType,
        resourceId: params.resourceId,
        resourceName: resource.name,
        totalRepeat: params.repeatCount,
        currentRepeat: 1,
        progress: 0,
        remainingTime: 0,
        estimatedTime: resource.baseTime * params.repeatCount,
        createdAt: Date.now()
      }

      if (!this.socket) {
        console.error('[CLIENT] Socket未连接，无法添加到队列')
        return
      }
      
      console.log('[CLIENT] 发送add_to_queue事件到服务器')
      this.socket.emit('add_to_queue', queue)
      
      // 如果当前没有队列在执行，添加后可能会立即开始，启动进度计算
      setTimeout(() => {
        if (this.currentQueue && !this.progressTimer) {
          this.startLocalProgressCalculation()
        }
      }, 100)
      
      this.addNotification(`已添加到队列: ${resource.name} x${params.repeatCount}`, 'success')
    },

    async startImmediately(params: { activityType: string; resourceId: string; repeatCount: number }) {
      console.log('[CLIENT] [DEBUG] 立即开始新队列:', params)
      
      const resource = this.resources.find(r => r.id === params.resourceId)
      if (!resource) {
        this.addNotification('资源点不存在', 'error')
        return
      }

      const queue: ActivityQueue = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        activityType: params.activityType,
        resourceId: params.resourceId,
        resourceName: resource.name,
        totalRepeat: params.repeatCount,
        currentRepeat: 1,
        progress: 0,
        remainingTime: resource.baseTime,
        estimatedTime: resource.baseTime * params.repeatCount,
        createdAt: Date.now(),
        baseTime: resource.baseTime
      }

      // 停止当前的本地进度计算
      this.stopLocalProgressCalculation()

      if (this.socket) {
        console.log('[CLIENT] [DEBUG] 发送 start_immediately 事件到服务器')
        this.socket.emit('start_immediately', queue)
      } else {
        console.error('[CLIENT] Socket未连接，无法立即开始队列')
        this.addNotification('网络连接错误', 'error')
        return
      }
      
      this.addNotification(`立即开始: ${resource.name} x${params.repeatCount}`, 'success')
    },

    async stopCurrentQueue() {
      if (!this.currentQueue) return

      this.currentQueue = null
      this.currentActivity = null
      this.activityProgress = 0
      this.activityTarget = null

      if (this.socket) {
        this.socket.emit('stop_current_queue')
      }
      
      this.addNotification('已停止当前队列', 'info')
      
      // 自动开始下一个队列
      this.startNextQueue()
    },

    async removeFromQueue(queueId: string) {
      const index = this.pendingQueues.findIndex(q => q.id === queueId)
      if (index !== -1) {
        const queue = this.pendingQueues[index]
        this.pendingQueues.splice(index, 1)
        
        if (this.socket) {
          this.socket.emit('remove_from_queue', queueId)
        }
        
        this.addNotification(`已移除队列: ${queue.resourceName}`, 'info')
      }
    },

    startNextQueue() {
      console.log('[CLIENT] [DEBUG] startNextQueue 被调用');
      console.log('[CLIENT] [DEBUG] 当前状态:', {
        currentQueue: this.currentQueue,
        pendingQueues: this.pendingQueues.length,
        socketConnected: !!this.socket
      });
      
      // 请求服务器开始下一个队列
      if (this.socket) {
        console.log('[CLIENT] [DEBUG] 向服务器发送 start_next_queue 事件');
        this.socket.emit('start_next_queue');
      } else {
        console.error('[CLIENT] [DEBUG] Socket 未连接，无法请求下一个队列');
      }
    },

    // 兼容旧的方法
    async startActivity(type: any, resourceId: any) {
      // 重定向到新的立即开始方法
      await this.startImmediately({
        activityType: type,
        resourceId,
        repeatCount: 1
      })
    },

    async stopActivity() {
      await this.stopCurrentQueue()
    },



    addNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
      const notification = {
        id: Date.now().toString(),
        message,
        type,
        timestamp: Date.now()
      }
      this.notifications.push(notification)
      
      console.log(`[CLIENT] 添加通知: ${message} (${type})`)
      
      // 自动移除通知（5秒后）
      setTimeout(() => {
        this.removeNotification(notification.id)
      }, 5000)
    },
    
    showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
      this.addNotification(message, type)
    },

    removeNotification(id:string) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    }
  }
})