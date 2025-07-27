# 猫猫挂机游戏

一个基于 Nuxt 3 的在线挂机游戏，支持采集、挖矿、钓鱼等多种技能，以及离线挂机功能。

## 功能特色

- 🎮 **多种技能系统**: 挖矿、采集、钓鱼、烹饪、制作
- ⏰ **离线挂机**: 即使不在线也能持续获得经验和资源
- 🎒 **仓库系统**: 管理和查看收集到的物品
- 🏆 **角色成长**: 技能等级提升，解锁更多内容
- 🔄 **实时更新**: 基于 Socket.io 的实时游戏体验
- 📱 **响应式设计**: 支持桌面和移动设备

## 技术栈

- **前端**: Nuxt 3, Vue 3, TypeScript, Tailwind CSS
- **后端**: Nuxt Server API, Socket.io
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT
- **状态管理**: Pinia
- **任务调度**: node-cron

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 数据库设置

```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库
npx prisma db push

# 初始化游戏数据
npx prisma db seed
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 开始游戏！

## 游戏玩法

### 注册和登录

1. 访问游戏首页
2. 点击"开始游戏"注册新账号
3. 或使用已有账号登录

### 在线游戏

1. 进入游戏页面
2. 选择想要进行的活动（挖矿、采集、钓鱼）
3. 点击资源点开始活动
4. 实时获得经验和物品奖励

### 离线挂机

1. 进入离线任务页面
2. 选择任务类型和资源点
3. 设置挂机时间
4. 创建任务后即可离线
5. 任务完成后回来领取奖励

### 仓库管理

1. 查看收集到的所有物品
2. 按类型和稀有度筛选
3. 查看物品详细信息

## 项目结构

```
maomao4/
├── assets/css/          # 样式文件
├── layouts/             # 页面布局
├── middleware/          # 路由中间件
├── pages/               # 页面组件
├── prisma/              # 数据库模型和种子数据
├── server/              # 服务端 API 和插件
├── stores/              # Pinia 状态管理
├── nuxt.config.ts       # Nuxt 配置
└── package.json         # 项目依赖
```

## 开发指南

### 添加新技能

1. 在 `prisma/schema.prisma` 中添加技能等级字段
2. 更新数据库模型
3. 在前端页面中添加技能显示
4. 在 Socket.io 处理器中添加技能逻辑

### 添加新物品

1. 在 `prisma/seed.ts` 中添加物品数据
2. 重新运行种子脚本
3. 在游戏逻辑中配置掉落规则

### 添加新资源点

1. 在 `prisma/seed.ts` 中添加资源点数据
2. 配置等级要求和奖励
3. 在前端页面中显示新资源点

## 部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm run start
```

## 环境变量

创建 `.env` 文件并配置以下变量：

```env
# JWT 密钥
JWT_SECRET=your-secret-key

# 数据库 URL
DATABASE_URL="file:./dev.db"
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License