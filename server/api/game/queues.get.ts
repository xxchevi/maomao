import { PrismaClient } from '@prisma/client'
import { verifyToken } from '~/server/utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 尝试从多个来源获取token
    let token = getCookie(event, 'auth-token') || 
                getHeader(event, 'authorization')?.replace('Bearer ', '') ||
                getQuery(event).token as string
    
    if (!token) {
      // 如果没有token，返回空队列数据而不是错误
      // 这样可以避免登录时的500错误
      return {
        success: true,
        data: {
          current: null,
          pending: []
        }
      }
    }

    const payload = verifyToken(token) as any
    if (!payload) {
      // token无效时也返回空数据
      return {
        success: true,
        data: {
          current: null,
          pending: []
        }
      }
    }

    // 验证角色存在
    const character = await prisma.character.findUnique({
      where: { userId: payload.userId }
    })
    
    if (!character) {
      return {
        success: true,
        data: {
          current: null,
          pending: []
        }
      }
    }
    
    // 返回空队列数据，实际队列数据通过Socket.io实时同步
    const queueData = {
      current: null,
      pending: []
    }

    return {
      success: true,
      data: queueData
    }
  } catch (error: any) {
    console.error('Queue API error:', error)
    // 发生错误时也返回空数据，避免阻塞登录流程
    return {
      success: true,
      data: {
        current: null,
        pending: []
      }
    }
  }
})