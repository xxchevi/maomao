import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'

interface IdleTask {
  id: string
  name: string
  type: 'collect' | 'craft' | 'explore'
  duration: number // 秒
  progress: number // 0-100
  rewards: Array<{ item: string; quantity: number; chance: number }>
  isActive: boolean
  startTime?: number
  endTime?: number
}

interface InventoryItem {
  id: string
  name: string
  icon: string
  quantity: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

interface Skill {
  level: number
  experience: number
  nextLevelExp: number
  progress?: number
}

interface QueueTask {
  id: number
  taskType: string
  taskName: string
  duration: number
  remainingCount: number
  totalCount: number
  status: 'pending' | 'running' | 'completed'
  progress: number
  rewards: Array<{ item: string; quantity: number; chance: number }>
  experience: number
  skillType: string
  queuePosition: number
  startTime?: string
  estimatedEndTime?: number
  remainingTime?: number
}

interface QueueStatus {
  queue: QueueTask[]
  currentTask: QueueTask | null
  queueLength: number
  totalEstimatedTime: number
}

interface GameState {
  socket: Socket | null
  connected: boolean
  currentTask: IdleTask | null
  taskQueue: IdleTask[]
  queueStatus: QueueStatus
  inventory: InventoryItem[]
  experience: number
  level: number
  skills: {
    farming: Skill
    mining: Skill
    agriculture: Skill
    fishing: Skill
  }
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    socket: null,
    connected: false,
    currentTask: null,
    taskQueue: [],
    queueStatus: {
      queue: [],
      currentTask: null,
      queueLength: 0,
      totalEstimatedTime: 0
    },
    inventory: [],
    experience: 0,
    level: 1,
    skills: {
      farming: {
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        progress: 0
      },
      mining: {
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        progress: 0
      },
      agriculture: {
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        progress: 0
      },
      fishing: {
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        progress: 0
      }
    }
  }),

  getters: {
    isTaskActive: (state) => state.currentTask?.isActive || false,
    taskProgress: (state) => state.currentTask?.progress || 0,
    inventoryCount: (state) => state.inventory.reduce((sum, item) => sum + item.quantity, 0),
    canStartTask: (state) => !state.currentTask?.isActive,
    hasQueuedTasks: (state) => state.queueStatus.queueLength > 0,
    canAddToQueue: (state) => state.queueStatus.queueLength < 20,
    currentQueueTask: (state) => state.queueStatus.currentTask,
    queuedTasks: (state) => state.queueStatus.queue.filter(task => task.status === 'pending'),
    totalQueueTime: (state) => state.queueStatus.totalEstimatedTime
  },

  actions: {
    initSocket() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return
      
      this.socket = io(config.public.socketUrl, {
        auth: {
          token: authStore.token
        },
        transports: ['websocket', 'polling']
      })
      
      this.socket.on('connect', () => {
        this.connected = true
        console.log('Socket连接成功')
      })
      
      this.socket.on('disconnect', () => {
        this.connected = false
        console.log('Socket连接断开')
      })
      
      // 用户认证
      this.socket.emit('authenticate', {
        token: authStore.token
      })
      
      // 监听认证结果
      this.socket.on('authenticated', (data) => {
        console.log('Socket认证成功:', data)
      })
      
      this.socket.on('auth_error', (data) => {
        console.error('Socket认证失败:', data)
      })
      
      // 监听游戏状态更新
      this.socket.on('game_state', (data) => {
        this.updateGameState(data)
      })
      
      // 监听任务进度更新
      this.socket.on('task_progress', (data) => {
        if (this.currentTask) {
          this.currentTask.progress = data.progress
        }
      })
      
      // 监听任务开始
      this.socket.on('task_started', (data) => {
        if (data.success) {
          this.currentTask = data.task
        }
      })
      
      // 监听任务完成
      this.socket.on('task_completed', (data) => {
        this.handleTaskComplete(data)
      })
      
      // 监听任务错误
      this.socket.on('task_error', (data) => {
        console.error('任务错误:', data.message)
      })
      
      // 监听队列状态更新
      this.socket.on('queue_status', (data) => {
        this.updateQueueStatus(data)
      })
      
      // 监听队列任务开始
      this.socket.on('queue_task_started', (data) => {
        console.log('队列任务开始:', data)
        this.updateQueueStatus(data.queueStatus)
      })
      
      // 监听队列任务完成
      this.socket.on('queue_task_completed', (data) => {
        console.log('队列任务完成:', data)
        this.updateQueueStatus(data.queueStatus)
        // 更新游戏状态
        if (data.gameState) {
          this.updateGameState(data.gameState)
        }
      })
      
      // 监听队列任务进度
      this.socket.on('queue_task_progress', (data) => {
        if (this.queueStatus.currentTask && this.queueStatus.currentTask.id === data.taskId) {
          this.queueStatus.currentTask.progress = data.progress
          this.queueStatus.currentTask.remainingTime = data.remainingTime
        }
      })
      
      // 监听一般错误
      this.socket.on('error', (data) => {
        console.error('Socket错误:', data.message)
      })
    },
    
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
        this.connected = false
      }
    },
    
    async loadGameState() {
      try {
        const authStore = useAuthStore()
        
        const response = await $fetch('/api/game/state', {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        
        if (response.success) {
          this.updateGameState(response.data)
        }
      } catch (error) {
        console.error('加载游戏状态失败:', error)
      }
    },
    
    updateGameState(data: any) {
      if (data.currentTask) {
        this.currentTask = data.currentTask
      }
      if (data.inventory) {
        this.inventory = data.inventory
      }
      if (data.experience !== undefined) {
        this.experience = data.experience
      }
      if (data.level !== undefined) {
        this.level = data.level
      }
      if (data.skills) {
        // 更新技能数据
        if (data.skills.farming) {
          this.skills.farming = {
            ...this.skills.farming,
            ...data.skills.farming,
            // 计算进度百分比
            progress: Math.min(Math.floor((data.skills.farming.experience / data.skills.farming.nextLevelExp) * 100), 100)
          }
        }
        if (data.skills.mining) {
          this.skills.mining = {
            ...this.skills.mining,
            ...data.skills.mining,
            // 计算进度百分比
            progress: Math.min(Math.floor((data.skills.mining.experience / data.skills.mining.nextLevelExp) * 100), 100)
          }
        }
        if (data.skills.agriculture) {
          this.skills.agriculture = {
            ...this.skills.agriculture,
            ...data.skills.agriculture,
            // 计算进度百分比
            progress: Math.min(Math.floor((data.skills.agriculture.experience / data.skills.agriculture.nextLevelExp) * 100), 100)
          }
        }
        if (data.skills.fishing) {
          this.skills.fishing = {
            ...this.skills.fishing,
            ...data.skills.fishing,
            // 计算进度百分比
            progress: Math.min(Math.floor((data.skills.fishing.experience / data.skills.fishing.nextLevelExp) * 100), 100)
          }
        }
      }
    },
    
    async startCollectTask(taskType: string, duration: number = 60) {
      if (!this.canStartTask) return
      
      try {
        const authStore = useAuthStore()
        
        const response = await $fetch('/api/game/collect/start', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: {
            taskType: taskType,
            duration: duration
          }
        })
        
        if (response.success) {
          this.currentTask = response.data.task
          
          // 通过Socket通知服务器
          if (this.socket) {
            this.socket.emit('start_collect_task', {
              taskType: taskType,
              duration: duration
            })
          }
        }
        
        return response
      } catch (error) {
        console.error('开始采集任务失败:', error)
        return { success: false, message: '开始采集任务失败' }
      }
    },
    
    async stopCollectTask() {
      if (!this.currentTask) return
      
      try {
        const authStore = useAuthStore()
        
        const response = await $fetch('/api/game/collect/stop', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        
        if (response.success) {
          // 添加奖励到仓库
          if (response.data?.rewards?.items && response.data.rewards.items.length > 0) {
            this.addToInventory(response.data.rewards.items)
          }
          
          // 更新经验值
          if (response.data?.rewards?.experience) {
            this.experience = response.data.gameState.experience
          }
          
          // 检查升级
          if (response.data?.rewards?.levelUp) {
            this.level = response.data.gameState.level
          }
          
          // 更新技能数据
          if (response.data?.gameState?.skills) {
            const skills = response.data.gameState.skills
            
            if (skills.farming) {
              this.skills.farming = {
                ...this.skills.farming,
                ...skills.farming,
                // 计算进度百分比
                progress: Math.min(Math.floor((skills.farming.experience / skills.farming.nextLevelExp) * 100), 100)
              }
            }
            
            if (skills.mining) {
              this.skills.mining = {
                ...this.skills.mining,
                ...skills.mining,
                // 计算进度百分比
                progress: Math.min(Math.floor((skills.mining.experience / skills.mining.nextLevelExp) * 100), 100)
              }
            }
          }
          
          this.currentTask = null
          
          // 通过Socket通知服务器
          if (this.socket) {
            this.socket.emit('stop_collect_task')
          }
        }
        
        return response
      } catch (error) {
        console.error('停止采集任务失败:', error)
        return { success: false, message: '停止采集任务失败' }
      }
    },
    
    handleTaskComplete(data: any) {
      if (data.rewards && data.rewards.length > 0) {
        this.addToInventory(data.rewards)
      }
      if (data.experience) {
        this.experience = data.experience
      }
      if (data.level) {
        this.level = data.level
      }
      // 更新技能数据
      if (data.skills) {
        if (data.skills.farming) {
          this.skills.farming = {
            ...this.skills.farming,
            ...data.skills.farming,
            // 计算进度百分比
            progress: Math.min(Math.floor((data.skills.farming.experience / data.skills.farming.nextLevelExp) * 100), 100)
          }
        }
        if (data.skills.mining) {
          this.skills.mining = {
            ...this.skills.mining,
            ...data.skills.mining,
            // 计算进度百分比
            progress: Math.min(Math.floor((data.skills.mining.experience / data.skills.mining.nextLevelExp) * 100), 100)
          }
        }
      }
      this.currentTask = null
    },
    
    addToInventory(items: Array<{ id: string; name: string; icon: string; quantity: number; rarity: string }>) {
      items.forEach(newItem => {
        const existingItem = this.inventory.find(item => item.id === newItem.id)
        if (existingItem) {
          existingItem.quantity += newItem.quantity
        } else {
          this.inventory.push({
            id: newItem.id,
            name: newItem.name,
            icon: newItem.icon,
            quantity: newItem.quantity,
            rarity: newItem.rarity as any
          })
        }
      })
    },
    
    async quickAction(type: 'speed10' | 'speed100' | 'speed1000' | 'time30min' | 'time1hour') {
      if (!this.currentTask?.isActive) return
      
      try {
        const authStore = useAuthStore()
        const { $fetch } = useNuxtApp()
        
        const response = await $fetch('/api/game/task/quick-action', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: {
            taskId: this.currentTask.id,
            actionType: type
          }
        })
        
        return response
      } catch (error) {
        console.error('快速操作失败:', error)
        return { success: false, message: '快速操作失败' }
      }
    },
    
    // 队列相关方法
    updateQueueStatus(data: QueueStatus) {
      this.queueStatus = data
    },
    
    addTaskToQueue(taskType: string, count: number = 1) {
      return new Promise((resolve) => {
        if (!this.socket) {
          resolve({ success: false, message: 'WebSocket未连接' })
          return
        }
        
        // 监听添加任务结果
        const handleTaskAdded = (response: any) => {
          this.socket?.off('task_added', handleTaskAdded)
          this.socket?.off('task_add_error', handleTaskError)
          resolve(response)
        }
        
        const handleTaskError = (error: any) => {
          this.socket?.off('task_added', handleTaskAdded)
          this.socket?.off('task_add_error', handleTaskError)
          resolve({ success: false, message: error.message || '添加任务失败' })
        }
        
        this.socket.on('task_added', handleTaskAdded)
        this.socket.on('task_add_error', handleTaskError)
        
        // 发送添加任务事件
        this.socket.emit('add_task_to_queue', {
          taskType,
          count
        })
      })
    },
    
    removeTaskFromQueue(taskId: number) {
      return new Promise((resolve) => {
        if (!this.socket) {
          resolve({ success: false, message: 'WebSocket未连接' })
          return
        }
        
        // 监听移除任务结果
        const handleTaskRemoved = (response: any) => {
          this.socket?.off('task_removed', handleTaskRemoved)
          this.socket?.off('task_remove_error', handleTaskError)
          resolve(response)
        }
        
        const handleTaskError = (error: any) => {
          this.socket?.off('task_removed', handleTaskRemoved)
          this.socket?.off('task_remove_error', handleTaskError)
          resolve({ success: false, message: error.message || '移除任务失败' })
        }
        
        this.socket.on('task_removed', handleTaskRemoved)
        this.socket.on('task_remove_error', handleTaskError)
        
        // 发送移除任务事件
        this.socket.emit('remove_task_from_queue', { taskId })
      })
    },
    
    getQueueStatus() {
      return new Promise((resolve) => {
        if (!this.socket) {
          resolve({ success: false, message: 'WebSocket未连接' })
          return
        }
        
        // 发送获取队列状态事件
        this.socket.emit('get_queue_status')
        resolve({ success: true })
      })
    },
    
    startQueueProcessing() {
      if (this.socket) {
        this.socket.emit('start_queue_processing')
      }
    },
    
    stopQueueProcessing() {
      if (this.socket) {
        this.socket.emit('stop_queue_processing')
      }
    },
    
    requestQueueStatus() {
      if (this.socket) {
        this.socket.emit('get_queue_status')
      }
    }
  }
})