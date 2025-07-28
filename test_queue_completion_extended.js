const { io } = require('socket.io-client');
const fs = require('fs');

// 读取token
const token = fs.readFileSync('token.txt', 'utf8').trim();

console.log('=== 测试队列完成（扩展版本）===');

const socket = io('http://localhost:3000', {
  auth: {
    token: token
  }
});

let startTime = Date.now();
let queueCompleted = false;
let nextQueueStarted = false;

function getElapsedTime() {
  return ((Date.now() - startTime) / 1000).toFixed(1);
}

socket.on('connect_error', (error) => {
  console.log('连接错误:', error);
});

socket.on('connect', () => {
  console.log('已连接到服务器\n');
  
  console.log('先清理所有现有队列...');
  socket.emit('stop_current_queue');
  
  setTimeout(() => {
    console.log('\n创建短时间测试队列（3秒，2次重复）...');
    socket.emit('test_create_short_queue');
  }, 500);
});

// 监听当前队列更新
socket.on('current_queue_updated', (data) => {
  if (data) {
    console.log(`[${getElapsedTime()}s] *** current_queue_updated ***: {`);
    console.log(`  id: '${data.id.substring(0, 20)}...',`);
    console.log(`  resourceName: '${data.resourceName}',`);
    console.log(`  currentRepeat: ${data.currentRepeat},`);
    console.log(`  totalRepeat: ${data.totalRepeat},`);
    console.log(`  progress: ${data.progress},`);
    console.log(`  hasStartTime: ${!!data.startTime}`);
    console.log(`}`);
    
    // 检查是否是第一次重复完成，开始第二次重复
    if (data.currentRepeat === 2 && !nextQueueStarted) {
      console.log(`\n🎉 第一次重复完成，开始第二次重复！`);
      nextQueueStarted = true;
    }
    
    // 检查是否所有重复都完成了
    if (data.currentRepeat > data.totalRepeat || (data.progress === 100 && data.currentRepeat === data.totalRepeat)) {
      console.log(`\n🎉 所有重复完成！队列应该结束了。`);
      queueCompleted = true;
    }
  } else {
    console.log(`[${getElapsedTime()}s] *** current_queue_updated ***: null (队列已清空)`);
    if (nextQueueStarted) {
      console.log(`\n🎉 队列完全完成！`);
      queueCompleted = true;
    }
  }
});

// 监听队列更新
socket.on('queue_updated', (queues) => {
  console.log(`[${getElapsedTime()}s] queue_updated, 待处理队列数量: ${queues.length}`);
});

// 监听测试队列创建结果
socket.on('test_short_queue_created', (data) => {
  console.log(`[${getElapsedTime()}s] 短时间测试队列已创建: ${data.message}`);
});

// 监听进度更新
socket.on('queue_progress', (data) => {
  console.log(`[${getElapsedTime()}s] 队列进度: ${data.progress.toFixed(1)}%`);
});

// 监听队列完成
socket.on('queue_completed', (data) => {
  console.log(`[${getElapsedTime()}s] 🎉 队列完成事件: ${JSON.stringify(data)}`);
});

// 监听队列切换
socket.on('queue_switched', (data) => {
  console.log(`[${getElapsedTime()}s] 🔄 队列切换事件: ${JSON.stringify(data)}`);
});

// 定期输出等待信息
const waitInterval = setInterval(() => {
  if (!queueCompleted) {
    console.log(`[${getElapsedTime()}s] 等待队列完成中...`);
  }
}, 2000);

// 15秒后结束测试
setTimeout(() => {
  clearInterval(waitInterval);
  console.log(`\n[${getElapsedTime()}s] === 测试完成，断开连接 ===`);
  
  if (queueCompleted) {
    console.log('✅ 测试成功：队列正常完成');
  } else {
    console.log('❌ 测试失败：队列未在预期时间内完成');
  }
  
  socket.disconnect();
  process.exit(0);
}, 15000);