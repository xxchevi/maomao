const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGatheringResources() {
  try {
    const resources = await prisma.gameResource.findMany({
      where: {
        type: 'GATHERING_SPOT'
      }
    });
    
    console.log('GATHERING_SPOT resources found:', resources.length);
    console.log('Resources:', JSON.stringify(resources, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGatheringResources();