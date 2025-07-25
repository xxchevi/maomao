import jwt from 'jsonwebtoken'

// 模拟数据库存储（与其他文件共享）
const users: any[] = []

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: '未提供认证令牌'
      })
    }
    
    const token = authHeader.substring(7)
    
    // 验证JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as any
    
    // 查找用户并更新在线状态
    const user = users.find(u => u.id === decoded.userId)
    if (user) {
      user.isOnline = false
      user.lastLogoutAt = new Date().toISOString()
    }
    
    return {
      success: true,
      message: '登出成功'
    }
  } catch (error: any) {
    // 即使token无效，也返回成功（因为目标是登出）
    return {
      success: true,
      message: '登出成功'
    }
  }
})