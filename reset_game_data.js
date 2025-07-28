const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetGameData() {
  console.log('开始重置游戏数据...')
  
  try {
    // 1. 删除所有离线任务
    console.log('删除所有离线任务...')
    const deletedTasks = await prisma.offlineTask.deleteMany({})
    console.log(`删除了 ${deletedTasks.count} 个离线任务`)
    
    // 2. 删除所有仓库物品
    console.log('删除所有仓库物品...')
    const deletedInventory = await prisma.inventoryItem.deleteMany({})
    console.log(`删除了 ${deletedInventory.count} 个仓库物品`)
    
    // 3. 重置所有角色数据（保留角色但重置等级、经验、金币等）
    console.log('重置所有角色数据...')
    const updatedCharacters = await prisma.character.updateMany({
      data: {
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
        coins: 100,
        lastOnline: new Date()
      }
    })
    console.log(`重置了 ${updatedCharacters.count} 个角色的数据`)
    
    console.log('\n✅ 游戏数据重置完成！')
    console.log('重置内容：')
    console.log('- 清空所有离线任务和队列')
    console.log('- 清空所有仓库物品')
    console.log('- 重置角色等级和经验到初始状态')
    console.log('- 重置金币到100')
    console.log('\n保留内容：')
    console.log('- 用户账户信息')
    console.log('- 游戏物品和资源点数据')
    
  } catch (error) {
    console.error('重置游戏数据时发生错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  resetGameData()
    .then(() => {
      console.log('\n脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('脚本执行失败:', error)
      process.exit(1)
    })
}

module.exports = { resetGameData }