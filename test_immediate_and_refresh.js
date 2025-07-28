const { io } = require('socket.io-client');

// 使用之前生成的有效token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRrMjRzMWwwMDAwMTFndnVwejhicHczIiwiaWF0IjoxNzUzNjg3NTAyLCJleHAiOjE3NTM3NzM5MDJ9.V8BuAuMKhByhefvj8Qc-vO2DhH0cZddP_75jkfRiME8';

console.log('=== 测试立即开始和刷新页面问题 ===');

// 创建第一个连接 - 模拟立即开始
const socket1 = io('http://localhost:3000', {
  auth: {
    token: token
  }
});

socket1.on('connect', () => {
  console.log('\n[连接1] 已连接到服务器');
  
  // 先恢复队列状态
  socket1.emit('restore_queues');
  
  setTimeout(() => {
    console.log('\n[连接1] 发送立即开始请求...');
    socket1.emit('start_immediately', {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activityType: 'mining',
      resourceId: 'cmdk1lygz000irkknoomk15hp', // 废弃矿洞
      resourceName: '废弃矿洞',
      totalRepeat: 5,
      currentRepeat: 1,
      baseTime: 30,
      expReward: 15,
      progress: 0,
      remainingTime: 30,
      estimatedTime: 150,
      createdAt: Date.now()
    });
  }, 2000);
});

socket1.on('current_queue_updated', (data) => {
  console.log('\n[连接1] 收到 current_queue_updated:', {
    id: data?.id,
    resourceName: data?.resourceName,
    currentRepeat: data?.currentRepeat,
    totalRepeat: data?.totalRepeat,
    hasStartTime: !!data?.startTime
  });
});

socket1.on('queue_updated', (data) => {
  console.log('[连接1] 收到 queue_updated, 待处理队列数量:', data.length);
});

// 5秒后断开第一个连接，模拟页面刷新
setTimeout(() => {
  console.log('\n=== 模拟页面刷新，断开第一个连接 ===');
  socket1.disconnect();
  
  // 1秒后创建新连接，模拟刷新后重新连接
  setTimeout(() => {
    console.log('\n=== 创建新连接，模拟刷新后重新连接 ===');
    
    const socket2 = io('http://localhost:3000', {
      auth: {
        token: token
      }
    });
    
    socket2.on('connect', () => {
      console.log('\n[连接2] 已连接到服务器');
      
      // 恢复队列状态
      socket2.emit('restore_queues');
    });
    
    socket2.on('current_queue_updated', (data) => {
      console.log('\n[连接2] 收到 current_queue_updated:', {
        id: data?.id,
        resourceName: data?.resourceName,
        currentRepeat: data?.currentRepeat,
        totalRepeat: data?.totalRepeat,
        hasStartTime: !!data?.startTime,
        progress: data?.progress
      });
    });
    
    socket2.on('queue_updated', (data) => {
      console.log('[连接2] 收到 queue_updated, 待处理队列数量:', data.length);
      if (data.length > 0) {
        console.log('前3个待处理队列:', data.slice(0, 3).map(q => ({
          id: q.id,
          resourceName: q.resourceName,
          currentRepeat: q.currentRepeat,
          totalRepeat: q.totalRepeat
        })));
      }
    });
    
    socket2.on('connect_error', (error) => {
      console.error('[连接2] 连接错误:', error);
    });
    
    // 10秒后断开第二个连接
    setTimeout(() => {
      console.log('\n=== 测试完成，断开第二个连接 ===');
      socket2.disconnect();
      process.exit(0);
    }, 10000);
    
  }, 1000);
  
}, 5000);

socket1.on('connect_error', (error) => {
  console.error('[连接1] 连接错误:', error);
});