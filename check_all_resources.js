const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllResources() {
  try {
    console.log('=== 检查数据库中的所有资源 ===');
    
    const allResources = await prisma.gameResource.findMany();
    
    console.log(`总共找到 ${allResources.length} 个资源:`);
    
    const resourcesByType = {};
    allResources.forEach(resource => {
      if (!resourcesByType[resource.type]) {
        resourcesByType[resource.type] = [];
      }
      resourcesByType[resource.type].push(resource);
    });
    
    Object.keys(resourcesByType).forEach(type => {
      console.log(`\n${type.toUpperCase()} 类型资源 (${resourcesByType[type].length}个):`);
      resourcesByType[type].forEach(resource => {
        console.log(`  - ${resource.name} (ID: ${resource.id.substring(0, 20)}...)`);
        console.log(`    基础时间: ${resource.baseTime}秒, 经验: ${resource.expReward}`);
      });
    });
    
  } catch (error) {
    console.error('检查资源时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllResources();