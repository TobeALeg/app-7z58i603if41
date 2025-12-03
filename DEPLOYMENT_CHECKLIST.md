# 🚀 温州商学院CAS认证系统 - 部署清单

## ✅ 已完成的配置

### 代码配置

- [x] OAuth 2.0 授权端点配置 (`src/config/oauth.ts`)
- [x] Token端点配置
- [x] 用户信息端点配置
- [x] 客户端ID和Secret配置
- [x] 用户信息字段映射
- [x] Edge Function OAuth处理逻辑
- [x] 前端登录流程
- [x] 回调页面处理
- [x] 用户信息提取逻辑
- [x] CSRF防护（state参数）
- [x] Token过期检查

### 数据库配置

- [x] profiles表OAuth字段
- [x] 数据库触发器
- [x] 索引优化
- [x] 类型定义更新

### 文档

- [x] 温州商学院CAS专用配置指南
- [x] OAuth通用配置文档
- [x] 快速开始指南
- [x] 配置检查清单
- [x] 项目结构说明

## 🔧 待完成的部署步骤

### 步骤1: 在CAS系统注册回调URL

**负责人**: 联系学校信息中心

**需要注册的URL**:

开发环境:
```
http://localhost:5173/auth/callback
```

生产环境:
```
https://your-domain.com/auth/callback
```

**验证方法**:
- [ ] 已联系学校信息中心
- [ ] 已提供回调URL
- [ ] 已确认注册成功

---

### 步骤2: 配置Supabase环境变量

**位置**: Supabase Dashboard → Project Settings → Edge Functions → Environment Variables

**需要添加的变量**:

```bash
OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile
OAUTH_CLIENT_ID=CijBwB5EwTTXouO7
OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6
OAUTH_REDIRECT_URI=https://your-domain.com/auth/callback
```

**注意事项**:
- 生产环境的`OAUTH_REDIRECT_URI`需要替换为实际域名
- 客户端密钥不要暴露在前端代码中

**验证方法**:
- [ ] 已添加所有环境变量
- [ ] 已验证变量值正确
- [ ] 已保存配置

---

### 步骤3: 部署Edge Function

**方法1: 使用Supabase CLI**

```bash
# 登录Supabase
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 部署Edge Function
supabase functions deploy oauth-callback
```

**方法2: 使用Supabase Dashboard**

1. 进入Supabase Dashboard
2. 选择 Edge Functions
3. 创建新函数或更新现有函数
4. 复制 `supabase/functions/oauth-callback/index.ts` 的内容
5. 部署函数

**验证方法**:
- [ ] Edge Function已部署
- [ ] 函数状态显示为Active
- [ ] 环境变量已加载
- [ ] 测试调用成功

---

### 步骤4: 应用数据库迁移

**执行迁移**:

```bash
# 使用Supabase CLI
supabase db push

# 或在Supabase Dashboard中执行SQL
```

**迁移文件**:
- `supabase/migrations/00001_initial_schema.sql`
- `supabase/migrations/00002_update_schema_for_oauth_sso.sql`

**验证方法**:
- [ ] 数据库表结构已更新
- [ ] profiles表包含OAuth字段
- [ ] 触发器正常工作
- [ ] 索引已创建

---

### 步骤5: 测试登录流程

**测试步骤**:

1. **访问登录页面**
   - [ ] 页面正常加载
   - [ ] 显示"通过学校统一身份认证登录"按钮

2. **点击登录按钮**
   - [ ] 正确跳转到CAS系统
   - [ ] URL包含正确的参数（client_id, redirect_uri, state）

3. **在CAS系统登录**
   - [ ] 输入学号和密码
   - [ ] 认证成功

4. **回调处理**
   - [ ] 成功返回应用
   - [ ] Edge Function正确处理授权码
   - [ ] 获取到access_token
   - [ ] 获取到用户信息

5. **用户信息显示**
   - [ ] 真实姓名显示正确
   - [ ] 学号显示正确
   - [ ] 用户名显示正确

6. **业务功能测试**
   - [ ] 可以访问报名页面
   - [ ] 可以提交报名
   - [ ] 可以上传作品
   - [ ] 可以查看我的报名

---

### 步骤6: 安全检查

**代码安全**:
- [ ] 前端代码中没有硬编码客户端密钥
- [ ] 敏感配置已移到Supabase环境变量
- [ ] 没有在Git中提交敏感信息

