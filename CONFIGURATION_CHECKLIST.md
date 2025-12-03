# 🎯 OAuth 2.0 SSO 配置检查清单

## 📋 配置前准备

### 1. 联系学校信息中心

- [ ] 获取OAuth授权端点URL
- [ ] 获取OAuth Token端点URL
- [ ] 获取OAuth用户信息端点URL
- [ ] 获取客户端ID (Client ID)
- [ ] 获取客户端密钥 (Client Secret)
- [ ] 确认OAuth Scope要求
- [ ] 确认用户信息返回字段格式

### 2. 测试OAuth接口

- [ ] 使用Postman或curl测试授权流程
- [ ] 查看用户信息返回的JSON格式
- [ ] 记录所有字段名称

## 🔧 系统配置

### 步骤1: 修改OAuth配置文件

文件: `src/config/oauth.ts`

- [ ] 填写 `authorizationUrl`
- [ ] 填写 `tokenUrl`
- [ ] 填写 `userInfoUrl`
- [ ] 填写 `clientId`
- [ ] 填写 `clientSecret` (临时，后续移到环境变量)
- [ ] 调整 `scope`
- [ ] 调整 `userInfoMapping` 字段映射

### 步骤2: 配置Supabase环境变量

在Supabase项目设置中添加：

- [ ] `OAUTH_TOKEN_URL`
- [ ] `OAUTH_USERINFO_URL`
- [ ] `OAUTH_CLIENT_ID`
- [ ] `OAUTH_CLIENT_SECRET`
- [ ] `OAUTH_REDIRECT_URI`

### 步骤3: 注册回调URL

在学校OAuth管理后台：

- [ ] 注册开发环境回调URL: `http://localhost:5173/auth/callback`
- [ ] 注册生产环境回调URL: `https://your-domain.com/auth/callback`

### 步骤4: 部署Edge Function

- [ ] 确认Edge Function代码正确
- [ ] 部署 `oauth-callback` 函数
- [ ] 验证环境变量已加载

## 🧪 功能测试

### 基础测试

- [ ] 访问登录页面
- [ ] 点击"通过学校统一身份认证登录"按钮
- [ ] 成功跳转到学校OAuth页面
- [ ] 在学校系统完成登录
- [ ] 成功返回应用
- [ ] 用户信息正确显示

### 用户信息验证

- [ ] 真实姓名显示正确
- [ ] 学号显示正确
- [ ] 用户名显示正确
- [ ] 邮箱信息正确（如果有）

### 业务功能测试

- [ ] 可以正常访问报名页面
- [ ] 可以提交报名信息
- [ ] 可以上传作品
- [ ] 可以查看我的报名
- [ ] 管理员可以访问管理后台

### 权限测试

- [ ] 首次登录的用户角色为普通用户
- [ ] 管理员可以修改用户角色
- [ ] 权限控制正常工作

## 🔒 安全检查

### 代码安全

- [ ] 前端代码中没有硬编码客户端密钥
- [ ] 敏感配置已移到Supabase环境变量
- [ ] 没有在Git中提交敏感信息

### 网络安全

- [ ] 生产环境使用HTTPS
- [ ] 回调URL使用HTTPS
- [ ] State参数验证正常

### 数据安全

- [ ] 用户数据正确存储
- [ ] OAuth ID唯一性约束生效
- [ ] 数据库权限配置正确

## 📊 性能检查

- [ ] 登录流程响应时间正常
- [ ] 数据库查询性能良好
- [ ] 页面加载速度正常

## 🐛 错误处理

### 测试错误场景

- [ ] 取消授权时的处理
- [ ] 网络错误时的提示
- [ ] 配置错误时的提示
- [ ] 回调参数错误时的处理

### 用户体验

- [ ] 错误信息清晰易懂
- [ ] 有返回登录的选项
- [ ] 加载状态显示正常

## 📱 兼容性测试

### 浏览器测试

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 设备测试

- [ ] 桌面端
- [ ] 平板
- [ ] 手机

## 📝 文档检查

- [ ] README.md 已更新
- [ ] OAUTH_SETUP.md 可访问
- [ ] QUICK_START.md 可访问
- [ ] 配置说明清晰

## 🚀 上线准备

### 生产环境配置

- [ ] 生产环境OAuth配置已完成
- [ ] 生产环境回调URL已注册
- [ ] Supabase环境变量已配置
- [ ] Edge Function已部署

### 监控和日志

- [ ] 配置错误监控
- [ ] 查看Supabase日志
- [ ] 查看Edge Function日志

### 备份和回滚

- [ ] 数据库已备份
- [ ] 有回滚方案
- [ ] 团队成员已培训

## ✅ 最终确认

- [ ] 所有配置项已完成
- [ ] 所有测试已通过
- [ ] 文档已更新
- [ ] 团队已知晓变更
- [ ] 用户已通知（如需要）

---

## 📞 遇到问题？

### 配置问题
查看 `QUICK_START.md` 和 `OAUTH_SETUP.md`

### 技术问题
查看 `OAUTH_MIGRATION_SUMMARY.md`

### 调试技巧
1. 打开浏览器控制台查看OAuth配置状态
2. 查看Supabase日志
3. 查看Edge Function日志
4. 使用Postman测试OAuth接口

---

**完成所有检查项后，系统即可正式使用！** ✨
