import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const startCollectSchema = z.object({
  taskType: z.string(),
  duration: z.number().min(1).max(3600) // 1秒到1小时
})

export default defineEventHandler(async (event) => {
  try {
    // 验证请求方法
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // 获取并验证token
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // 验证请求体
    const body = await readBody(event)
    const validatedData = startCollectSchema.parse(body)

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // 检查用户是否已经在执行任务
    const existingTask = await prisma.collectTask.findFirst({
      where: {
        userId: user.id,
        status: 'active'
      }
    })

    if (existingTask) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User already has an active task'
      })
    }

    // 创建新的采集任务
    const task = await prisma.collectTask.create({
      data: {
        userId: user.id,
        taskType: validatedData.taskType,
        duration: validatedData.duration,
        startTime: new Date(),
        endTime: new Date(Date.now() + validatedData.duration * 1000),
        status: 'active'
      }
    })

    return {
      success: true,
      task: {
        id: task.id,
        taskType: task.taskType,
        duration: task.duration,
        startTime: task.startTime,
        endTime: task.endTime,
        status: task.status
      }
    }

  } catch (error: any) {
    console.error('Start collect task error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.errors
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})