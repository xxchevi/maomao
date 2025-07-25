import { userDb } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, email, password } = body
    
    // 验证输入
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名和密码不能为空'
      })
    }
    
    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名长度必须在3-20个字符之间'
      })
    }
    
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: '密码长度至少6位'
      })
    }
    
    // 检查用户名是否已存在
    const existingUser = userDb.findByUsername(username)
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: '用户名已存在'
      })
    }
    
    // 创建新用户
    const newUser = await userDb.create({
      username,
      password,
      email: email || undefined,
      level: 1,
      experience: 0,
      coins: 0,
      gems: 0
    })
    
    // 返回成功信息（不包含密码）
    const { password: _, ...userInfo } = newUser
    
    return {
      success: true,
      message: '注册成功',
      user: userInfo
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 处理数据库约束错误
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw createError({
        statusCode: 409,
        statusMessage: '用户名已存在'
      })
    }

    // 未知错误
    console.error('注册错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})