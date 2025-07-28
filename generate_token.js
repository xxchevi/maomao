const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function generateToken() {
  try {
    // 获取第一个用户
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('没有找到用户');
      return;
    }
    
    console.log('找到用户:', user.username, user.id);
    
    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id },
      'your-secret-key', // 使用默认的JWT密钥
      { expiresIn: '24h' }
    );
    
    console.log('生成的token:', token);
    
    // 保存token到文件
    fs.writeFileSync('token.txt', token);
    console.log('Token已保存到token.txt文件');
    
  } catch (error) {
    console.error('错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateToken();