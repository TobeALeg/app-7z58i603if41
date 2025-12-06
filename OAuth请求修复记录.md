# OAuth请求修复记录

## 问题描述

Edge Function持续返回500错误：
```json
{
  "error": "获取access_token失败",
  "details": "error=invalid_request"
}
```

## 问题根源

**OAuth token请求的参数传递方式不正确**

CAS OAuth 2.0服务器要求：
- ✅ 使用POST方法
- ✅ 参数必须在**请求体**中
- ✅ Content-Type必须是`application/x-www-form-urlencoded`

## 修改历史

### 第一次尝试（失败）❌

**文件**: `supabase/functions/oauth-callback/index.ts`

**修改内容**:
```typescript
// 错误的方式：GET请求，参数在URL中
const tokenResponse = await fetch(`${OAUTH_CONFIG.tokenUrl}?${tokenParams}`, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  },
});
```

**结果**: 返回500错误 - `error=invalid_request`

---

### 第二次尝试（失败）❌

**文件**: `supabase/functions/oauth-callback/index.ts`

**修改内容**:
```typescript
// 错误的方式：POST请求，但参数在URL中
const tokenUrl = `${OAUTH_CONFIG.tokenUrl}?${tokenParams.toString()}`;
const tokenResponse = await fetch(tokenUrl, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  // 没有body！
});
```

**结果**: 仍然返回500错误 - `error=invalid_request`

**问题**: 虽然改成了POST，但参数仍在URL中，请求体为空

---

### 第三次尝试（正确）✅

**文件**: `supabase/functions/oauth-callback/index.ts`

**修改位置**: 第66-90行

**修改前**:
```typescript
// 1. 使用授权码换取access_token
// CAS OAuth 2.0 通常使用POST请求，参数在URL中
const tokenParams = new URLSearchParams({
  grant_type: 'authorization_code',
  code: code,
  redirect_uri: OAUTH_CONFIG.redirectUri,
  client_id: OAUTH_CONFIG.clientId,
  client_secret: OAUTH_CONFIG.clientSecret,
});

const tokenUrl = `${OAUTH_CONFIG.tokenUrl}?${tokenParams.toString()}`;
console.log('请求Token URL:', tokenUrl);

const tokenResponse = await fetch(tokenUrl, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});
```

**修改后**:
```typescript
// 1. 使用授权码换取access_token
// CAS OAuth 2.0 标准：POST请求，参数在请求体中
const tokenParams = new URLSearchParams({
  grant_type: 'authorization_code',
  code: code,
  redirect_uri: OAUTH_CONFIG.redirectUri,
  client_id: OAUTH_CONFIG.clientId,
  client_secret: OAUTH_CONFIG.clientSecret,
});

console.log('请求参数:', tokenParams.toString());

const tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: tokenParams.toString(),  // ✅ 参数在请求体中
});
```

**关键修改**:
1. ✅ 移除了URL中的参数（不再使用`?${tokenParams}`）
2. ✅ 添加了`body: tokenParams.toString()`
3. ✅ 保持POST方法
4. ✅ 保持Content-Type为`application/x-www-form-urlencoded`
5. ✅ 添加了请求参数的日志记录

---

## OAuth 2.0标准说明

### Token Endpoint请求格式

