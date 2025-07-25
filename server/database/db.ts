import Database from 'better-sqlite3'
import { join } from 'path'
import bcrypt from 'bcryptjs'

// 数据库文件路径
const dbPath = join(process.cwd(), 'data', 'game.db')

// 创建数据库连接
export const db = new Database(dbPath)

// 启用外键约束
db.pragma('foreign_keys = ON')

// 用户表结构
export interface User {
  id: number
  username: string
  password: string
  email?: string
  level: number
  experience: number
  energy: number
  maxEnergy: number
  coins: number
  gems: number
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

// 游戏数据表结构
export interface GameData {
  id: number
  userId: number
  collectingTaskId?: string
  collectingProgress: number
  collectingStartTime?: string
  isCollecting: boolean
  inventory: string // JSON字符串存储物品清单
  achievements: string // JSON字符串存储成就
  settings: string // JSON字符串存储用户设置
  createdAt: string
  updatedAt: string
  // 技能等级系统
  farmingLevel: number
  farmingExp: number
  miningLevel: number
  miningExp: number
  agricultureLevel: number
  agricultureExp: number
  fishingLevel: number
  fishingExp: number
}

// 任务队列表结构
export interface TaskQueue {
  id: number
  userId: number
  taskType: string
  taskName: string
  duration: number // 单次任务耗时（秒）
  count: number // 执行次数
  remainingCount: number // 剩余次数
  status: 'pending' | 'running' | 'completed' | 'cancelled'
  currentProgress: number // 当前任务进度 0-100
  startTime?: string
  endTime?: string
  rewards: string // JSON字符串存储奖励配置
  experience: number // 单次经验奖励
  skillType: string // 技能类型
  energyCost: number // 单次能量消耗
  queuePosition: number // 队列位置
  createdAt: string
  updatedAt: string
}

// 初始化数据库表
export function initDatabase() {
  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      level INTEGER DEFAULT 1,
      experience INTEGER DEFAULT 0,
      energy INTEGER DEFAULT 100,
      maxEnergy INTEGER DEFAULT 100,
      coins INTEGER DEFAULT 0,
      gems INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastLogin DATETIME
    )
  `)

  // 创建游戏数据表
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      collectingTaskId TEXT,
      collectingProgress INTEGER DEFAULT 0,
      collectingStartTime DATETIME,
      isCollecting BOOLEAN DEFAULT FALSE,
      inventory TEXT DEFAULT '[]',
      achievements TEXT DEFAULT '[]',
      settings TEXT DEFAULT '{}',
      farmingLevel INTEGER DEFAULT 1,
      farmingExp INTEGER DEFAULT 0,
      miningLevel INTEGER DEFAULT 1,
      miningExp INTEGER DEFAULT 0,
      agricultureLevel INTEGER DEFAULT 1,
      agricultureExp INTEGER DEFAULT 0,
      fishingLevel INTEGER DEFAULT 1,
      fishingExp INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // 创建任务队列表
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      taskType TEXT NOT NULL,
      taskName TEXT NOT NULL,
      duration INTEGER NOT NULL,
      count INTEGER NOT NULL,
      remainingCount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      currentProgress INTEGER DEFAULT 0,
      startTime DATETIME,
      endTime DATETIME,
      rewards TEXT DEFAULT '[]',
      experience INTEGER DEFAULT 0,
      skillType TEXT NOT NULL,
      energyCost INTEGER NOT NULL,
      queuePosition INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_game_data_userId ON game_data(userId);
    CREATE INDEX IF NOT EXISTS idx_task_queue_userId ON task_queue(userId);
    CREATE INDEX IF NOT EXISTS idx_task_queue_status ON task_queue(status);
    CREATE INDEX IF NOT EXISTS idx_task_queue_position ON task_queue(queuePosition);
  `)

  console.log('数据库初始化完成')
}