**网络安全**:
- [ ] 生产环境使用HTTPS
- [ ] 回调URL使用HTTPS
- [ ] State参数验证正常

**数据安全**:
- [ ] 用户数据正确存储
- [ ] OAuth ID唯一性约束生效
- [ ] 数据库权限配置正确

---

### 步骤7: 性能优化

**检查项**:
- [ ] 登录流程响应时间 < 3秒
- [ ] 数据库查询性能良好
- [ ] 页面加载速度正常
- [ ] 图片资源已优化

---

### 步骤8: 监控和日志

**配置监控**:
- [ ] Supabase日志监控已启用
- [ ] Edge Function日志可查看
- [ ] 错误告警已配置

**日志检查**:
- [ ] 查看Edge Function日志
- [ ] 查看数据库日志
- [ ] 查看浏览器控制台

---

## 📊 部署验证

### 功能验证清单

| 功能 | 状态 | 备注 |
|------|------|------|
| 登录按钮跳转 | ⬜ | |
| CAS系统认证 | ⬜ | |
| 回调处理 | ⬜ | |
| 用户信息同步 | ⬜ | |
| 首次登录创建用户 | ⬜ | |
| 后续登录直接进入 | ⬜ | |
| 报名功能 | ⬜ | |
| 作品提交 | ⬜ | |
| 管理后台 | ⬜ | |
| 退出登录 | ⬜ | |

### 浏览器兼容性

| 浏览器 | 版本 | 状态 | 备注 |
|--------|------|------|------|
| Chrome | 最新版 | ⬜ | |
| Firefox | 最新版 | ⬜ | |
| Safari | 最新版 | ⬜ | |
| Edge | 最新版 | ⬜ | |

### 设备测试

| 设备类型 | 状态 | 备注 |
|---------|------|------|
| 桌面端 | ⬜ | |
| 平板 | ⬜ | |
| 手机 | ⬜ | |

---

## 🐛 常见问题排查

### 问题1: 登录按钮点击无反应

**可能原因**:
- OAuth配置未正确加载
- 浏览器控制台有JavaScript错误

**排查步骤**:
1. 打开浏览器控制台
2. 查看OAuth配置状态
3. 检查是否有错误信息

### 问题2: 跳转到CAS后无法返回

**可能原因**:
- 回调URL未在CAS系统注册
- 回调URL配置错误

**排查步骤**:
1. 确认回调URL已注册
2. 检查URL是否完全匹配
3. 查看CAS系统错误信息

### 问题3: 获取用户信息失败

**可能原因**:
- Access Token无效
- Edge Function配置错误
- 网络连接问题

**排查步骤**:
1. 查看Edge Function日志
2. 检查环境变量配置
3. 测试CAS接口连通性

### 问题4: 用户信息显示不正确

**可能原因**:
- 字段映射配置错误
- CAS返回的字段结构变化

**排查步骤**:
1. 查看Edge Function日志中的用户信息
2. 对比字段映射配置
3. 调整`src/config/oauth.ts`中的映射

---

## 📞 技术支持

### 学校信息中心

**联系方式**: （请填写）

**负责内容**:
- CAS系统配置
- 回调URL注册
- 应用凭证管理
- 接口问题排查

### 开发团队

**文档资源**:
- `WZBC_CAS_SETUP.md` - CAS系统配置指南
- `OAUTH_SETUP.md` - OAuth技术文档
- `CONFIGURATION_CHECKLIST.md` - 配置检查清单

**调试工具**:
- 浏览器控制台
- Supabase Dashboard日志
- Edge Function日志

---

## ✅ 部署完成确认

当所有步骤完成后，请确认：

- [ ] 所有配置步骤已完成
- [ ] 所有测试已通过
- [ ] 文档已更新
- [ ] 团队成员已培训
- [ ] 监控已启用
- [ ] 备份已完成

**部署负责人签字**: _______________

**部署日期**: _______________

**验收人签字**: _______________

**验收日期**: _______________

---

## 🎉 恭喜！

完成所有步骤后，您的智能体比赛报名平台已成功接入温州商学院CAS认证系统！

用户现在可以使用学号和密码直接登录，享受便捷的报名服务。

---

**文档版本**: 1.0  
**更新日期**: 2025-12-03  
**系统**: 智能体比赛报名平台  
**认证系统**: 温州商学院CAS OAuth 2.0