根据[RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749#section-4.1.3)标准：

**正确的请求格式**:
```http
POST /oauth2.0/accessToken HTTP/1.1
Host: cas.wzbc.edu.cn
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTHORIZATION_CODE&
redirect_uri=https://aigctmp.wzbc.edu.cn/auth/callback&
client_id=CLIENT_ID&
client_secret=CLIENT_SECRET
```

**关键点**:
- ✅ 必须使用POST方法
- ✅ Content-Type必须是`application/x-www-form-urlencoded`
- ✅ 参数必须在请求体中（不是URL参数）
- ✅ 参数格式：`key1=value1&key2=value2`

### 常见错误

| 错误方式 | 问题 | 结果 |
|---------|------|------|
| GET + URL参数 | HTTP方法错误 | `invalid_request` |
| POST + URL参数 + 空body | 参数位置错误 | `invalid_request` |
| POST + body参数 + 错误Content-Type | Content-Type错误 | `invalid_request` |
| POST + body参数 + 正确Content-Type | ✅ 正确 | 成功 |

---

## 重新部署步骤

### 1. 重新部署Edge Function

```bash
cd ~/projects/app-7z58i603if41

# 使用自动化脚本
./redeploy-edge-function.sh

# 或手动部署
supabase functions deploy oauth-callback
```

### 2. 验证部署

```bash
# 查看函数列表（版本号应该增加）
supabase functions list

# 查看最新日志
supabase functions logs oauth-callback --limit 10
```

### 3. 测试Edge Function

```bash
# 运行测试脚本
./check-supabase.sh
```

**预期结果**:
- ❌ 之前：HTTP 500 + `error=invalid_request`
- ✅ 现在：HTTP 400 + `error=invalid_grant`（因为test code无效，这是正常的）

### 4. 测试真实登录

1. 访问 https://aigctmp.wzbc.edu.cn
2. 按F12打开开发者工具
3. 点击"登录"
4. 输入学号和密码
5. 查看控制台和Edge Function日志

**预期日志**:
```
收到授权码，开始换取access_token...
Token URL: https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
Client ID: CijBwB5EwTTXouO7
Redirect URI: https://aigctmp.wzbc.edu.cn/auth/callback
请求参数: grant_type=authorization_code&code=...&redirect_uri=...
Token响应: { access_token: "...", ... }
成功获取access_token，开始获取用户信息...
```

---

## 调试技巧

### 查看Edge Function实时日志

```bash
# 在一个终端窗口运行
supabase functions logs oauth-callback --follow
```

然后在浏览器中测试登录，可以实时看到：
- 接收到的授权码
- 发送的请求参数
- Token响应
- 用户信息
- 任何错误信息

### 查看浏览器网络请求

1. 按F12打开开发者工具
2. 切换到**Network**标签
3. 点击登录
4. 找到`oauth-callback`请求
5. 查看：
   - Request Headers
   - Request Payload
   - Response Headers
   - Response Body

### 手动测试OAuth流程

```bash
# 1. 获取授权码（在浏览器中访问）
https://cas.wzbc.edu.cn/cas/oauth2.0/authorize?response_type=code&client_id=CijBwB5EwTTXouO7&redirect_uri=https://aigctmp.wzbc.edu.cn/auth/callback

# 2. 登录后会跳转到回调地址，URL中包含code参数
https://aigctmp.wzbc.edu.cn/auth/callback?code=ST-xxxxx

# 3. 复制code值，手动测试Edge Function
curl -X POST https://backend.appmiaoda.com/projects/supabase254442544895672320/functions/v1/oauth-callback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"code":"ST-xxxxx","state":""}'
```

---

## 验证清单

重新部署后，请确认：

- [ ] Edge Function已重新部署（版本号增加）
- [ ] 测试脚本不再返回`invalid_request`错误
- [ ] 测试脚本返回`invalid_grant`（test code无效，正常）
- [ ] 可以访问网站
- [ ] 点击登录能跳转到CAS
- [ ] 输入账号密码后能返回网站
- [ ] 浏览器控制台无500错误
- [ ] Edge Function日志显示"请求参数: grant_type=..."
- [ ] Edge Function日志显示"Token响应: ..."
- [ ] 登录成功，Header显示用户信息

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `supabase/functions/oauth-callback/index.ts` | Edge Function源代码（已修改） |
| `redeploy-edge-function.sh` | 重新部署脚本 |
| `check-supabase.sh` | 测试脚本 |
| `解决500错误.md` | 500错误解决指南 |
| `修复401错误指南.md` | 401错误解决指南 |

---

## 技术参考

- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [CAS OAuth 2.0 Protocol](https://apereo.github.io/cas/6.6.x/protocol/OAuth-Protocol.html)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**文档版本**: 1.0  
**最后更新**: 2025-12-06  
**修改文件**: `supabase/functions/oauth-callback/index.ts` (第66-90行)  
**关键修改**: 将OAuth参数从URL移到请求体中
