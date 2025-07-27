import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const resources = await prisma.gameResource.findMany({
      orderBy: [
        { area: 'asc' },
        { levelReq: 'asc' }
      ]
    })

    return {
      success: true,
      data: resources
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '获取资源点失败'
    })
  }
})