import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const { username, nickname, email, password } = await readBody(event)

    if (!username || !nickname || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名、昵称和密码是必填的'
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: '密码长度至少为6位'
      })
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUserByEmail) {
        throw createError({
          statusCode: 400,
          statusMessage: '邮箱已被注册'
        })
      }
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUserByUsername) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名已被使用'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户和角色
    const user = await prisma.user.create({
      data: {
        email: email || null,
        username,
        password: hashedPassword,
        character: {
          create: {
            name: nickname
          }
        }
      },
      include: {
        character: true
      }
    })

    // 生成JWT token
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

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
      statusMessage: error.statusMessage || '注册失败'
    })
  }
})