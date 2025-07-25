import { seedDatabase } from '../database/seed'

export default defineNitroPlugin(async (nitroApp) => {
  console.log('正在初始化数据库...')
  
  try {
    // 初始化数据库并添加种子数据
    await seedDatabase()
    console.log('数据库初始化完成')
  } catch (error) {
    console.error('数据库初始化失败:', error)
  }
})