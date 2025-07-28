const io = require('socket.io-client');
const fs = require('fs');

// 读取token
const token = fs.readFileSync('token.txt', 'utf8').trim();

console.log('🧪 测试 Socket.IO 连接');
console.log('Token:', token.substring(0, 20) + '...');

// 连接到服务器
const socket = io('http://localhost:3000', {
  auth: {
    token: token
  },
  transports: ['websocket', 'polling'], // 明确指定传输方式
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Socket.IO 连接成功');
  console.log('Socket ID:', socket.id);
  
  // 测试一个简单的事件
  setTimeout(() => {
    console.log('📤 发送测试事件...');
    socket.emit('test_event', { message: 'Hello Server' });
  }, 1000);
  
  // 5秒后断开连接
  setTimeout(() => {
    console.log('🔌 断开连接');
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on('connect_error', (error) => {
  console.log('❌ 连接错误:', error.message);
  console.log('错误详情:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 连接断开:', reason);
});

socket.on('error', (error) => {
  console.log('❌ Socket 错误:', error);
});

// 10秒后强制退出
setTimeout(() => {
  console.log('⏰ 测试超时，强制退出');
  process.exit(1);
}, 10000);

console.log('🔄 正在连接到 http://localhost:3000...');