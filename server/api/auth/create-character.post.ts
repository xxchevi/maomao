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

    const body = await readBody(event)
    const { name } = body

    if (!name || name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '角色名称不能为空'
      })
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { character: true }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    }

    // 检查用户是否已有角色
    if (user.character) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户已有角色'
      })
    }

    // 创建角色
    const character = await prisma.character.create({
      data: {
        userId: user.id,
        name: name.trim()
      }
    })

    return {
      success: true,
      data: {
        character
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '创建角色失败'
    })
  }
})