const io = require('socket.io-client');
const fs = require('fs');

// 读取token
const token = fs.readFileSync('token.txt', 'utf8').trim();

// 连接到服务器
const socket = io('http://localhost:3000', {
  auth: {
    token: token
  }
});

let startTime = Date.now();

function getElapsedTime() {
  return ((Date.now() - startTime) / 1000).toFixed(1);
}

socket.on('connect', () => {
  console.log(`[${getElapsedTime()}s] 🔗 连接成功`);
  
  // 清理现有队列
  console.log(`[${getElapsedTime()}s] 🧹 清理现有队列...`);
  socket.emit('clear_all_queues');
  
  setTimeout(() => {
    console.log(`[${getElapsedTime()}s] 📋 测试批量队列问题：添加100次重复的队列`);
    
    // 添加一个100次重复的队列
    socket.emit('add_to_queue', {
      id: `batch_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activityType: 'mining',
      resourceId: 'cmdmway71000i13drjclipflb',
      resourceName: '废弃矿洞',
      totalRepeat: 100, // 100次重复
      currentRepeat: 1,
      baseTime: 3, // 3秒基础时间
      expReward: 15,
      progress: 0,
      remainingTime: 3,
      estimatedTime: 300, // 3秒 * 100次 = 300秒
      createdAt: Date.now()
    });
    
    console.log(`[${getElapsedTime()}s] ⏱️  队列已添加，预期总时间：300秒（100次 × 3秒）`);
    console.log(`[${getElapsedTime()}s] 🔍 观察队列是否正常显示在操作队列中...`);
  }, 1000);
});

// 监听当前队列更新
socket.on('current_queue_updated', (currentQueue) => {
  if (currentQueue) {
    console.log(`[${getElapsedTime()}s] 📋 current_queue_updated:`, {
      id: currentQueue.id,
      activityType: currentQueue.activityType,
      resourceName: currentQueue.resourceName,
      currentRepeat: currentQueue.currentRepeat,
      totalRepeat: currentQueue.totalRepeat,
      progress: Math.floor(currentQueue.progress || 0),
      remainingTime: currentQueue.remainingTime,
      estimatedTime: currentQueue.estimatedTime
    });
  } else {
    console.log(`[${getElapsedTime()}s] 📋 current_queue_updated: null (队列已清空)`);
  }
});

// 监听队列更新
socket.on('queue_updated', (queues) => {
  console.log(`[${getElapsedTime()}s] 📝 queue_updated: 待处理队列数量 = ${queues.length}`);
  if (queues.length > 0) {
    console.log(`[${getElapsedTime()}s] 📝 待处理队列详情:`, queues.map(q => ({
      id: q.id,
      resourceName: q.resourceName,
      totalRepeat: q.totalRepeat
    })));
  }
});

// 监听队列完成
socket.on('queue_completed', (data) => {
  console.log(`[${getElapsedTime()}s] 🎉 队列完成:`, {
    queueId: data.queueId,
    activityType: data.activityType,
    resourceName: data.resourceName,
    message: data.message
  });
});

// 监听错误
socket.on('error', (error) => {
  console.log(`[${getElapsedTime()}s] ❌ 错误:`, error);
});

// 监听连接错误
socket.on('connect_error', (error) => {
  console.log(`[${getElapsedTime()}s] ❌ 连接错误:`, error.message);
});

// 30秒后结束测试
setTimeout(() => {
  console.log(`\n[${getElapsedTime()}s] === 测试结束 ===`);
  console.log('🔍 观察结果：');
  console.log('- 队列是否正常显示在操作队列中？');
  console.log('- 队列是否按预期时间执行而不是立即完成？');
  console.log('- 100次重复是否正常工作？');
  
  socket.disconnect();
  process.exit(0);
}, 30000);

console.log('🧪 批量队列问题测试');
console.log('测试场景：添加100次重复的队列，观察是否正常显示和执行');
console.log('正在连接到服务器...');