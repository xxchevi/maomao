import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event)

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名和密码不能为空'
      })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        character: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误'
      })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误'
      })
    }

    // 生成JWT token
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

    // 更新最后在线时间
    if (user.character) {
      await prisma.character.update({
        where: { id: user.character.id },
        data: { lastOnline: new Date() }
      })
    }

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        character: user.character
      }
    }
  } catch (error:any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '登录失败'
    })
  }
})