# 🔐 CAS登录配置指南

## 📋 问题说明

**现象**: 点击"统一身份认证"登录，成功输入账号密码后返回项目界面仍显示未登录状态

**原因**: Edge Function未部署到Supabase云端，导致OAuth回调处理失败

---

## ✅ 解决方案

### 方案概述

项目使用以下登录流程：

```
用户点击登录
  ↓
跳转到CAS认证页面 (https://cas.wzbc.edu.cn)
  ↓
用户输入账号密码
  ↓
CAS认证成功，返回授权码(code)
  ↓
回调到前端页面 (/auth/callback)
  ↓
前端调用Supabase Edge Function (oauth-callback)
  ↓
Edge Function用授权码换取用户信息
  ↓
返回用户信息给前端
  ↓
前端创建Supabase会话
  ↓
登录成功！
```

**关键点**: Edge Function必须部署到Supabase云端才能工作

---

## 🚀 部署步骤

### 第1步：安装Supabase CLI

**在服务器上执行**:

```bash
# 安装Supabase CLI
npm install -g supabase

# 验证安装
supabase --version
```

### 第2步：登录Supabase

```bash
# 登录Supabase账号
supabase login

# 会打开浏览器，登录您的Supabase账号
# 登录成功后，CLI会自动获取访问令牌
```

### 第3步：关联项目

```bash
# 进入项目目录
cd ~/projects/app-7z58i603if41

# 关联到Supabase项目
supabase link --project-ref <YOUR_PROJECT_REF>

# 项目引用ID可以从Supabase控制台获取
# 或从.env文件中的VITE_SUPABASE_URL提取
```

**如何获取项目引用ID**:

从 `.env` 文件中的 `VITE_SUPABASE_URL` 提取：

```
VITE_SUPABASE_URL=https://backend.appmiaoda.com/projects/supabase254442544895672320
                                                          ^^^^^^^^^^^^^^^^^^^^^^^^
                                                          这是项目引用ID
```

### 第4步：部署Edge Function

```bash
# 部署oauth-callback函数
supabase functions deploy oauth-callback

# 等待部署完成
# 成功后会显示函数URL
```

### 第5步：配置环境变量

在Supabase控制台配置Edge Function的环境变量：

1. 访问 Supabase 控制台
2. 进入项目设置 → Edge Functions
3. 找到 `oauth-callback` 函数
4. 添加以下环境变量：

```bash
OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile
OAUTH_CLIENT_ID=CijBwB5EwTTXouO7
OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6
OAUTH_REDIRECT_URI=https://aigctmp.wzbc.edu.cn/auth/callback
```

### 第6步：重新构建并部署前端

```bash
# 构建项目
npm run build

# 部署到服务器
./deploy.sh
# 或手动上传
rsync -avz --delete dist/ lw@10.145.251.29:/var/www/aigctmp/
```

### 第7步：测试登录

1. 访问 https://aigctmp.wzbc.edu.cn
2. 点击"登录"按钮
3. 输入学号和密码
4. 登录成功后，应该能看到用户信息

---

## 🔍 故障排查

### 问题1: supabase命令不存在

**解决**:
```bash
# 全局安装Supabase CLI
npm install -g supabase

# 或使用npx
npx supabase --version
```

### 问题2: 登录失败

**检查**:
```bash
# 查看Supabase登录状态
supabase status

# 重新登录
supabase login
```

### 问题3: 无法关联项目

**解决**:
```bash
# 确保项目引用ID正确
# 从Supabase控制台获取正确的项目ID

# 或使用项目URL
supabase link --project-url https://backend.appmiaoda.com/projects/supabase254442544895672320
```

### 问题4: Edge Function部署失败

**检查**:
```bash
# 查看详细错误信息
supabase functions deploy oauth-callback --debug

# 检查函数代码
cat supabase/functions/oauth-callback/index.ts
```

### 问题5: 登录后仍显示未登录

**排查步骤**:

