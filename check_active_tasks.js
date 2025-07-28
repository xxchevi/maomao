const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkActiveTasks() {
  try {
    const activeTasks = await prisma.offlineTask.findMany({
      where: { 
        status: 'active',
        characterId: 'cmdk24s1l000011gvupz8bpw3' // 使用测试用户ID
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        character: {
          select: { name: true }
        }
      }
    });
    
    console.log(`找到 ${activeTasks.length} 个活跃任务:`);
    
    activeTasks.forEach((task, index) => {
      console.log(`${index + 1}. ID: ${task.id}`);
      console.log(`   类型: ${task.type}`);
      console.log(`   目标ID: ${task.targetId}`);
      console.log(`   重复次数: ${task.currentRepeat}/${task.totalRepeat}`);
      console.log(`   创建时间: ${task.createdAt}`);
      console.log(`   角色: ${task.character?.name}`);
      console.log('---');
    });
    
    // 清理所有旧的active任务
    if (activeTasks.length > 0) {
      console.log('\n是否要清理所有旧的active任务？这将帮助测试新的队列功能。');
      console.log('正在清理...');
      
      const result = await prisma.offlineTask.updateMany({
        where: {
          status: 'active',
          characterId: 'cmdk24s1l000011gvupz8bpw3'
        },
        data: {
          status: 'cancelled'
        }
      });
      
      console.log(`已清理 ${result.count} 个旧任务`);
    }
    
  } catch (error) {
    console.error('查询活跃任务失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveTasks();