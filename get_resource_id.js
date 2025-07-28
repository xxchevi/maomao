const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getResourceId() {
  try {
    const resource = await prisma.gameResource.findFirst({
      where: { name: '废弃矿洞' }
    });
    
    if (resource) {
      console.log('完整资源ID:', resource.id);
      console.log('资源名称:', resource.name);
      console.log('基础时间:', resource.baseTime);
    } else {
      console.log('未找到废弃矿洞资源');
    }
  } catch (error) {
    console.error('错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getResourceId();