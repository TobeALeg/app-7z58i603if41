# 温州商学院CAS认证系统接入指南

## 🎓 系统信息

**学校**: 温州商学院  
**认证系统**: CAS OAuth 2.0  
**版本**: 1.5.0+  
**基础URL**: https://cas.wzbc.edu.cn

## ✅ 已完成配置

系统已根据温州商学院CAS认证系统的接口文档完成配置，以下是已配置的信息：

### OAuth 2.0 端点

| 端点 | URL |
|------|-----|
| 授权端点 | `https://cas.wzbc.edu.cn/cas/oauth2.0/authorize` |
| Token端点 | `https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken` |
| 用户信息端点 | `https://cas.wzbc.edu.cn/cas/oauth2.0/profile` |

### 应用凭证

| 参数 | 值 |
|------|-----|
| Client ID | `CijBwB5EwTTXouO7` |
| Client Secret | `O8dOsXE7p7yMbh18KEP2Z6` |

## 🔄 OAuth 2.0 认证流程

### 1. 用户点击登录

用户在应用中点击"通过学校统一身份认证登录"按钮

### 2. 跳转到CAS授权页面

应用将用户重定向到：

```
https://cas.wzbc.edu.cn/cas/oauth2.0/authorize?
  response_type=code&
  client_id=CijBwB5EwTTXouO7&
  redirect_uri=https://aigctmp.wzbc.edu.cn/auth/callback&
  state=RANDOM_STATE
```

### 3. 用户在CAS系统登录

用户输入学号和密码，完成身份认证

### 4. CAS系统返回授权码

认证成功后，CAS系统重定向回应用：

```
https://aigctmp.wzbc.edu.cn/auth/callback?
  code=OC-2-lO-RjC5flQ3fqsw2LV0bAYEvy6rVfyXV&
  state=RANDOM_STATE
```

### 5. 换取Access Token

Edge Function使用授权码换取access_token：

```
GET https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken?
  grant_type=authorization_code&
  client_id=CijBwB5EwTTXouO7&
  client_secret=O8dOsXE7p7yMbh18KEP2Z6&
  redirect_uri=https://aigctmp.wzbc.edu.cn/auth/callback&
  code=OC-2-lO-RjC5flQ3fqsw2LV0bAYEvy6rVfyXV
```

响应：

```json
{
  "access_token": "AT-1-4OAC0xUWy-QX0zfMr2ERQHUCxbTRSJZ-",
  "token_type": "bearer",
  "expires_in": 28800,
  "refresh_token": "RT-1-MKzu3V2IbXeme1V-4dIilIu1s3jrP5bZ"
}
```

### 6. 获取用户信息

使用access_token获取用户信息：

```
GET https://cas.wzbc.edu.cn/cas/oauth2.0/profile?
  access_token=AT-1-4OAC0xUWy-QX0zfMr2ERQHUCxbTRSJZ-
```

响应：

```json
{
  "id": "smartadmin",
  "attributes": {
    "name": "智慧校园管理员",
    "accountId": "1",
    "accountName": "smartadmin",
    "userId": "1",
    "userName": "智慧校园管理员",
    "identityTypeId": "1",
    "identityTypeCode": "admin",
    "identityTypeName": "管理",
    "organizationId": "1",
    "organizationCode": "1",
    "organizationName": "智慧大学"
  },
  "client_id": "902",
  "service": "https://example.com/oauth2/authcode"
}
```

## 📊 用户信息字段映射

系统已配置以下字段映射：

| 应用字段 | CAS字段 | 说明 |
|---------|---------|------|
| oauth_id | id | OAuth用户唯一标识 |
| student_id | attributes.accountName | 学号 |
| real_name | attributes.userName | 真实姓名 |
| username | attributes.accountName | 用户名 |
| identity_type | attributes.identityTypeName | 身份类型（管理/学生等） |
| organization | attributes.organizationName | 所属组织 |

## 🚀 部署步骤

### 步骤1: 在CAS系统注册回调URL

联系学校信息中心，在CAS系统中注册以下回调URL：

**开发环境**:
```
http://localhost:5173/auth/callback
```

