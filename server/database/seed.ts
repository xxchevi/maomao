import { userDb, initDatabase } from './db'

// 初始化数据库并添加测试数据
export async function seedDatabase() {
  try {
    // 确保数据库已初始化
    initDatabase()
    
    // 检查是否已有测试用户
    const existingUser = userDb.findByUsername('testuser')
    if (existingUser) {
      console.log('测试用户已存在，跳过种子数据创建')
      return
    }
    
    // 创建测试用户
    const testUser = await userDb.create({
      username: 'test',
      password: '1234',
      email: 'test@example.com',
      level: 1,
      experience: 0,
      coins: 100,
      gems: 10
    })
    
    console.log('测试用户创建成功:', testUser.username)
    
    // 可以添加更多测试数据
    const adminUser = await userDb.create({
      username: 'admin',
      password: '1234',
      email: 'admin@example.com',
      level: 10,
      experience: 1000,
      coins: 1000,
      gems: 100
    })
    
    console.log('管理员用户创建成功:', adminUser.username)
    
  } catch (error) {
    console.error('种子数据创建失败:', error)
  }
}

// 如果直接运行此文件，执行种子数据创建
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
}