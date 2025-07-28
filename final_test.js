const { io } = require('socket.io-client');

// 使用之前生成的有效token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRrMjRzMWwwMDAwMTFndnVwejhicHczIiwiaWF0IjoxNzUzNjg3NTAyLCJleHAiOjE3NTM3NzM5MDJ9.V8BuAuMKhByhefvj8Qc-vO2DhH0cZddP_75jkfRiME8';

console.log('=== 最终综合测试：立即开始 + 刷新页面 + 队列完成切换 ===');

let testStartTime = 0;
let connectionCount = 0;

function createConnection(name) {
  connectionCount++;
  console.log(`\n=== ${name} (连接${connectionCount}) ===`);
  
  const socket = io('http://localhost:3000', {
    auth: {
      token: token
    }
  });
  
  function getElapsedTime() {
    if (testStartTime === 0) return '0s';
    return `${((Date.now() - testStartTime) / 1000).toFixed(1)}s`;
  }
  
  socket.on('connect', () => {
    console.log(`[${name}] 已连接到服务器`);
    
    // 连接后立即请求恢复队列状态
    if (name === '刷新后重连') {
      console.log(`[${name}] 发送restore_queues请求`);
      socket.emit('restore_queues');
    }
    
    if (name === '初始连接') {
      setTimeout(() => {
        console.log(`\n[${name}] 先清理所有现有队列...`);
        socket.emit('stop_current_queue');
        
        setTimeout(() => {
          testStartTime = Date.now();
          console.log(`\n[${name}] 立即开始第一个测试队列（30秒）...`);
          socket.emit('start_immediately', {
            id: `test_immediate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            activityType: 'mining',
            resourceId: 'cmdk1lygz000irkknoomk15hp', // 废弃矿洞 - 30秒
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
          
          setTimeout(() => {
            console.log(`\n[${name}] 添加第二个队列到待处理队列...`);
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
            
            // 5秒后模拟刷新页面
            setTimeout(() => {
              console.log(`\n[${name}] 断开连接，模拟刷新页面...`);
              socket.disconnect();
              
              // 1秒后重新连接
              setTimeout(() => {
                createConnection('刷新后重连');
              }, 1000);
            }, 5000);
          }, 2000);
        }, 1000);
      }, 1000);
    }
  });
  
  socket.on('current_queue_updated', (data) => {
    if (data) {
      console.log(`[${name}][${getElapsedTime()}] *** current_queue_updated ***:`, {
        id: data.id.substring(0, 20) + '...',
        resourceName: data.resourceName,
        currentRepeat: data.currentRepeat,
        totalRepeat: data.totalRepeat,
        progress: data.progress,
        hasStartTime: !!data.startTime
      });
    } else {
      console.log(`[${name}][${getElapsedTime()}] *** current_queue_updated: null ***`);
    }
  });
  
  socket.on('queue_updated', (data) => {
    console.log(`[${name}][${getElapsedTime()}] queue_updated, 待处理队列数量:`, data.length);
  });
  
  socket.on('queue_completed', (data) => {
    console.log(`[${name}][${getElapsedTime()}] *** queue_completed ***:`, {
      queueId: data?.queueId?.substring(0, 20) + '...',
      resourceName: data?.resourceName,
      message: data?.message
    });
  });
  
  socket.on('character_updated', (data) => {
    console.log(`[${name}][${getElapsedTime()}] 角色更新 - 经验:`, data.exp, '挖矿经验:', data.miningExp);
  });
  
  socket.on('inventory_updated', (data) => {
    console.log(`[${name}][${getElapsedTime()}] 仓库更新，物品数量:`, data.length);
  });
  
  socket.on('connect_error', (error) => {
    console.error(`[${name}] 连接错误:`, error);
  });
  
  // 如果是刷新后重连，40秒后断开
  if (name === '刷新后重连') {
    setTimeout(() => {
      console.log(`\n[${name}][${getElapsedTime()}] === 测试完成，断开连接 ===`);
      socket.disconnect();
      process.exit(0);
    }, 40000);
  }
}

// 开始测试
createConnection('初始连接');

// 每5秒输出一次进度
const progressInterval = setInterval(() => {
  if (testStartTime > 0) {
    const elapsed = (Date.now() - testStartTime) / 1000;
    console.log(`[进度] ${elapsed.toFixed(1)}s - 等待队列完成和切换...`);
  }
}, 5000);

// 60秒后强制退出
setTimeout(() => {
  clearInterval(progressInterval);
  console.log('\n=== 测试超时，强制退出 ===');
  process.exit(0);
}, 60000);