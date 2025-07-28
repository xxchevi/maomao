const { io } = require('socket.io-client');
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
let queueCompleted = false;
let queueStarted = false;

function getElapsedTime() {
  return ((Date.now() - startTime) / 1000).toFixed(1);
}

socket.on('connect', () => {
  console.log('=== 简单队列测试 ===');
  console.log('已连接到服务器');
  
  // 先清理所有现有队列
  console.log('\n清理现有队列...');
  socket.emit('clear_all_queues');
});

// 监听当前队列更新
socket.on('current_queue_updated', (currentQueue) => {
  if (currentQueue === null) {
    console.log(`[${getElapsedTime()}s] 当前队列已清空`);
    if (!queueStarted) {
      // 创建3秒测试队列
      console.log('\n创建3秒测试队列（1次重复）...');
      socket.emit('test_create_short_queue', {
        duration: 3,
        repeat: 1
      });
      queueStarted = true;
    }
  } else {
    console.log(`[${getElapsedTime()}s] 当前队列: ${currentQueue.resourceName}, 重复: ${currentQueue.currentRepeat}/${currentQueue.totalRepeat}`);
  }
});

// 监听队列更新
socket.on('queue_updated', (queues) => {
  console.log(`[${getElapsedTime()}s] 待处理队列数量: ${queues.length}`);
});

// 监听测试队列创建结果
socket.on('test_short_queue_created', (data) => {
  console.log(`[${getElapsedTime()}s] 测试队列已创建: ${data.message}`);
});

// 监听队列完成
socket.on('queue_completed', (data) => {
  console.log(`[${getElapsedTime()}s] 🎉 队列完成: ${JSON.stringify(data)}`);
  queueCompleted = true;
});

// 监听错误
socket.on('error', (error) => {
  console.log(`[${getElapsedTime()}s] ❌ 错误: ${JSON.stringify(error)}`);
});

// 监听连接错误
socket.on('connect_error', (error) => {
  console.log(`连接错误: ${error.message}`);
});

// 监听断开连接
socket.on('disconnect', (reason) => {
  console.log(`连接断开: ${reason}`);
});

// 定期输出等待信息
const waitInterval = setInterval(() => {
  if (!queueCompleted && queueStarted) {
    console.log(`[${getElapsedTime()}s] 等待队列完成中...`);
  }
}, 1000);

// 10秒后结束测试
setTimeout(() => {
  clearInterval(waitInterval);
  console.log(`\n[${getElapsedTime()}s] === 测试完成 ===`);
  
  if (queueCompleted) {
    console.log('✅ 测试成功：队列正常完成');
  } else {
    console.log('❌ 测试失败：队列未在预期时间内完成');
  }
  
  socket.disconnect();
  process.exit(0);
}, 10000);