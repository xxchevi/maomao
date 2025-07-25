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
    
    // 查找用户
    const user = users.find(u => u.id === decoded.userId)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户不存在'
      })
    }
    
    // 更新最后活跃时间
    user.lastActiveAt = new Date().toISOString()
    
    return {
      success: true,
      isOnline: user.isOnline,
      lastActiveAt: user.lastActiveAt,
      userId: user.id,
      uuid: user.uuid
    }
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: '无效的认证令牌'
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '检查在线状态失败'
    })
  }
})