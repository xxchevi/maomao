import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const resourceId = query.resourceId as string
    const activityType = query.activityType as string
    
    if (!resourceId || !activityType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing resourceId or activityType'
      })
    }
    
    // 获取资源基本信息
    const resource = await prisma.gameResource.findUnique({
      where: { id: resourceId }
    })
    
    if (!resource) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Resource not found'
      })
    }
    
    // 获取关联的物品信息
    const item = await prisma.item.findUnique({
      where: { id: resource.itemId }
    })
    
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Associated item not found'
      })
    }
    
    // 获取用户技能等级（如果有token的话）
    let skillLevel = 1
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        const character = await prisma.character.findUnique({
          where: { userId: decoded.userId }
        })
        
        if (character) {
          switch (activityType) {
            case 'mining':
              skillLevel = character.miningLevel
              break
            case 'gathering':
              skillLevel = character.gatheringLevel
              break
            case 'fishing':
              skillLevel = character.fishingLevel
              break
          }
        }
      } catch (error) {
        // 忽略token错误，使用默认技能等级
      }
    }
    
    // 计算掉落信息
    const dropInfo = await calculateDropInfo(activityType, skillLevel, resource, item)
    
    return {
      success: true,
      data: {
        resource: {
          id: resource.id,
          name: resource.name,
          baseTime: resource.baseTime,
          expReward: resource.expReward,
          levelReq: resource.levelReq,
          mainItem: item
        },
        skillLevel,
        drops: dropInfo.drops,
        skillExp: dropInfo.skillExp
      }
    }
    
  } catch (error) {
    console.error('Get resource info error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

// 计算掉落信息的函数
async function calculateDropInfo(activityType: string, skillLevel: number, resource: any, item: any) {
  const drops = []
  
  // 主要物品掉落
  const baseDropRate = Math.min(0.8 + (skillLevel * 0.01), 0.95)
  drops.push({
    item: item,
    minQuantity: 1,
    maxQuantity: Math.min(1 + Math.floor(skillLevel / 10), 3),
    dropRate: baseDropRate,
    color: getItemColor(item.rarity)
  })
  
  // 获取可能的额外掉落物品
  const possibleItems = await getPossibleDropsByActivity(activityType, skillLevel)
  
  for (const item of possibleItems) {
    const dropChance = item.dropRate * (1 + skillLevel * 0.005)
    drops.push({
      item: {
        id: item.id,
        name: item.name,
        rarity: item.rarity
      },
      minQuantity: 1,
      maxQuantity: 1,
      dropRate: dropChance,
      color: getItemColor(item.rarity)
    })
  }
  
  // 技能经验信息
  const skillExp = {
    type: getSkillName(activityType),
    amount: resource.expReward
  }
  
  return { drops, skillExp }
}

// 根据活动类型获取可能的掉落物品
async function getPossibleDropsByActivity(activityType: string, skillLevel: number) {
  const items = []
  
  switch (activityType) {
    case 'mining':
      const miningItems = await prisma.item.findMany({
        where: {
          type: 'material',
          name: {
            contains: '矿石'
          }
        }
      })
      
      for (const item of miningItems) {
        let dropRate = 0
        switch (item.rarity) {
          case 'common': dropRate = skillLevel >= 1 ? 0.15 : 0; break
          case 'uncommon': dropRate = skillLevel >= 10 ? 0.08 : 0; break
          case 'rare': dropRate = skillLevel >= 25 ? 0.04 : 0; break
          case 'epic': dropRate = skillLevel >= 40 ? 0.02 : 0; break
          case 'legendary': dropRate = skillLevel >= 60 ? 0.01 : 0; break
        }
        if (dropRate > 0) {
          items.push({ ...item, dropRate })
        }
      }
      break
      
    case 'gathering':
      const gatheringItems = await prisma.item.findMany({
        where: {
          OR: [
            { name: { contains: '草' } },
            { name: { contains: '莓' } },
            { name: { contains: '药' } },
            { name: { contains: '花' } },
            { name: { contains: '叶' } },
            { name: { contains: '果实' } }
          ]
        }
      })
      
      for (const item of gatheringItems) {
        let dropRate = 0
        switch (item.rarity) {
          case 'common': dropRate = skillLevel >= 1 ? 0.12 : 0; break
          case 'uncommon': dropRate = skillLevel >= 8 ? 0.06 : 0; break
          case 'rare': dropRate = skillLevel >= 20 ? 0.03 : 0; break
          case 'epic': dropRate = skillLevel >= 35 ? 0.015 : 0; break
          case 'legendary': dropRate = skillLevel >= 55 ? 0.008 : 0; break
        }
        if (dropRate > 0) {
          items.push({ ...item, dropRate })
        }
      }
      break
      
    case 'fishing':
      const fishingItems = await prisma.item.findMany({
        where: {
          name: {
            contains: '鱼'
          }
        }
      })
      
      for (const item of fishingItems) {
        let dropRate = 0
        switch (item.rarity) {
          case 'common': dropRate = skillLevel >= 1 ? 0.18 : 0; break
          case 'uncommon': dropRate = skillLevel >= 12 ? 0.09 : 0; break
          case 'rare': dropRate = skillLevel >= 28 ? 0.045 : 0; break
          case 'epic': dropRate = skillLevel >= 45 ? 0.02 : 0; break
          case 'legendary': dropRate = skillLevel >= 65 ? 0.01 : 0; break
        }
        if (dropRate > 0) {
          items.push({ ...item, dropRate })
        }
      }
      break
  }
  
  return items
}

// 获取物品颜色
function getItemColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'bg-gray-500'
    case 'uncommon': return 'bg-green-500'
    case 'rare': return 'bg-blue-500'
    case 'epic': return 'bg-purple-500'
    case 'legendary': return 'bg-yellow-500'
    default: return 'bg-gray-500'
  }
}

// 获取技能名称
function getSkillName(activityType: string): string {
  switch (activityType) {
    case 'mining': return '挖矿'
    case 'gathering': return '采集'
    case 'fishing': return '钓鱼'
    default: return '未知'
  }
}