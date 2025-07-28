const { io } = require('socket.io-client');

// 连接到服务器
const socket = io('http://localhost:3000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRrMjRzMWwwMDAwMTFndnVwejhicHczIiwiaWF0IjoxNzUzNjg3NTAyLCJleHAiOjE3NTM3NzM5MDJ9.V8BuAuMKhByhefvj8Qc-vO2DhH0cZddP_75jkfRiME8' // 使用有效的token
  }
});

socket.on('connect', () => {
  console.log('已连接到服务器');
  
  // 等待2秒后测试立即开始功能
  setTimeout(() => {
    console.log('\n=== 测试立即开始功能 ===');
    
    const newQueue = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      activityType: 'mining',
      resourceId: 'cmdk1lyhs000mrkkn2dmcqmsc', // 黄金矿脉
      resourceName: '黄金矿脉',
      totalRepeat: 3,
      currentRepeat: 1,
      progress: 0,
      remainingTime: 120,
      estimatedTime: 360,
      createdAt: Date.now(),
      baseTime: 120
    };
    
    console.log('发送立即开始队列:', newQueue);
    socket.emit('start_immediately', newQueue);
  }, 2000);
});

socket.on('current_queue_updated', (data) => {
  console.log('\n[CLIENT] 收到 current_queue_updated:', {
    id: data?.id,
    activityType: data?.activityType,
    resourceName: data?.resourceName,
    currentRepeat: data?.currentRepeat,
    totalRepeat: data?.totalRepeat,
    progress: data?.progress,
    startTime: data?.startTime ? new Date(data.startTime).toLocaleTimeString() : 'undefined'
  });
});

socket.on('queue_updated', (data) => {
  console.log('\n[CLIENT] 收到 queue_updated, 待处理队列数量:', data.length);
  if (data.length > 0) {
    console.log('前3个待处理队列:', data.slice(0, 3).map(q => ({
      id: q.id,
      resourceName: q.resourceName,
      currentRepeat: q.currentRepeat,
      totalRepeat: q.totalRepeat
    })));
  }
});

socket.on('disconnect', () => {
  console.log('已断开连接');
});

socket.on('connect_error', (error) => {
  console.error('连接错误:', error);
});

// 10秒后断开连接
setTimeout(() => {
  console.log('\n=== 测试完成，断开连接 ===');
  socket.disconnect();
  process.exit(0);
}, 10000);