**生产环境**:
```
https://aigctmp.wzbc.edu.cn/auth/callback
```

### 步骤2: 配置Supabase环境变量

在Supabase项目设置中添加以下环境变量：

```bash
OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile
OAUTH_CLIENT_ID=CijBwB5EwTTXouO7
OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6
OAUTH_REDIRECT_URI=https://aigctmp.wzbc.edu.cn/auth/callback
```

### 步骤3: 部署Edge Function

部署oauth-callback Edge Function：

```bash
# 使用Supabase CLI
supabase functions deploy oauth-callback

# 或通过Supabase Dashboard部署
```

### 步骤4: 测试登录流程

1. 访问应用登录页面
2. 点击"通过学校统一身份认证登录"
3. 在CAS系统输入学号密码
4. 验证是否成功登录并显示用户信息

## 🔒 安全说明

### CSRF防护

系统使用`state`参数防止CSRF攻击：

1. 生成随机state并存储在sessionStorage
2. 跳转到CAS时携带state
3. 回调时验证state是否匹配

### 客户端密钥保护

- ✅ 客户端密钥已配置在Edge Function中
- ✅ 不在前端代码中暴露
- ✅ 使用Supabase环境变量管理

### Token过期处理

- Access Token有效期：28800秒（8小时）
- 系统会在token过期时提示重新登录
- 支持使用refresh_token刷新access_token

## 🧪 测试清单

- [ ] 回调URL已在CAS系统注册
- [ ] Supabase环境变量已配置
- [ ] Edge Function已部署
- [ ] 登录按钮跳转正常
- [ ] CAS系统认证成功
- [ ] 回调处理正确
- [ ] 用户信息显示正确
- [ ] 学号和姓名同步正确
- [ ] 报名功能正常
- [ ] 作品提交正常

## 📝 CAS系统特性

### 支持的功能

- ✅ OAuth 2.0 Authorization Code Grant
- ✅ Access Token获取
- ✅ Refresh Token刷新
- ✅ 用户信息查询
- ✅ 单点登录（SSO）
- ✅ 单点注销（SLO）

### 用户属性

CAS系统提供以下用户属性：

| 属性 | 说明 | 示例 |
|------|------|------|
| name | 姓名 | 智慧校园管理员 |
| accountId | 账号ID | 1 |
| accountName | 账号名称 | smartadmin |
| userId | 用户ID | 1 |
| userName | 用户姓名 | 智慧校园管理员 |
| identityTypeId | 身份ID | 1 |
| identityTypeCode | 身份代码 | admin |
| identityTypeName | 身份名称 | 管理 |
| organizationId | 组织机构ID | 1 |
| organizationCode | 组织机构代码 | 1 |
| organizationName | 组织机构名称 | 智慧大学 |

## 🐛 常见问题

### 1. 登录后跳转失败

**原因**: 回调URL未在CAS系统注册

**解决**: 联系学校信息中心注册回调URL

### 2. 获取用户信息失败

**原因**: Access Token无效或过期

**解决**: 检查token获取流程，确保正确传递access_token

### 3. 用户信息显示不正确

**原因**: 字段映射配置错误

**解决**: 检查`src/config/oauth.ts`中的`userInfoMapping`配置

### 4. CSRF验证失败

**原因**: State参数不匹配

**解决**: 确保sessionStorage正常工作，检查浏览器隐私设置

## 📞 技术支持

### 学校信息中心

- 联系方式：（请填写学校信息中心联系方式）
- 负责内容：CAS系统配置、回调URL注册、应用凭证管理

### 应用开发团队

- 查看文档：`OAUTH_SETUP.md`、`QUICK_START.md`
- 技术问题：查看浏览器控制台和Supabase日志

## 🎉 配置完成

系统已完成温州商学院CAS认证系统的接入配置，只需完成以下步骤即可使用：

1. ✅ OAuth配置已完成
2. ⏳ 在CAS系统注册回调URL
3. ⏳ 配置Supabase环境变量
4. ⏳ 部署Edge Function
5. ⏳ 测试登录流程

---

**文档版本**: 1.0  
**更新日期**: 2025-12-03  
**CAS版本**: 1.5.0+
