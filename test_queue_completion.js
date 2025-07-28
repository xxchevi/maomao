const { io } = require('socket.io-client');

// 使用之前生成的有效token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRrMjRzMWwwMDAwMTFndnVwejhicHczIiwiaWF0IjoxNzUzNjg3NTAyLCJleHAiOjE3NTM3NzM5MDJ9.V8BuAuMKhByhefvj8Qc-vO2DhH0cZddP_75jkfRiME8';

console.log('=== 测试队列完成和切换问题 ===');
console.log('注意：废弃矿洞的实际baseTime是30秒，所以需要等待30秒才能看到队列完成');

const socket = io('http://localhost:3000', {
  auth: {
    token: token
  }
});

let testStartTime = 0;

socket.on('connect', () => {
  console.log('\n已连接到服务器');
  
  setTimeout(() => {
    console.log('\n先清理所有现有队列...');
    // 先停止当前队列
    socket.emit('stop_current_queue');
    
    setTimeout(() => {
      testStartTime = Date.now();
      console.log('\n添加第一个测试队列（30秒，重复1次）...');
      socket.emit('start_immediately', {
        id: `test_first_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        activityType: 'mining',
        resourceId: 'cmdk1lygz000irkknoomk15hp', // 废弃矿洞 - 30秒
        resourceName: '废弃矿洞',
        totalRepeat: 1, // 只重复1次
        currentRepeat: 1,
        baseTime: 30, // 实际的baseTime
        expReward: 15,
        progress: 0,
        remainingTime: 30,
        estimatedTime: 30,
        createdAt: Date.now()
      });
      
      setTimeout(() => {
        console.log('\n添加第二个队列到待处理队列...');
        socket.emit('add_to_queue', {
          id: `test_second_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          activityType: 'mining',
          resourceId: 'cmdk1lygz000irkknoomk15hp',
          resourceName: '废弃矿洞',
          totalRepeat: 1,
          currentRepeat: 1,
          baseTime: 30,
          expReward: 15,
          progress: 0,
          remainingTime: 30,
          estimatedTime: 30,
          createdAt: Date.now()
        });
      }, 2000);
    }, 1000);
  }, 1000);
});

function getElapsedTime() {
  if (testStartTime === 0) return '0s';
  return `${((Date.now() - testStartTime) / 1000).toFixed(1)}s`;
}

socket.on('current_queue_updated', (data) => {
  if (data) {
    console.log(`\n[${getElapsedTime()}] *** 收到 current_queue_updated ***:`, {
      id: data.id.substring(0, 20) + '...',
      resourceName: data.resourceName,
      currentRepeat: data.currentRepeat,
      totalRepeat: data.totalRepeat,
      progress: data.progress,
      hasStartTime: !!data.startTime
    });
  } else {
    console.log(`\n[${getElapsedTime()}] *** 收到 current_queue_updated: null (没有当前队列) ***`);
  }
});

socket.on('queue_updated', (data) => {
  console.log(`[${getElapsedTime()}] 收到 queue_updated, 待处理队列数量:`, data.length);
  if (data.length > 0 && data.length <= 3) {
    console.log('待处理队列:', data.map(q => ({
      id: q.id.substring(0, 20) + '...',
      resourceName: q.resourceName,
      currentRepeat: q.currentRepeat,
      totalRepeat: q.totalRepeat
    })));
  }
});

socket.on('queue_completed', (data) => {
  console.log(`\n[${getElapsedTime()}] *** 收到 queue_completed 事件 ***:`, {
    queueId: data?.queueId,
    activityType: data?.activityType,
    resourceName: data?.resourceName,
    message: data?.message
  });
});

socket.on('character_updated', (data) => {
  console.log(`[${getElapsedTime()}] 角色更新 - 经验:`, data.exp, '挖矿经验:', data.miningExp);
});

socket.on('activity_completed', (data) => {
  console.log(`[${getElapsedTime()}] 活动完成:`, data.message);
});

socket.on('inventory_updated', (data) => {
  console.log(`[${getElapsedTime()}] 仓库更新，物品数量:`, data.length);
});

socket.on('connect_error', (error) => {
  console.error('连接错误:', error);
});

// 每5秒输出一次当前时间，方便观察
const progressInterval = setInterval(() => {
  if (testStartTime > 0) {
    console.log(`[${getElapsedTime()}] 等待队列完成中...`);
  }
}, 5000);

// 45秒后断开连接（给足够时间观察队列完成和切换）
setTimeout(() => {
  clearInterval(progressInterval);
  console.log(`\n[${getElapsedTime()}] === 测试完成，断开连接 ===`);
  socket.disconnect();
  process.exit(0);
}, 45000);