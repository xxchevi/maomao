const { io } = require('socket.io-client');

// 使用之前生成的有效token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRrMjRzMWwwMDAwMTFndnVwejhicHczIiwiaWF0IjoxNzUzNjg3NTAyLCJleHAiOjE3NTM3NzM5MDJ9.V8BuAuMKhByhefvj8Qc-vO2DhH0cZddP_75jkfRiME8';

console.log('=== 测试短时间队列完成和切换 ===');

const socket = io('http://localhost:3000', {
  auth: {
    token: token
  }
});

let testStartTime = 0;

socket.on('connect', () => {
  console.log('已连接到服务器');
  
  setTimeout(() => {
    console.log('\n先清理所有现有队列...');
    socket.emit('stop_current_queue');
    
    setTimeout(() => {
      testStartTime = Date.now();
      console.log('\n创建短时间测试队列（3秒）...');
      socket.emit('test_create_short_queue');
      
      setTimeout(() => {
        console.log('\n添加第二个短时间队列到待处理队列...');
        socket.emit('test_create_short_queue');
      }, 1000);
    }, 1000);
  }, 1000);
});

function getElapsedTime() {
  if (testStartTime === 0) return '0s';
  return `${((Date.now() - testStartTime) / 1000).toFixed(1)}s`;
}

socket.on('current_queue_updated', (data) => {
  if (data) {
    console.log(`\n[${getElapsedTime()}] *** current_queue_updated ***:`, {
      id: data.id.substring(0, 20) + '...',
      resourceName: data.resourceName,
      currentRepeat: data.currentRepeat,
      totalRepeat: data.totalRepeat,
      progress: data.progress,
      hasStartTime: !!data.startTime
    });
  } else {
    console.log(`\n[${getElapsedTime()}] *** current_queue_updated: null ***`);
  }
});

socket.on('queue_updated', (data) => {
  console.log(`[${getElapsedTime()}] queue_updated, 待处理队列数量:`, data.length);
});

socket.on('queue_completed', (data) => {
  console.log(`\n[${getElapsedTime()}] *** queue_completed ***:`, {
    queueId: data?.queueId?.substring(0, 20) + '...',
    resourceName: data?.resourceName,
    message: data?.message
  });
});

socket.on('test_short_queue_created', (data) => {
  console.log(`[${getElapsedTime()}] 短时间测试队列已创建:`, data.message);
});

socket.on('character_updated', (data) => {
  console.log(`[${getElapsedTime()}] 角色更新 - 经验:`, data.exp, '挖矿经验:', data.miningExp);
});

socket.on('inventory_updated', (data) => {
  console.log(`[${getElapsedTime()}] 仓库更新，物品数量:`, data.length);
});

socket.on('connect_error', (error) => {
  console.error('连接错误:', error);
});

// 每2秒输出一次当前时间
const progressInterval = setInterval(() => {
  if (testStartTime > 0) {
    console.log(`[${getElapsedTime()}] 等待队列完成中...`);
  }
}, 2000);

// 15秒后断开连接
setTimeout(() => {
  clearInterval(progressInterval);
  console.log(`\n[${getElapsedTime()}] === 测试完成，断开连接 ===`);
  socket.disconnect();
  process.exit(0);
}, 15000);