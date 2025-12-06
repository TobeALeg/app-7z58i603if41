# CAS官方文档修复方案

## 问题根源

根据**CAS OAuth 2.0官方文档**，我们之前的实现方式不符合CAS的要求。

## CAS官方要求

### Token Endpoint请求格式

根据官方文档，正确的请求格式是：

```http
GET /cas/oauth2.0/accessToken?grant_type=authorization_code&client_id=902&client_secret=902&redirect_uri=https://example.com/oauth2/authcode&code=OC-2-lO-RjC5flQ3fqsw2LV0bAYEvy6rVfyXV HTTP/1.1
Host: cas.wzbc.edu.cn
```

**关键点**：
- ✅ 使用**GET请求**（推荐）或POST请求
- ✅ 参数必须在**URL查询参数**中
- ✅ 参数顺序：`grant_type`, `client_id`, `client_secret`, `redirect_uri`, `code`

### 官方文档说明

> "第三方应用须通过服务器端代码，请求换取 Access Token（**请求可以为 GET 、POST**）。"

### 响应格式

**成功响应**：
```http
HTTP/2 200
content-type: application/json;charset=UTF-8

{"access_token":"AT-1-4OAC0xUWy-QX0zfMr2ERQHUCxbTRSJZ-","token_type":"bearer","expires_in":28800,"refresh_token":"RT-1-MKzu3V2IbXeme1V-4dIilIu1s3jrP5bZ"}
```

**失败响应**：
```http
HTTP/2 400
content-type: text/plain;charset=UTF-8

error=invalid_request
```

> "表示 参数缺少、参数传值错误、code 无效 等"

## 我们的修复方案

### 修改内容

**文件**: `supabase/functions/oauth-callback/index.ts`  
**位置**: 第66-117行

### 修改策略

实现三种请求方式的智能重试，**优先使用CAS推荐的GET请求**：

1. **方式1**: GET请求，参数在URL中（CAS标准方式）✅
2. **方式2**: POST请求，参数在URL中（备选方式）
3. **方式3**: POST请求，参数在请求体中（兼容其他OAuth服务器）

### 代码实现

```typescript
// 1. 构建参数（符合CAS要求的顺序）
const tokenParams = new URLSearchParams({
  grant_type: 'authorization_code',
  client_id: OAUTH_CONFIG.clientId,
  client_secret: OAUTH_CONFIG.clientSecret,
  redirect_uri: OAUTH_CONFIG.redirectUri,
  code: code,
});

const tokenUrl = `${OAUTH_CONFIG.tokenUrl}?${tokenParams.toString()}`;

// 2. 方式1: GET请求（CAS官方推荐）
let tokenResponse = await fetch(tokenUrl, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  },
});

// 3. 方式2: POST请求，参数在URL中
if (!tokenResponse.ok) {
  tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
  });
}

// 4. 方式3: POST请求，参数在请求体中
if (!tokenResponse.ok) {
  tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString(),
  });
}
```

### 关键改进

1. ✅ **优先使用GET请求**（符合CAS官方文档）
2. ✅ **参数在URL中**（符合CAS要求）
3. ✅ **正确的参数顺序**（grant_type, client_id, client_secret, redirect_uri, code）
4. ✅ **详细的日志记录**（便于调试）
5. ✅ **智能重试机制**（自动尝试三种方式）

## 与之前的对比

### 之前的错误实现

```typescript
// ❌ 错误：优先使用Basic Auth（CAS不支持）
const basicAuth = btoa(`${clientId}:${clientSecret}`);
const tokenResponse = await fetch(tokenUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${basicAuth}`,
  },
  body: tokenParams,
});
```

### 现在的正确实现

```typescript
// ✅ 正确：优先使用GET请求，参数在URL中（CAS标准）
const tokenUrl = `${OAUTH_CONFIG.tokenUrl}?${tokenParams.toString()}`;
const tokenResponse = await fetch(tokenUrl, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  },
});
```

## 参数说明

根据CAS官方文档，所有参数必须包含：

| 参数 | 说明 | 示例 |
|------|------|------|
| `grant_type` | 固定值 | `authorization_code` |
| `client_id` | 应用注册时生成的唯一标识 | `CijBwB5EwTTXouO7` |
| `client_secret` | 应用注册时生成的密钥 | `O8dOsXE7p7yMbh18KEP2Z6` |
| `redirect_uri` | 与认证登录时的redirect_uri保持一致 | `https://aigctmp.wzbc.edu.cn/auth/callback` |
| `code` | 认证登录返回的授权码 | `OC-2-lO-RjC5flQ3fqsw2LV0bAYEvy6rVfyXV` |

## 获取用户信息

成功获取access_token后，调用profile接口：

```http
GET /cas/oauth2.0/profile?access_token=AT-1-4OAC0xUWy-QX0zfMr2ERQHUCxbTRSJZ- HTTP/1.1
Host: cas.wzbc.edu.cn
```

**响应示例**：
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

## 重新部署

### 1. 部署Edge Function

```bash
cd ~/projects/app-7z58i603if41
./redeploy-edge-function.sh
```

### 2. 查看日志

```bash
supabase functions logs oauth-callback --follow
```

**预期日志**：
```
收到授权码，开始换取access_token...
Token URL: https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
Client ID: CijBwB5EwTTXouO7
Redirect URI: https://aigctmp.wzbc.edu.cn/auth/callback
Code: OC-2-xxx...
方式1: GET请求（CAS标准方式）
完整URL: https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken?grant_type=...
Token响应: { access_token: "AT-1-...", token_type: "bearer", ... }
成功获取access_token，开始获取用户信息...
```

### 3. 测试登录

1. 访问 https://aigctmp.wzbc.edu.cn
2. 点击"登录"
3. 输入学号和密码
4. 应该能成功登录

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `error=invalid_request` | 参数缺少、参数传值错误 | 检查所有参数是否正确 |
| `error=invalid_grant` | 授权码无效或已过期 | 重新登录获取新的授权码 |
| `HTTP 401` | client_id或client_secret错误 | 检查环境变量配置 |

### 调试技巧

1. **查看完整URL**：
   ```
   日志中会显示：完整URL: https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken?grant_type=...
   ```

2. **检查参数编码**：
   - redirect_uri应该被正确URL编码
   - 例如：`https://aigctmp.wzbc.edu.cn/auth/callback` → `https%3A%2F%2Faigctmp.wzbc.edu.cn%2Fauth%2Fcallback`

3. **验证授权码**：
   - 授权码只能使用一次
   - 授权码有效期很短（通常10秒）
   - 不要刷新回调页面

## 验证清单

- [ ] Edge Function已重新部署
- [ ] 日志显示"方式1: GET请求（CAS标准方式）"
- [ ] 日志显示完整的请求URL
- [ ] 测试脚本不再返回`invalid_request`
- [ ] 可以成功登录
- [ ] Header显示用户信息

## 参考文档

- **CAS OAuth 2.0官方文档**：您提供的文档
- **Token Endpoint**：`/cas/oauth2.0/accessToken`
- **Profile Endpoint**：`/cas/oauth2.0/profile`
- **请求方式**：GET或POST，参数在URL中

---

**关键结论**：
- ✅ CAS要求使用GET请求（或POST），参数在URL中
- ✅ 不支持HTTP Basic Authentication
- ✅ 不支持参数在请求体中（对于GET请求）
- ✅ 我们的新实现完全符合CAS官方文档要求

---

**文档版本**: 1.0  
**最后更新**: 2025-12-06  
**基于**: CAS OAuth 2.0官方文档  
**修改文件**: `supabase/functions/oauth-callback/index.ts`