1. **打开浏览器开发者工具**（F12）
2. **切换到Console标签**
3. **点击登录**
4. **查看错误信息**

**常见错误**:

**错误A**: `Edge Function调用失败`
```
原因: Edge Function未部署或部署失败
解决: 重新部署Edge Function
```

**错误B**: `获取access_token失败`
```
原因: CAS OAuth配置错误
解决: 检查OAUTH_CLIENT_ID和OAUTH_CLIENT_SECRET
```

**错误C**: `未能获取用户信息`
```
原因: Edge Function返回数据格式错误
解决: 查看Edge Function日志
```

### 查看Edge Function日志

```bash
# 实时查看日志
supabase functions logs oauth-callback --follow

# 或在Supabase控制台查看
# 项目设置 → Edge Functions → oauth-callback → Logs
```

---

## 📝 验证清单

部署完成后，请检查以下项目：

### Supabase配置
- [ ] Supabase CLI已安装
- [ ] 已登录Supabase账号
- [ ] 项目已关联
- [ ] Edge Function已部署
- [ ] 环境变量已配置

### 前端配置
- [ ] .env文件配置正确
- [ ] VITE_SUPABASE_URL正确
- [ ] VITE_SUPABASE_ANON_KEY正确
- [ ] 项目已重新构建
- [ ] 已部署到服务器

### 功能测试
- [ ] 可以访问网站
- [ ] 点击登录跳转到CAS
- [ ] 输入账号密码成功
- [ ] 回调到网站
- [ ] 显示登录状态
- [ ] Header显示用户信息

---

## 🎯 快速命令参考

```bash
# === Supabase CLI ===
# 安装
npm install -g supabase

# 登录
supabase login

# 关联项目
supabase link --project-ref supabase254442544895672320

# 部署Edge Function
supabase functions deploy oauth-callback

# 查看日志
supabase functions logs oauth-callback --follow

# === 前端部署 ===
# 构建
npm run build

# 部署
./deploy.sh

# === 测试 ===
# 访问网站
https://aigctmp.wzbc.edu.cn

# 查看浏览器控制台
F12 → Console
```

---

## 💡 重要提示

### 关于Supabase云服务

**您选择的是方案B（使用Supabase云服务）**，这意味着：

✅ **优点**:
- 无需配置本地数据库
- 无需开发后端API
- 部署简单，维护方便
- 功能完整，支持所有特性

⚠️ **注意**:
- 需要Supabase账号（免费）
- Edge Function必须部署到云端
- 依赖网络连接

### 关于数据存储

项目使用Supabase云数据库存储：
- 用户信息
- 报名数据
- 作品信息

**数据安全**:
- 所有数据加密传输（HTTPS）
- Supabase提供数据备份
- 符合数据安全标准

---

## 📞 需要帮助？

### 如果遇到问题

1. **查看浏览器控制台**（F12 → Console）
2. **查看Edge Function日志**（`supabase functions logs oauth-callback`）
3. **查看Apache日志**（`sudo tail -f /var/log/apache2/aigctmp_error.log`）

### 常用调试命令

```bash
# 查看Supabase状态
supabase status

# 测试Edge Function
curl -X POST https://backend.appmiaoda.com/projects/supabase254442544895672320/functions/v1/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{"code":"test","state":"test"}'

# 查看前端日志
# 浏览器 F12 → Console

# 查看Apache日志
sudo tail -f /var/log/apache2/aigctmp_error.log
```

---

## ✅ 成功标志

部署成功后，您应该能够：

1. ✅ 访问 https://aigctmp.wzbc.edu.cn
2. ✅ 点击"登录"按钮
3. ✅ 跳转到CAS认证页面
4. ✅ 输入学号和密码
5. ✅ 成功登录并返回网站
6. ✅ Header显示用户信息（姓名）
7. ✅ 可以访问需要登录的页面（报名、作品提交等）

---

**文档版本**: 1.0  
**更新日期**: 2025-12-03  
**适用场景**: CAS登录配置和Edge Function部署
