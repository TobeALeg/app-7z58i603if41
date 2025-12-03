# 🎯 从这里开始 - OAuth 2.0 SSO 配置

## 👋 欢迎

您的智能体比赛报名平台已成功接入学校统一身份认证OAuth 2.0 SSO！

用户现在可以使用学号和密码直接登录，无需单独注册。

## 🚀 快速开始（3步完成配置）

### 第1步：获取OAuth配置信息

联系学校信息中心，获取以下信息：

```
✓ 授权端点URL (Authorization URL)
✓ Token端点URL (Token URL)  
✓ 用户信息端点URL (UserInfo URL)
✓ 客户端ID (Client ID)
✓ 客户端密钥 (Client Secret)
✓ 用户信息字段格式
```

### 第2步：修改配置文件

编辑 `src/config/oauth.ts`，填入获取的信息：

```typescript
export const OAUTH_CONFIG = {
  authorizationUrl: '学校提供的授权URL',
  tokenUrl: '学校提供的Token URL',
  userInfoUrl: '学校提供的用户信息URL',
  clientId: '学校提供的客户端ID',
  clientSecret: '学校提供的客户端密钥',
  // ... 其他配置
};
```

### 第3步：注册回调URL

在学校OAuth管理后台注册：

```
开发环境: http://localhost:5173/auth/callback
生产环境: https://your-domain.com/auth/callback
```

## 📚 详细文档

| 文档 | 用途 |
|------|------|
| **QUICK_START.md** | 5分钟快速配置指南 |
| **OAUTH_SETUP.md** | 完整配置说明和技术细节 |
| **CONFIGURATION_CHECKLIST.md** | 配置检查清单 |
| **OAUTH_MIGRATION_SUMMARY.md** | 系统改造总结 |

## 🎯 配置完成后

1. 启动应用
2. 访问登录页面
3. 点击"通过学校统一身份认证登录"
4. 完成OAuth授权
5. 开始使用！

## ⚡ 开发环境调试

启动应用后，打开浏览器控制台，会看到OAuth配置状态：

```
🔐 OAuth 2.0 SSO 配置状态
✅ OAuth配置已完成
或
❌ OAuth配置未完成，缺少以下字段：
  - authorizationUrl (授权端点URL)
  - ...
```

## 🆘 需要帮助？

### 配置问题
→ 查看 `QUICK_START.md`

### 技术细节
→ 查看 `OAUTH_SETUP.md`

### 检查清单
→ 查看 `CONFIGURATION_CHECKLIST.md`

## 📊 系统功能

✅ 学校统一身份认证登录  
✅ 自动同步学号和姓名  
✅ 在线报名  
✅ 作品提交  
✅ 报名状态查询  
✅ 管理后台  

## 🎉 开始配置

**下一步**: 打开 `QUICK_START.md` 开始配置！

---

**配置时间**: 约5-10分钟  
**难度**: ⭐⭐☆☆☆ (简单)
