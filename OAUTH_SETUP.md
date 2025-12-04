# OAuth 2.0 SSO 接入配置指南

## 📋 概述

本系统已集成学校统一身份认证OAuth 2.0 SSO登录功能。用户无需注册，直接使用学校账号登录即可。

## 🔧 配置步骤

### 1. 获取OAuth配置信息

联系学校信息中心或OAuth系统管理员，获取以下信息：

- **授权端点URL** (Authorization URL)
- **Token端点URL** (Token URL)
- **用户信息端点URL** (UserInfo URL)
- **客户端ID** (Client ID)
- **客户端密钥** (Client Secret)
- **Scope范围** (例如: `openid profile email student_info`)
- **用户信息字段映射** (返回的JSON字段名称)

### 2. 配置OAuth参数

编辑 `src/config/oauth.ts` 文件，填入获取的配置信息：

```typescript
export const OAUTH_CONFIG = {
  // 示例: 'https://sso.university.edu.cn/oauth/authorize'
  authorizationUrl: 'YOUR_AUTHORIZATION_URL',
  
  // 示例: 'https://sso.university.edu.cn/oauth/token'
  tokenUrl: 'YOUR_TOKEN_URL',
  
  // 示例: 'https://sso.university.edu.cn/oauth/userinfo'
  userInfoUrl: 'YOUR_USERINFO_URL',
  
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  
  // 回调URL会自动生成，格式为: https://aigc.wzbc.edu.cn/auth/callback
  redirectUri: `${window.location.origin}/auth/callback`,
  
  // 根据学校系统要求配置
  scope: 'openid profile email',
  
  // 用户信息字段映射
  userInfoMapping: {
    oauthId: 'sub',        // OAuth用户ID字段
    studentId: 'student_id', // 学号字段
    realName: 'name',       // 真实姓名字段
    email: 'email',         // 邮箱字段
    username: 'preferred_username' // 用户名字段
  }
};
```

### 3. 配置Supabase环境变量

为了安全起见，OAuth配置应该存储在Supabase的环境变量中。

使用以下命令添加环境变量：

```bash
# OAuth Token端点
OAUTH_TOKEN_URL=https://sso.university.edu.cn/oauth/token

# OAuth用户信息端点
OAUTH_USERINFO_URL=https://sso.university.edu.cn/oauth/userinfo

# OAuth客户端ID
OAUTH_CLIENT_ID=your_client_id

# OAuth客户端密钥
OAUTH_CLIENT_SECRET=your_client_secret

# OAuth回调URL
OAUTH_REDIRECT_URI=https://aigc.wzbc.edu.cn/auth/callback
```

### 4. 部署Edge Function

部署OAuth回调处理函数：

```bash
# Edge Function已创建在 supabase/functions/oauth-callback/
# 部署时会自动使用Supabase中配置的环境变量
```

### 5. 在学校OAuth系统中注册回调URL

在学校的OAuth管理后台中，注册以下回调URL：

```
https://aigc.wzbc.edu.cn/auth/callback
```

## 🔄 OAuth登录流程

1. **用户点击登录按钮**
   - 页面跳转到学校OAuth授权页面

2. **用户在学校系统登录**
   - 输入学号和密码
   - 授权应用访问基本信息

3. **OAuth系统回调**
   - 携带授权码返回到应用
   - Edge Function处理授权码

4. **获取用户信息**
   - 使用授权码换取access_token
   - 使用access_token获取用户信息

5. **创建/登录用户**
   - 首次登录自动创建账号
   - 后续登录直接进入系统

## 📊 数据库字段说明

OAuth用户信息存储在 `profiles` 表中：

| 字段 | 类型 | 说明 |
|------|------|------|
| `oauth_id` | text | OAuth系统返回的唯一用户ID |
| `student_id` | text | 学号 |
| `real_name` | text | 真实姓名 |
| `username` | text | 用户名（可选） |
| `oauth_provider` | text | OAuth提供商标识 |

## 🔒 安全注意事项

1. **客户端密钥保护**
   - 不要在前端代码中硬编码客户端密钥
   - 使用Supabase环境变量存储敏感信息
   - 所有涉及密钥的操作在Edge Function中完成

2. **CSRF防护**
   - 使用state参数防止CSRF攻击
   - 每次登录生成随机state值
   - 回调时验证state值

3. **HTTPS要求**
   - 生产环境必须使用HTTPS
   - OAuth回调URL必须是HTTPS

## 🧪 测试步骤

### 本地测试

1. 配置OAuth参数
2. 启动开发服务器
3. 访问登录页面
4. 点击"通过学校统一身份认证登录"
5. 完成OAuth授权流程
6. 验证用户信息是否正确同步

### 生产环境测试

1. 确保回调URL已在学校系统注册
2. 确保环境变量已正确配置
3. 部署Edge Function
4. 完整测试登录流程

## 🐛 常见问题

### 1. 回调失败

**问题**: 点击登录后无法返回应用

**解决方案**:
- 检查回调URL是否正确注册
- 检查OAuth配置中的redirectUri是否正确
- 查看浏览器控制台错误信息

### 2. 获取用户信息失败

**问题**: 登录成功但无法获取用户信息

**解决方案**:
- 检查userInfoMapping字段映射是否正确
- 查看OAuth系统返回的用户信息格式
- 调整字段映射配置

### 3. 首次登录失败

**问题**: 首次登录时创建用户失败

**解决方案**:
- 检查数据库触发器是否正常
- 查看Supabase日志
- 确认用户元数据格式正确

## 📞 技术支持

如遇到问题，请检查：

1. Supabase日志
2. 浏览器控制台
3. Edge Function日志
4. 学校OAuth系统文档

## 🔄 从用户名密码登录迁移

如果之前使用用户名密码登录，现在切换到OAuth：

1. 原有用户数据保留
2. OAuth用户和原有用户独立
3. 可以保留管理员账号使用密码登录
4. 建议逐步迁移用户到OAuth

## 📝 用户信息示例

学校OAuth系统通常返回以下格式的用户信息：

```json
{
  "sub": "20230001",
  "student_id": "20230001",
  "name": "张三",
  "email": "20230001@university.edu.cn",
  "preferred_username": "zhangsan",
  "department": "计算机学院",
  "major": "软件工程"
}
```

根据实际返回格式调整 `userInfoMapping` 配置。
