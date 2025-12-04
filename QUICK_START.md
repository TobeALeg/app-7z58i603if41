# 🚀 OAuth 2.0 SSO 快速配置指南

## ⚡ 5分钟快速配置

### 步骤1: 修改OAuth配置文件

编辑 `src/config/oauth.ts`，替换以下内容：

```typescript
export const OAUTH_CONFIG = {
  // 替换为学校提供的授权端点
  authorizationUrl: 'https://sso.your-university.edu.cn/oauth/authorize',
  
  // 替换为学校提供的Token端点
  tokenUrl: 'https://sso.your-university.edu.cn/oauth/token',
  
  // 替换为学校提供的用户信息端点
  userInfoUrl: 'https://sso.your-university.edu.cn/oauth/userinfo',
  
  // 替换为学校提供的客户端ID
  clientId: 'your_client_id_here',
  
  // 替换为学校提供的客户端密钥
  clientSecret: 'your_client_secret_here',
  
  // 回调URL（自动生成，无需修改）
  redirectUri: `${window.location.origin}/auth/callback`,
  
  // 根据学校要求修改scope
  scope: 'openid profile email',
  
  // 根据学校OAuth返回的字段调整映射
  userInfoMapping: {
    oauthId: 'sub',           // 用户唯一ID字段名
    studentId: 'student_id',   // 学号字段名
    realName: 'name',          // 姓名字段名
    email: 'email',            // 邮箱字段名
    username: 'preferred_username' // 用户名字段名
  }
};
```

### 步骤2: 配置Supabase环境变量

使用Supabase CLI或Web界面添加环境变量：

```bash
OAUTH_TOKEN_URL=https://sso.your-university.edu.cn/oauth/token
OAUTH_USERINFO_URL=https://sso.your-university.edu.cn/oauth/userinfo
OAUTH_CLIENT_ID=your_client_id_here
OAUTH_CLIENT_SECRET=your_client_secret_here
OAUTH_REDIRECT_URI=https://aigc.wzbc.edu.cn/auth/callback
```

### 步骤3: 在学校OAuth系统注册回调URL

在学校的OAuth管理后台添加回调URL：

```
https://aigc.wzbc.edu.cn/auth/callback
```

### 步骤4: 测试登录

1. 访问登录页面
2. 点击"通过学校统一身份认证登录"
3. 在学校系统完成登录
4. 验证是否成功返回并显示用户信息

## 📋 配置检查清单

- [ ] 已获取学校OAuth配置信息
- [ ] 已修改 `src/config/oauth.ts`
- [ ] 已配置Supabase环境变量
- [ ] 已在学校系统注册回调URL
- [ ] 已测试完整登录流程
- [ ] 用户信息字段映射正确

## 🔍 如何获取字段映射

### 方法1: 查看学校OAuth文档

学校通常会提供OAuth接口文档，说明返回的用户信息格式。

### 方法2: 测试获取

1. 使用Postman或curl测试OAuth接口
2. 查看返回的JSON格式
3. 根据实际字段名调整映射

示例返回：
```json
{
  "sub": "2023001",
  "student_number": "2023001",  // 如果是这个字段，修改为 studentId: 'student_number'
  "full_name": "张三",          // 如果是这个字段，修改为 realName: 'full_name'
  "email": "student@edu.cn"
}
```

## ⚠️ 重要提示

1. **客户端密钥安全**
   - 生产环境不要在前端代码中暴露密钥
   - 使用Supabase环境变量存储
   - 通过Edge Function处理敏感操作

2. **回调URL配置**
   - 开发环境: `http://localhost:5173/auth/callback`
   - 生产环境: `https://aigc.wzbc.edu.cn/auth/callback`
   - 两个环境都需要在学校系统注册

3. **HTTPS要求**
   - 生产环境必须使用HTTPS
   - 学校OAuth系统通常要求HTTPS回调

## 🐛 快速排查

### 登录按钮点击无反应

检查 `src/config/oauth.ts` 中的 `authorizationUrl` 是否正确

### 回调后显示错误

1. 检查回调URL是否已注册
2. 检查 `tokenUrl` 和 `clientId/clientSecret` 是否正确
3. 查看浏览器控制台错误信息

### 用户信息显示不正确

调整 `userInfoMapping` 中的字段映射，确保与OAuth返回的字段名一致

## 📞 需要帮助？

详细配置说明请查看 `OAUTH_SETUP.md`
