import jwt from 'jsonwebtoken'
import { userDb, gameDataDb } from '../../../database/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default defineEventHandler(async (event) => {
  try {
    // 验证JWT token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: '未提供有效的认证token'
      })
    }

    const token = authHeader.substring(7)
    let decoded: any
    
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'token无效或已过期'
      })
    }

    // 获取用户信息
    const user = userDb.findById(decoded.userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    }

    // 获取游戏数据
    const gameData = gameDataDb.findByUserId(user.id)
    if (!gameData) {
      throw createError({
        statusCode: 404,
        statusMessage: '游戏数据不存在'
      })
    }

    // 解析JSON字段
    const inventory = JSON.parse(gameData.inventory || '[]')
    const achievements = JSON.parse(gameData.achievements || '[]')
    const settings = JSON.parse(gameData.settings || '{}')

    // 返回用户和游戏数据（不包含密码）
    const { password: _, ...userInfo } = user
    
    // 计算技能等级信息
    const skills = {
      farming: {
        level: gameData.farmingLevel,
        experience: gameData.farmingExp,
        nextLevelExp: gameData.farmingLevel * 100,
        progress: Math.min(Math.floor((gameData.farmingExp / (gameData.farmingLevel * 100)) * 100), 100)
      },
      mining: {
        level: gameData.miningLevel,
        experience: gameData.miningExp,
        nextLevelExp: gameData.miningLevel * 100,
        progress: Math.min(Math.floor((gameData.miningExp / (gameData.miningLevel * 100)) * 100), 100)
      }
    }
    
    return {
      success: true,
      user: userInfo,
      gameData: {
        ...gameData,
        inventory,
        achievements,
        settings,
        skills
      }
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('获取用户数据错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})