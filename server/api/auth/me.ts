import { verifyToken } from '~/server/utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 尝试从多个来源获取token
    let token = getCookie(event, 'auth-token') || 
                getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error('No token provided')
    }

    const payload = verifyToken(token) as any
    if (!payload.userId) {
      throw new Error('Invalid token payload')
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, username: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // 获取角色信息
    let character = await prisma.character.findUnique({
      where: { userId: user.id }
    })

    // 如果角色不存在，创建默认角色
    if (!character) {
      character = await prisma.character.create({
        data: {
          userId: user.id,
          name: '默认角色',
          level: 1,
          exp: 0,
          miningLevel: 1,
          gatheringLevel: 1,
          fishingLevel: 1,
          cookingLevel: 1,
          craftingLevel: 1,
          miningExp: 0,
          gatheringExp: 0,
          fishingExp: 0,
          cookingExp: 0,
          craftingExp: 0,
          coins: 1000,
          lastOnline: new Date().toISOString()
        }
      })
    }

    return {
      success: true,
      data: {
        user,
        character
      }
    }
  } catch (error) {
    console.error('Auth me error:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed'
    })
  }
})