// 用户相关数据库操作
export const userDb = {
  // 创建用户
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const stmt = db.prepare(`
      INSERT INTO users (username, password, email, level, experience, energy, maxEnergy, coins, gems)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      userData.username,
      hashedPassword,
      userData.email || null,
      userData.level,
      userData.experience,
      userData.energy,
      userData.maxEnergy,
      userData.coins,
      userData.gems
    )
    
    const user = this.findById(result.lastInsertRowid as number)
    if (!user) throw new Error('创建用户失败')
    
    // 创建对应的游戏数据
    gameDataDb.create(user.id)
    
    return user
  },

  // 根据ID查找用户
  findById(id: number): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id) as User | null
  },

  // 根据用户名查找用户
  findByUsername(username: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    return stmt.get(username) as User | null
  },

  // 验证密码
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  },

  // 更新用户信息
  update(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    
    stmt.run(...values, id)
    return this.findById(id)
  },

  // 更新最后登录时间
  updateLastLogin(id: number): void {
    const stmt = db.prepare('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?')
    stmt.run(id)
  }
}

// 游戏数据相关数据库操作
export const gameDataDb = {
  // 创建游戏数据
  create(userId: number): GameData {
    const stmt = db.prepare(`
      INSERT INTO game_data (userId, farmingLevel, farmingExp, miningLevel, miningExp, agricultureLevel, agricultureExp, fishingLevel, fishingExp)
      VALUES (?, 1, 0, 1, 0, 1, 0, 1, 0)
    `)
    
    const result = stmt.run(userId)
    const gameData = this.findByUserId(userId)
    if (!gameData) throw new Error('创建游戏数据失败')
    
    return gameData
  },

  // 根据用户ID查找游戏数据
  findByUserId(userId: number): GameData | null {
    const stmt = db.prepare('SELECT * FROM game_data WHERE userId = ?')
    return stmt.get(userId) as GameData | null
  },

  // 更新游戏数据
  update(userId: number, updates: Partial<Omit<GameData, 'id' | 'userId' | 'createdAt'>>): GameData | null {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    
    const stmt = db.prepare(`
      UPDATE game_data 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE userId = ?
    `)
    
    stmt.run(...values, userId)
    return this.findByUserId(userId)
  },

  // 更新采集状态
  updateCollectingStatus(userId: number, isCollecting: boolean, taskId?: string, progress?: number): void {
    const stmt = db.prepare(`
      UPDATE game_data 
      SET isCollecting = ?, collectingTaskId = ?, collectingProgress = ?, 
          collectingStartTime = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE userId = ?
    `)
    
    stmt.run(
      isCollecting ? 1 : 0,  // 转换布尔值为数字
      taskId || null,
      progress || 0,
      isCollecting ? new Date().toISOString() : null,
      userId
    )
  }
}

// 任务队列相关数据库操作
export const taskQueueDb = {
  // 添加任务到队列
  addTask(userId: number, taskData: Omit<TaskQueue, 'id' | 'createdAt' | 'updatedAt' | 'queuePosition'>): TaskQueue {
    // 获取当前用户队列中的最大位置
    const maxPositionStmt = db.prepare('SELECT MAX(queuePosition) as maxPos FROM task_queue WHERE userId = ? AND status != "completed" AND status != "cancelled"')
    const result = maxPositionStmt.get(userId) as { maxPos: number | null }
    const nextPosition = (result.maxPos || 0) + 1
    
    const stmt = db.prepare(`
      INSERT INTO task_queue (
        userId, taskType, taskName, duration, count, remainingCount, 
        status, rewards, experience, skillType, energyCost, queuePosition
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const insertResult = stmt.run(
      userId,
      taskData.taskType,
      taskData.taskName,
      taskData.duration,
      taskData.count,
      taskData.remainingCount,
      taskData.status,
      taskData.rewards,
      taskData.experience,
      taskData.skillType,
      taskData.energyCost,
      nextPosition
    )
    
    const task = this.findById(insertResult.lastInsertRowid as number)
    if (!task) throw new Error('创建任务失败')
    
    return task
  },

  // 根据ID查找任务
  findById(id: number): TaskQueue | null {
    const stmt = db.prepare('SELECT * FROM task_queue WHERE id = ?')
    return stmt.get(id) as TaskQueue | null
  },

  // 获取用户的任务队列
  getUserQueue(userId: number): TaskQueue[] {
    const stmt = db.prepare(`
      SELECT * FROM task_queue 
      WHERE userId = ? AND status != "completed" AND status != "cancelled"
      ORDER BY queuePosition ASC
    `)
    return stmt.all(userId) as TaskQueue[]
  },

  // 获取下一个待执行的任务
  getNextPendingTask(userId: number): TaskQueue | null {
    const stmt = db.prepare(`
      SELECT * FROM task_queue 
      WHERE userId = ? AND status = "pending"
      ORDER BY queuePosition ASC
      LIMIT 1
    `)
    return stmt.get(userId) as TaskQueue | null
  },

  // 获取当前正在执行的任务
  getCurrentRunningTask(userId: number): TaskQueue | null {
    const stmt = db.prepare(`
      SELECT * FROM task_queue 
      WHERE userId = ? AND status = "running"
      LIMIT 1
    `)
    return stmt.get(userId) as TaskQueue | null
  },

  // 更新任务状态
  updateTask(id: number, updates: Partial<Omit<TaskQueue, 'id' | 'userId' | 'createdAt'>>): TaskQueue | null {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    
    const stmt = db.prepare(`
      UPDATE task_queue 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    
    stmt.run(...values, id)
    return this.findById(id)
  },

  // 删除任务
  deleteTask(id: number): boolean {
    const stmt = db.prepare('DELETE FROM task_queue WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  // 获取队列长度
  getQueueLength(userId: number): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM task_queue 
      WHERE userId = ? AND status != "completed" AND status != "cancelled"
    `)
    const result = stmt.get(userId) as { count: number }
    return result.count
  },

  // 重新排序队列
  reorderQueue(userId: number): void {
    const tasks = this.getUserQueue(userId)
    tasks.forEach((task, index) => {
      this.updateTask(task.id, { queuePosition: index + 1 })
    })
  },

  // 根据ID获取任务（用于WebSocket）
  getTaskById(id: number): TaskQueue | null {
    return this.findById(id)
  },

  // 移除任务（用于WebSocket）
  removeTask(id: number): boolean {
    const stmt = db.prepare('UPDATE task_queue SET status = "cancelled", updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  // 添加任务（WebSocket版本）
  addTaskForSocket(taskData: any): number {
    // 获取当前用户队列中的最大位置
    const maxPositionStmt = db.prepare('SELECT MAX(queuePosition) as maxPos FROM task_queue WHERE userId = ? AND status != "completed" AND status != "cancelled"')
    const result = maxPositionStmt.get(taskData.userId) as { maxPos: number | null }
    const nextPosition = (result.maxPos || 0) + 1
    
    const stmt = db.prepare(`
      INSERT INTO task_queue (
        userId, taskType, taskName, duration, totalCount, remainingCount, 
        status, rewards, experience, skillType, energyCost, queuePosition
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
    `)
    
    const insertResult = stmt.run(
      taskData.userId,
      taskData.taskType,
      taskData.taskName,
      taskData.duration,
      taskData.totalCount,
      taskData.remainingCount,
      taskData.rewards,
      taskData.experience,
      taskData.skillType,
      taskData.energyCost,
      nextPosition
    )
    
    return insertResult.lastInsertRowid as number
  }
}

// 数据库迁移函数
export function migrateDatabase() {
  try {
    // 检查是否需要添加技能字段
    const tableInfo = db.prepare("PRAGMA table_info(game_data)").all() as any[]
    const hasSkillFields = tableInfo.some(col => col.name === 'farmingLevel')
    const hasAgricultureFields = tableInfo.some(col => col.name === 'agricultureLevel')
    const hasFishingFields = tableInfo.some(col => col.name === 'fishingLevel')
    
    if (!hasSkillFields) {
      console.log('正在添加基础技能字段到数据库...')
      
      // 添加基础技能相关字段
      db.exec(`
        ALTER TABLE game_data ADD COLUMN farmingLevel INTEGER DEFAULT 1;
        ALTER TABLE game_data ADD COLUMN farmingExp INTEGER DEFAULT 0;
        ALTER TABLE game_data ADD COLUMN miningLevel INTEGER DEFAULT 1;
        ALTER TABLE game_data ADD COLUMN miningExp INTEGER DEFAULT 0;
      `)
      
      console.log('基础技能字段添加完成')
    }
    
    if (!hasAgricultureFields) {
      console.log('正在添加农业技能字段到数据库...')
      
      // 添加农业技能字段
      db.exec(`
        ALTER TABLE game_data ADD COLUMN agricultureLevel INTEGER DEFAULT 1;
        ALTER TABLE game_data ADD COLUMN agricultureExp INTEGER DEFAULT 0;
      `)
      
      console.log('农业技能字段添加完成')
    }
    
    if (!hasFishingFields) {
      console.log('正在添加钓鱼技能字段到数据库...')
      
      // 添加钓鱼技能字段
      db.exec(`
        ALTER TABLE game_data ADD COLUMN fishingLevel INTEGER DEFAULT 1;
        ALTER TABLE game_data ADD COLUMN fishingExp INTEGER DEFAULT 0;
      `)
      
      console.log('钓鱼技能字段添加完成')
    }
  } catch (error) {
    console.error('数据库迁移错误:', error)
  }
}

// 在服务器启动时初始化数据库
if (process.env.NODE_ENV !== 'test') {
  initDatabase()
  migrateDatabase()
}