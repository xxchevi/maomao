import jwt from 'jsonwebtoken'
import { userDb } from '../../database/db'

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
    const user = userDb.findById(decoded.userId)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户不存在'
      })
    }
    
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
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
      statusMessage: error.statusMessage || '获取用户信息失败'
    })
  }
})