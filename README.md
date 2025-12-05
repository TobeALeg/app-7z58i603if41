# 智能体比赛报名平台

## 📋 项目简介

智能体比赛报名平台是一个专为智能体比赛打造的在线报名系统，提供便捷的报名服务、比赛信息展示和作品提交功能。

### 核心功能

- **在线报名系统** - 收集参赛者基本信息和作品信息
- **比赛信息展示** - 展示比赛规则、时间安排、参赛要求
- **统一身份认证** - 集成温州商学院CAS认证系统
- **作品提交管理** - 支持参赛作品上传和管理
- **报名状态查询** - 查看报名进度和审核状态

## 🎨 设计特色

### 配色方案
- **主色调**: 科技蓝（#2E86C1）
- **辅助色**: 清新绿（#28B463）
- **设计风格**: 现代扁平化设计，体现智能科技感

### 视觉特点
- 8px圆角处理
- 微妙阴影效果增强层次感
- 卡片式布局，信息分块清晰
- 响应式设计，适配移动端和桌面端

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: shadcn/ui
- **样式**: Tailwind CSS
- **路由**: React Router v7
- **表单**: React Hook Form + Zod
- **图标**: Lucide React

### 后端（可选）
- **数据库**: Supabase（云服务）
- **认证**: Supabase Auth + CAS OAuth 2.0
- **Edge Function**: Deno运行时

## 📁 项目结构

```
app-7z58i603if41/
├── src/
│   ├── components/        # 组件目录
│   │   ├── common/       # 公共组件（Header、Footer等）
│   │   └── ui/           # shadcn/ui组件
│   ├── pages/            # 页面组件
│   │   ├── HomePage.tsx          # 首页
│   │   ├── LoginPage.tsx         # 登录页
│   │   ├── RegistrationPage.tsx # 报名页
│   │   ├── WorkSubmissionPage.tsx # 作品提交页
│   │   ├── MyRegistrationPage.tsx # 我的报名
│   │   └── RulesPage.tsx         # 比赛规则
│   ├── contexts/         # React Context
│   ├── config/           # 配置文件
│   ├── db/              # 数据库相关
│   ├── types/           # TypeScript类型定义
│   └── lib/             # 工具函数
├── supabase/            # Supabase配置
│   ├── functions/       # Edge Functions
│   └── migrations/      # 数据库迁移
├── public/              # 静态资源
├── apache/              # Apache配置和SSL证书
├── deploy.sh            # 部署脚本
└── package.json         # 项目依赖
```

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 生产部署

请查看 **本地部署指南.md** 获取详细的部署步骤。

## 🔐 认证系统

### CAS统一身份认证

项目集成了温州商学院CAS认证系统，支持：
- OAuth 2.0授权码模式
- 自动获取用户信息（学号、姓名等）
- 安全的会话管理

### 登录流程

```
用户点击登录
  ↓
跳转到CAS认证页面
  ↓
输入学号和密码
  ↓
CAS认证成功
  ↓
返回授权码
  ↓
Edge Function处理OAuth回调
  ↓
获取用户信息
  ↓
创建Supabase会话
  ↓
登录成功
```

## 📊 数据库设计

### 主要数据表

- **profiles** - 用户信息表
- **registrations** - 报名信息表
- **works** - 作品信息表
- **competition_info** - 比赛信息表

### 数据安全

- 所有数据加密传输（HTTPS）
- Row Level Security（RLS）权限控制
- 定期自动备份

## 🌐 部署信息

### 生产环境

- **域名**: https://aigctmp.wzbc.edu.cn
- **服务器IP**: 10.145.251.29
- **Web服务器**: Apache 2.4
- **SSL证书**: 已配置HTTPS

### 部署方案

项目支持两种部署方案：

#### 方案一：使用Supabase云服务（推荐）
- ✅ 功能完整，支持在线报名和作品提交
- ✅ 部署简单，无需配置数据库
- ✅ 自动扩展，性能稳定
- ⚠️ 依赖云服务

#### 方案二：完全本地部署
- ✅ 完全本地化，无云服务依赖
- ✅ 数据完全掌控
- ⚠️ 需要配置本地数据库
- ⚠️ 需要开发本地后端API

详细部署步骤请查看 **本地部署指南.md**

## 📝 环境变量配置

创建 `.env` 文件：

```bash
# 应用配置
VITE_APP_ID=app-7z58i603if41

# Supabase配置（方案一需要）
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 预览生产构建
npm run preview
```

## 📦 构建和部署

### 构建项目

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 部署到服务器

```bash
# 使用自动化脚本
./deploy.sh

# 或手动上传
rsync -avz --delete dist/ user@server:/var/www/aigctmp/
```

## 🔍 故障排查

### 常见问题

1. **构建失败**
   - 检查Node.js版本（需要 >= 18.0.0）
   - 删除 `node_modules` 重新安装依赖

2. **登录失败**
   - 检查Edge Function是否已部署
   - 查看浏览器控制台错误信息
   - 检查Supabase环境变量配置

3. **页面刷新404**
   - 确保Apache已启用rewrite模块
   - 检查 `.htaccess` 文件是否存在

详细的故障排查步骤请查看 **本地部署指南.md**

## 📞 技术支持

### 查看日志

```bash
# 浏览器控制台
F12 → Console

# Apache日志
sudo tail -f /var/log/apache2/aigctmp_error.log

# Edge Function日志（如果使用Supabase）
supabase functions logs oauth-callback --follow
```

### 测试命令

```bash
# 测试DNS解析
ping aigctmp.wzbc.edu.cn

# 测试HTTPS
curl -I https://aigctmp.wzbc.edu.cn

# 测试Apache配置
sudo apache2ctl configtest
```

## 📄 许可证

本项目仅供温州商学院内部使用。

## 🎯 项目状态

- ✅ 前端开发完成
- ✅ CAS认证集成完成
- ✅ Supabase数据库配置完成
- ✅ Edge Function开发完成
- ⏳ 生产环境部署中

## 📚 相关文档

- **本地部署指南.md** - 详细的本地部署步骤（包含两种方案）

---

**版本**: 1.0.0  
**最后更新**: 2025-12-03  
**开发团队**: 温州商学院
