# 📚 智能体比赛报名平台 - 完整操作指南

## 📋 目录

1. [项目概述](#项目概述)
2. [环境要求](#环境要求)
3. [安装部署](#安装部署)
4. [配置说明](#配置说明)
5. [运行测试](#运行测试)
6. [OAuth认证](#oauth认证)
7. [生产部署](#生产部署)
8. [常见问题](#常见问题)
9. [故障排查](#故障排查)
10. [维护管理](#维护管理)

---

## 项目概述

### 项目信息

| 项目 | 信息 |
|------|------|
| **项目名称** | 智能体比赛报名平台 |
| **生产地址** | https://aigc.wzbc.edu.cn |
| **技术栈** | React + TypeScript + Supabase + Vite |
| **认证方式** | 温州商学院CAS OAuth 2.0 SSO |
| **部署方式** | Apache + HTTPS (443端口) |

### 主要功能

- 🔐 **统一身份认证** - 温州商学院CAS单点登录
- 📝 **在线报名** - 支持个人和团队参赛
- 📤 **作品提交** - 文件上传和管理
- 📊 **报名管理** - 状态查询和审核
- 👨‍💼 **管理后台** - 报名审核和用户管理

---

## 环境要求

### 开发环境

```bash
Node.js: >= 18.0.0
pnpm: >= 8.0.0
Git: >= 2.0.0
```

### 生产环境

```bash
Apache: >= 2.4
SSL证书: 有效的HTTPS证书
PHP: 不需要（纯静态部署）
```

### 第三方服务

- **Supabase**: 数据库和认证服务
- **温州商学院CAS**: OAuth 2.0认证系统

---

## 安装部署

### 1. 克隆项目

```bash
# 克隆代码仓库
git clone <repository-url>
cd app-7z58i603if41

# 查看项目结构
ls -la
```

### 2. 安装依赖

```bash
# 使用pnpm安装（推荐）
pnpm install

# 或使用npm
npm install
```

**注意**: 
- 首次安装可能需要5-10分钟
- 确保网络连接稳定
- 如遇到依赖冲突，删除`node_modules`和`pnpm-lock.yaml`后重试

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件
nano .env
```

**必填环境变量**:

```bash
# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 应用ID（用于动态二维码等功能）
VITE_APP_ID=your_app_id

# API环境（可选）
VITE_API_ENV=production
```

### 4. 初始化数据库

```bash
# 应用数据库迁移
# 在Supabase Dashboard中执行 supabase/migrations/*.sql 文件
```

**迁移文件顺序**:
1. `20250101000000_create_profiles.sql` - 用户表
2. `20250101000001_create_registrations.sql` - 报名表
3. `20250101000002_create_works.sql` - 作品表

---

## 配置说明

### Supabase配置

#### 1. 环境变量配置

在Supabase Dashboard → Settings → Edge Functions → Secrets 中添加：

```bash
OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile
OAUTH_CLIENT_ID=CijBwB5EwTTXouO7
OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6
OAUTH_REDIRECT_URI=https://aigc.wzbc.edu.cn/auth/callback
```

#### 2. 部署Edge Function

```bash
# 部署OAuth回调函数
supabase functions deploy oauth-callback
```

### CAS系统配置

#### 1. 注册回调URL

联系学校信息中心，注册以下回调URL：

```
https://aigc.wzbc.edu.cn/auth/callback
```

#### 2. OAuth配置信息

| 配置项 | 值 |
|--------|-----|
| **授权端点** | https://cas.wzbc.edu.cn/cas/oauth2.0/authorize |
| **Token端点** | https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken |
| **用户信息端点** | https://cas.wzbc.edu.cn/cas/oauth2.0/profile |
| **注销端点** | https://cas.wzbc.edu.cn/cas/logout |
| **Client ID** | CijBwB5EwTTXouO7 |
| **Client Secret** | O8dOsXE7p7yMbh18KEP2Z6 |

---

## 运行测试

### 开发环境运行

```bash
# 启动开发服务器
npm run dev

# 或使用pnpm
pnpm dev
```

**访问地址**: http://localhost:5173

**开发服务器特点**:
- 热模块替换（HMR）
- 实时错误提示
- 自动刷新页面
- 端口号：5173

### 代码质量检查

```bash
# 运行Lint检查
npm run lint

# 自动修复Lint问题
npm run lint:fix

# 类型检查
npm run type-check
```

### 构建测试

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

**构建输出**: `dist/` 目录

---

## OAuth认证

### 登录流程

```
用户点击登录
    ↓
跳转到CAS授权页面
    ↓
用户输入学号密码
    ↓
CAS验证成功，返回授权码
    ↓
回调到 /auth/callback
    ↓
Edge Function交换Token
    ↓
获取用户信息
    ↓
创建/更新用户档案
    ↓
登录成功，跳转首页
```

### 注销流程

```
用户点击退出
    ↓
调用 signOut()
    ↓
清除Supabase会话
    ↓
跳转到CAS注销页面
    ↓
CAS注销成功
    ↓
重定向回首页
    ↓
用户已登出
```

### OAuth配置文件

**位置**: `src/config/oauth.ts`

**关键函数**:
- `generateAuthUrl()` - 生成授权URL
- `generateLogoutUrl()` - 生成注销URL
- `validateState()` - 验证CSRF token
- `extractUserInfo()` - 提取用户信息

### 测试OAuth

#### 1. 测试登录

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问登录页面
http://localhost:5173/login

# 3. 点击"使用学号登录"按钮

# 4. 在CAS页面输入测试账号
# 学号: smartadmin
# 密码: (联系管理员获取)

# 5. 验证登录成功
# - 检查是否跳转到首页
# - 检查Header是否显示用户信息
# - 检查浏览器控制台无错误
```

#### 2. 测试注销

```bash
# 1. 确保已登录

# 2. 点击Header中的"退出"按钮

# 3. 验证注销流程
# - 检查是否跳转到CAS注销页面
# - 检查是否重定向回首页
# - 检查用户状态是否清除
# - 尝试访问需要登录的页面，应跳转到登录页
```

---

## 生产部署

### 部署架构

```
用户浏览器
    ↓ HTTPS (443)
Apache Web服务器
    ↓
静态文件 (dist/)
    ↓
Supabase API
    ↓
PostgreSQL数据库
```

**重要**: 
- ❌ 生产环境**不使用**5173端口
- ✅ 生产环境使用443端口（HTTPS默认）
- ✅ Apache直接服务静态文件，无需端口转发

### 部署步骤

#### 1. 构建生产版本

```bash
# 运行部署脚本
./deploy.sh

# 或手动构建
npm run build
```

**构建输出**:
- 目录: `dist/`
- 大小: 约2-5MB
- 内容: HTML, CSS, JS, 图片等静态文件

#### 2. 上传到服务器

```bash
# 使用rsync上传
rsync -avz --delete dist/ user@server:/var/www/html/

# 或使用scp
scp -r dist/* user@server:/var/www/html/

# 或使用FTP工具
# FileZilla, WinSCP等
```

#### 3. 配置Apache

**虚拟主机配置** (`/etc/apache2/sites-available/aigc.conf`):

```apache
<VirtualHost *:443>
    ServerName aigc.wzbc.edu.cn
    DocumentRoot /var/www/html

    # SSL配置
    SSLEngine on
    SSLCertificateFile /path/to/cert.crt
    SSLCertificateKeyFile /path/to/cert.key
    SSLCertificateChainFile /path/to/chain.crt

    # 安全头
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    # SPA路由支持
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # 所有请求重定向到index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 日志
    ErrorLog ${APACHE_LOG_DIR}/aigc_error.log
    CustomLog ${APACHE_LOG_DIR}/aigc_access.log combined
</VirtualHost>

# HTTP重定向到HTTPS
<VirtualHost *:80>
    ServerName aigc.wzbc.edu.cn
    Redirect permanent / https://aigc.wzbc.edu.cn/
</VirtualHost>
```

#### 4. 启用配置

```bash
# 启用站点
sudo a2ensite aigc.conf

# 启用必要模块
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod headers

# 测试配置
sudo apache2ctl configtest

# 重启Apache
sudo systemctl restart apache2
```

#### 5. 设置文件权限

```bash
# 设置所有者
sudo chown -R www-data:www-data /var/www/html

# 设置目录权限
sudo find /var/www/html -type d -exec chmod 755 {} \;

# 设置文件权限
sudo find /var/www/html -type f -exec chmod 644 {} \;
```

### 部署验证

```bash
# 1. 检查HTTPS访问
curl -I https://aigc.wzbc.edu.cn

# 2. 检查HTTP重定向
curl -I http://aigc.wzbc.edu.cn

# 3. 检查SPA路由
curl -I https://aigc.wzbc.edu.cn/register

# 4. 检查静态资源
curl -I https://aigc.wzbc.edu.cn/assets/index.js
```

---

## 常见问题

### Q1: 为什么生产环境不需要5173端口？

**A**: 
- 5173是Vite**开发服务器**的端口
- 生产环境使用**静态文件部署**
- Apache直接服务`dist/`目录的静态文件
- HTTPS默认使用443端口，浏览器自动连接

**部署流程对比**:

```
开发环境:
npm run dev → Vite服务器 → localhost:5173

生产环境:
npm run build → dist/静态文件 → Apache:443 → aigc.wzbc.edu.cn
```

### Q2: OAuth回调URL配置错误怎么办？

**A**:
1. 检查`.env`文件中的配置
2. 确认CAS系统中注册的回调URL
3. 确保使用HTTPS协议
4. 检查Supabase环境变量

**正确配置**:
```bash
# 开发环境
http://localhost:5173/auth/callback

# 生产环境
https://aigc.wzbc.edu.cn/auth/callback
```

### Q3: 登录后跳转到空白页面？

**A**:
1. 检查浏览器控制台错误
2. 检查Edge Function日志
3. 验证Token交换是否成功
4. 检查用户信息是否正确保存

**调试步骤**:
```bash
# 1. 打开浏览器控制台 (F12)
# 2. 切换到Network标签
# 3. 重新登录，观察请求
# 4. 检查/auth/callback请求
# 5. 查看响应内容
```

### Q4: 注销后仍然显示已登录？

**A**:
1. 清除浏览器缓存和Cookie
2. 检查CAS注销URL是否正确
3. 验证Supabase会话是否清除

**手动清除**:
```javascript
// 在浏览器控制台执行
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Q5: 图片上传失败？

**A**:
1. 检查文件大小（默认限制1MB）
2. 检查文件格式（支持jpg, png, gif等）
3. 检查Supabase Storage配置
4. 验证用户权限

**调试**:
```bash
# 检查Supabase Storage
# Dashboard → Storage → Buckets
# 确认bucket存在且权限正确
```

### Q6: 管理后台无法访问？

**A**:
1. 检查用户角色是否为`admin`
2. 在数据库中手动设置管理员

**设置管理员**:
```sql
-- 在Supabase SQL Editor中执行
UPDATE profiles 
SET role = 'admin' 
WHERE student_id = 'your_student_id';
```

---

## 故障排查

### 开发环境问题

#### 问题: 依赖安装失败

```bash
# 清除缓存
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install

# 如果仍然失败，尝试npm
npm install
```

#### 问题: 端口5173被占用

```bash
# 查找占用进程
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 或使用其他端口
npm run dev -- --port 5174
```

#### 问题: 热更新不工作

```bash
# 重启开发服务器
Ctrl+C
npm run dev

# 清除浏览器缓存
Ctrl+Shift+R (硬刷新)
```

### 生产环境问题

#### 问题: 404错误

**原因**: SPA路由配置问题

**解决**:
```bash
# 1. 检查.htaccess文件
cat /var/www/html/.htaccess

# 2. 确保RewriteEngine开启
# 3. 检查Apache配置
sudo apache2ctl -M | grep rewrite

# 4. 如果没有rewrite模块
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### 问题: SSL证书错误

```bash
# 检查证书
openssl x509 -in /path/to/cert.crt -text -noout

# 检查私钥
openssl rsa -in /path/to/cert.key -check

# 检查证书链
openssl verify -CAfile /path/to/chain.crt /path/to/cert.crt
```

#### 问题: 静态资源加载失败

```bash
# 检查文件权限
ls -la /var/www/html/assets/

# 修复权限
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 检查Apache错误日志
sudo tail -f /var/log/apache2/aigc_error.log
```

### 数据库问题

#### 问题: 连接失败

```bash
# 检查Supabase URL
echo $VITE_SUPABASE_URL

# 测试连接
curl -I $VITE_SUPABASE_URL

# 检查API密钥
# 确保使用anon key，不是service_role key
```

#### 问题: RLS策略错误

```sql
-- 检查表的RLS状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 查看策略
SELECT * FROM pg_policies 
WHERE tablename = 'your_table_name';

-- 临时禁用RLS（仅用于调试）
ALTER TABLE your_table_name DISABLE ROW LEVEL SECURITY;
```

### OAuth问题

#### 问题: 授权失败

**检查清单**:
- [ ] Client ID正确
- [ ] Client Secret正确
- [ ] 回调URL已注册
- [ ] 回调URL协议正确（HTTPS）
- [ ] State验证通过

**调试**:
```javascript
// 在浏览器控制台查看OAuth配置
console.log(window.location.origin);
// 应该输出: https://aigc.wzbc.edu.cn
```

#### 问题: Token交换失败

```bash
# 查看Edge Function日志
# Supabase Dashboard → Edge Functions → oauth-callback → Logs

# 常见错误:
# - invalid_client: Client ID或Secret错误
# - invalid_grant: 授权码已使用或过期
# - redirect_uri_mismatch: 回调URL不匹配
```

---

## 维护管理

### 日常维护

#### 1. 日志监控

```bash
# Apache访问日志
sudo tail -f /var/log/apache2/aigc_access.log

# Apache错误日志
sudo tail -f /var/log/apache2/aigc_error.log

# 系统日志
sudo journalctl -u apache2 -f
```

#### 2. 数据库备份

```bash
# Supabase自动备份
# Dashboard → Settings → Backups

# 手动导出数据
# Dashboard → Table Editor → Export to CSV
```

#### 3. 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖
pnpm install

# 3. 构建
npm run build

# 4. 上传
rsync -avz --delete dist/ user@server:/var/www/html/

# 5. 清除浏览器缓存
# 通知用户刷新页面 (Ctrl+Shift+R)
```

### 性能优化

#### 1. 启用Gzip压缩

```apache
# 在Apache配置中添加
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

#### 2. 启用浏览器缓存

```apache
# 在Apache配置中添加
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

#### 3. 图片优化

```bash
# 压缩图片
# 使用在线工具: TinyPNG, ImageOptim
# 或命令行工具: imagemagick

# 示例
convert input.jpg -quality 85 output.jpg
```

### 安全加固

#### 1. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade

# 更新Node.js依赖
pnpm update

# 检查安全漏洞
npm audit
npm audit fix
```

#### 2. 防火墙配置

```bash
# 只开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 3. SSL证书续期

```bash
# 检查证书过期时间
openssl x509 -in /path/to/cert.crt -noout -dates

# 设置自动续期提醒
# 证书过期前30天开始提醒
```

---

## 附录

### 项目文件结构

```
app-7z58i603if41/
├── src/                      # 源代码
│   ├── components/           # 组件
│   │   ├── ui/              # UI组件
│   │   └── common/          # 通用组件
│   ├── pages/               # 页面
│   ├── contexts/            # Context
│   ├── config/              # 配置
│   ├── db/                  # 数据库
│   ├── types/               # 类型定义
│   └── lib/                 # 工具函数
├── public/                   # 静态资源
├── supabase/                # Supabase配置
│   ├── functions/           # Edge Functions
│   └── migrations/          # 数据库迁移
├── dist/                    # 构建输出
├── .env                     # 环境变量
├── package.json             # 依赖配置
├── vite.config.ts           # Vite配置
└── tsconfig.json            # TypeScript配置
```

### 关键文件说明

| 文件 | 说明 |
|------|------|
| `src/config/oauth.ts` | OAuth配置 |
| `src/contexts/AuthContext.tsx` | 认证上下文 |
| `src/db/supabase.ts` | Supabase客户端 |
| `src/db/api.ts` | API封装 |
| `supabase/functions/oauth-callback/` | OAuth回调函数 |
| `public/.htaccess` | Apache重写规则 |
| `deploy.sh` | 部署脚本 |

### 环境变量完整列表

```bash
# Supabase
VITE_SUPABASE_URL=            # Supabase项目URL
VITE_SUPABASE_ANON_KEY=       # Supabase匿名密钥

# 应用配置
VITE_APP_ID=                  # 应用ID
VITE_API_ENV=                 # API环境 (development/production)

# OAuth (仅Edge Function使用，不在.env中)
OAUTH_TOKEN_URL=              # Token端点
OAUTH_USERINFO_URL=           # 用户信息端点
OAUTH_CLIENT_ID=              # 客户端ID
OAUTH_CLIENT_SECRET=          # 客户端密钥
OAUTH_REDIRECT_URI=           # 回调URL
```

### 联系方式

| 问题类型 | 联系方式 |
|---------|---------|
| **SSL证书** | 学校信息中心 |
| **CAS系统** | 学校信息中心 |
| **服务器** | 运维团队 |
| **应用功能** | 开发团队 |

---

## 快速参考

### 常用命令

```bash
# 开发
npm run dev                   # 启动开发服务器
npm run build                 # 构建生产版本
npm run preview               # 预览构建结果
npm run lint                  # 代码检查

# 部署
./deploy.sh                   # 自动构建
rsync -avz dist/ server:/www/ # 上传文件

# Apache
sudo systemctl restart apache2 # 重启Apache
sudo apache2ctl configtest    # 测试配置
sudo a2enmod rewrite          # 启用模块

# 调试
tail -f /var/log/apache2/error.log  # 查看日志
curl -I https://aigc.wzbc.edu.cn    # 测试访问
```

### 重要URL

| 用途 | URL |
|------|-----|
| **生产网站** | https://aigc.wzbc.edu.cn |
| **开发环境** | http://localhost:5173 |
| **OAuth回调** | https://aigc.wzbc.edu.cn/auth/callback |
| **CAS登录** | https://cas.wzbc.edu.cn/cas/oauth2.0/authorize |
| **CAS注销** | https://cas.wzbc.edu.cn/cas/logout |
| **Supabase** | https://supabase.com/dashboard |

---

**文档版本**: 2.0  
**更新日期**: 2025-12-03  
**维护者**: 开发团队  
**状态**: ✅ 完整版
