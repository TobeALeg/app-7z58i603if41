# OAuth登录修复指南

## 🚨 快速开始

如果您遇到登录500错误，请立即执行：

```bash
cd ~/projects/app-7z58i603if41
./redeploy-edge-function.sh
```

然后测试登录功能！

---

## 📖 问题说明

### 症状
- ❌ 登录时返回500错误
- ❌ Edge Function调用失败
- ❌ CAS服务器返回：`error=invalid_request`

### 根本原因
之前的OAuth实现不符合**CAS OAuth 2.0官方文档**的要求。

### 解决方案
根据CAS官方文档重新实现，使用GET请求，参数在URL中。

---

## 📚 文档导航

### 🎯 立即执行
**文件**：[立即执行.md](./立即执行.md)  
**用途**：完整的执行步骤、日志查看、测试方法

### 📋 最终修复总结
**文件**：[最终修复总结.md](./最终修复总结.md)  
**用途**：问题回顾、解决方案、成功标志、故障排查

### 📖 CAS官方文档修复方案
**文件**：[CAS官方文档修复方案.md](./CAS官方文档修复方案.md)  
**用途**：基于CAS官方文档的详细说明、参数说明、错误处理

### ⚡ 快速修复指南
**文件**：[快速修复指南.md](./快速修复指南.md)  
**用途**：快速参考、技术细节、修改对比

### 📝 OAuth请求修复记录
**文件**：[OAuth请求修复记录.md](./OAuth请求修复记录.md)  
**用途**：5次尝试的完整历史、每次修改的详细说明

### 🔧 其他文档
- [修复401错误指南.md](./修复401错误指南.md) - 401错误解决方案
- [解决500错误.md](./解决500错误.md) - 500错误解决方案

---

## 🛠️ 工具脚本

### 1. 重新部署脚本
```bash
./redeploy-edge-function.sh
```
**功能**：重新部署Edge Function，应用最新代码

### 2. 诊断脚本
```bash
./check-supabase.sh
```
**功能**：检查Supabase配置、Edge Function状态、测试可访问性

### 3. 401错误修复脚本
```bash
./fix-401.sh
```
**功能**：自动修复401错误（安装CLI、登录、部署）

---

## 🎯 执行流程

### 第1步：重新部署
```bash
cd ~/projects/app-7z58i603if41
./redeploy-edge-function.sh
```

### 第2步：查看日志
```bash
supabase functions logs oauth-callback --follow
```

**预期看到**：
```
方式1: GET请求（CAS标准方式）
完整URL: https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken?grant_type=...
Token响应: { access_token: "AT-1-...", ... }
成功获取access_token
```

### 第3步：测试登录
1. 访问 https://aigctmp.wzbc.edu.cn
2. 点击"登录"
3. 输入学号和密码
4. 应该能成功登录

---

## ✅ 成功标志

### Edge Function日志
```
✅ 方式1: GET请求（CAS标准方式）
✅ Token响应: { access_token: "AT-1-...", ... }
✅ 成功获取access_token
```

### 浏览器控制台
```
✅ Edge Function响应: { data: { success: true, ... }, error: null }
✅ 登录成功！正在跳转...
```

### 网站Header
```
✅ 显示用户信息（学号、姓名等）
✅ 显示"退出"按钮
```

---

## 🔍 故障排查

### 仍然返回500错误

1. **检查环境变量**
   ```bash
   supabase secrets list
   ```
   确保5个OAuth环境变量都已配置

2. **查看完整日志**
   ```bash
   supabase functions logs oauth-callback --limit 100
   ```

3. **检查回调地址**
   确认CAS管理后台配置：`https://aigctmp.wzbc.edu.cn/auth/callback`

### 返回401错误

执行：
```bash
./fix-401.sh
```

### 返回400错误（invalid_grant）

这是正常的！说明：
- ✅ Edge Function工作正常
- ✅ OAuth请求格式正确
- ❌ 授权码无效或已过期

**解决方案**：重新登录获取新的授权码

---

## 📊 技术细节

### 修改的核心文件
- `supabase/functions/oauth-callback/index.ts`

### 关键改进
1. ✅ 优先使用GET请求（符合CAS官方文档）
2. ✅ 参数在URL中（符合CAS要求）
3. ✅ 智能重试机制（自动尝试三种方式）
4. ✅ 详细的日志记录（便于调试）

### CAS官方要求
```http
GET /cas/oauth2.0/accessToken?grant_type=authorization_code&client_id=...&client_secret=...&redirect_uri=...&code=... HTTP/1.1
```

---

## 📞 需要帮助？

### 查看文档
- 详细说明：[最终修复总结.md](./最终修复总结.md)
- 执行步骤：[立即执行.md](./立即执行.md)
- CAS文档：[CAS官方文档修复方案.md](./CAS官方文档修复方案.md)

### 运行诊断
```bash
./check-supabase.sh
```

### 查看日志
```bash
supabase functions logs oauth-callback --follow
```

---

## 🎉 修复完成后

### 验证清单
- [ ] Edge Function已重新部署
- [ ] 日志显示"方式1: GET请求（CAS标准方式）"
- [ ] 测试脚本不再返回`invalid_request`
- [ ] 可以成功登录
- [ ] Header显示用户信息
- [ ] 可以正常使用网站功能

### 清理（可选）
如果一切正常，可以删除诊断脚本：
```bash
rm check-supabase.sh fix-401.sh
```

但建议保留 `redeploy-edge-function.sh` 以备将来使用。

---

**准备好了吗？立即开始！** 🚀

```bash
cd ~/projects/app-7z58i603if41
./redeploy-edge-function.sh
```

---

**文档版本**: 1.0  
**最后更新**: 2025-12-06  
**状态**: ✅ 准备就绪
