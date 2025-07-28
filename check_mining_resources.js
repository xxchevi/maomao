const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMiningResources() {
  try {
    console.log('=== 检查数据库中的挖矿资源 ===');
    
    const miningResources = await prisma.gameResource.findMany({
      where: { type: 'mining' }
    });
    
    console.log(`找到 ${miningResources.length} 个挖矿资源:`);
    miningResources.forEach(resource => {
      console.log(`- ID: ${resource.id}`);
      console.log(`  名称: ${resource.name}`);
      console.log(`  类型: ${resource.type}`);
      console.log(`  基础时间: ${resource.baseTime}秒`);
      console.log(`  经验奖励: ${resource.expReward}`);
      console.log('---');
    });
    
    if (miningResources.length === 0) {
      console.log('❌ 没有找到挖矿资源！这可能是问题所在。');
    } else {
      console.log('✅ 找到挖矿资源，应该可以创建测试队列。');
    }
    
  } catch (error) {
    console.error('检查挖矿资源时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMiningResources();