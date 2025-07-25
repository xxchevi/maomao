import jwt from 'jsonwebtoken'
import { userDb } from '../../database/db'

// JWT密钥 - 在生产环境中应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default defineEventHandler(async (event) => {
  try {
    // 验证请求方法
    if (event.node.req.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // 获取请求体
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username and password are required'
      })
    }

    // 查找用户
    const user = userDb.findByUsername(username)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid username or password'
      })
    }

    // 验证密码
    const isValidPassword = await userDb.verifyPassword(password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid username or password'
      })
    }

    // 更新最后登录时间
    userDb.updateLastLogin(user.id)

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    }

  } catch (error: any) {
    console.error('登录错误:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})