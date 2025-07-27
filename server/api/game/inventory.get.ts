import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const authorization = getHeader(event, 'authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: '未提供认证令牌'
      })
    }

    const token = authorization.substring(7)
    const config = useRuntimeConfig()
    
    let decoded: any
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: '无效的认证令牌'
      })
    }

    // 查找用户角色
    const character = await prisma.character.findUnique({
      where: { userId: decoded.userId },
      include: {
        inventory: {
          include: {
            item: true
          }
        }
      }
    })

    if (!character) {
      throw createError({
        statusCode: 404,
        statusMessage: '角色不存在'
      })
    }

    return {
      success: true,
      data: character.inventory
    }
  } catch (error:any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '获取仓库失败'
    })
  }
})