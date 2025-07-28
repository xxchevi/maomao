const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkResourceTime() {
  try {
    const resource = await prisma.gameResource.findUnique({
      where: { id: 'cmdk1lygz000irkknoomk15hp' }
    });
    
    if (resource) {
      console.log('废弃矿洞资源信息:');
      console.log('- ID:', resource.id);
      console.log('- 名称:', resource.name);
      console.log('- 基础时间:', resource.baseTime, '秒');
      console.log('- 经验奖励:', resource.expReward);
      console.log('- 掉落率:', resource.dropRate);
    } else {
      console.log('未找到指定的资源');
    }
  } catch (error) {
    console.error('查询资源信息失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResourceTime();