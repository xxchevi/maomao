const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWRtd2xpMnUwMDAwaTcyYzd0d3FkbjhpIiwiaWF0IjoxNzUzNjk1MzQwLCJleHAiOjE3NTM3ODE3NDB9.FtsRoGvH3ZqaZuqcf3ss0MORW0B7n9dNnTLBiMeIOf8'
  }
});

let startTime = Date.now();

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
    console.log('\n创建短时间测试队列（3秒，1次重复）...');
    socket.emit('test_create_short_queue');
  }, 500);
});

// 监听当前队列更新
socket.on('current_queue_updated', (data) => {
  if (data) {
    console.log(`[${getElapsedTime()}s] *** current_queue_updated ***: {`);
    console.log(`  id: '${data.id.substring(0, 20)}...',`);
    console.log(`  resourceName: '${data.resourceName}',`);
    console.log(`  baseTime: ${data.baseTime},`);
    console.log(`  currentRepeat: ${data.currentRepeat},`);
    console.log(`  totalRepeat: ${data.totalRepeat},`);
    console.log(`  progress: ${data.progress},`);
    console.log(`  hasStartTime: ${!!data.startTime}`);
    console.log(`}`);
  } else {
    console.log(`[${getElapsedTime()}s] *** current_queue_updated ***: null`);
  }
});

// 监听队列完成
socket.on('queue_completed', (data) => {
  console.log(`[${getElapsedTime()}s] 🎉 *** queue_completed ***: {`);
  if (data && data.id) {
    console.log(`  id: '${data.id.substring(0, 20)}...',`);
    console.log(`  resourceName: '${data.resourceName}',`);
    console.log(`  currentRepeat: ${data.currentRepeat},`);
    console.log(`  totalRepeat: ${data.totalRepeat}`);
  } else {
    console.log(`  data:`, data);
  }
  console.log(`}`);
  
  console.log(`\n✅ 测试完成！队列在 ${getElapsedTime()}s 后完成，应该接近3秒。`);
  
  setTimeout(() => {
    console.log('\n断开连接...');
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

// 监听测试队列创建确认
socket.on('test_short_queue_created', (data) => {
  console.log(`[${getElapsedTime()}s] 测试队列创建: ${data.message}`);
  console.log('\n⏱️  开始计时，等待队列完成...');
});

// 监听错误
socket.on('error', (error) => {
  console.log(`[${getElapsedTime()}s] 错误:`, error);
});

// 超时保护
setTimeout(() => {
  console.log('\n⚠️  测试超时（10秒），可能存在问题');
  socket.disconnect();
  process.exit(1);
}, 10000);

console.log('🧪 队列时间修复测试');
console.log('预期：队列应该在约3秒后完成，而不是立即完成');
console.log('正在连接到服务器...');