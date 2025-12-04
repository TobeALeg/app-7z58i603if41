# 🚀 部署指南 - aigctmp.wzbc.edu.cn

## 📍 快速导航

| 文档 | 用途 | 优先级 |
|------|------|--------|
| **QUICK_REFERENCE.md** | 快速参考卡片 | ⭐⭐⭐ 必读 |
| **HTTPS_DEPLOYMENT.md** | HTTPS详细部署 | ⭐⭐⭐ 必读 |
| **WZBC_CAS_SETUP.md** | CAS系统配置 | ⭐⭐⭐ 必读 |
| **DEPLOYMENT_CHECKLIST.md** | 部署检查清单 | ⭐⭐ 推荐 |

---

## 🎯 部署概览

**生产域名**: https://aigctmp.wzbc.edu.cn  
**协议**: HTTPS (SSL/TLS)  
**认证系统**: 温州商学院CAS OAuth 2.0

---

## ⚡ 快速部署（5步）

### 第1步: 在CAS系统注册回调URL

联系学校信息中心，注册：
```
https://aigctmp.wzbc.edu.cn/auth/callback
```

### 第2步: 配置Supabase环境变量

在Supabase Dashboard添加：
```bash
OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile
OAUTH_CLIENT_ID=CijBwB5EwTTXouO7
OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6
OAUTH_REDIRECT_URI=https://aigctmp.wzbc.edu.cn/auth/callback
```

### 第3步: 配置Apache SSL

参考 `apache-config-example.conf`，配置SSL证书和虚拟主机

### 第4步: 构建和部署

```bash
# 构建
./deploy.sh

# 上传
rsync -avz --delete dist/ user@server:/var/www/html/

# 设置权限
sudo chown -R www-data:www-data /var/www/html
```

### 第5步: 测试验证

- 访问 https://aigctmp.wzbc.edu.cn
- 测试OAuth登录
- 验证所有功能

---

## 📚 详细文档

### 配置文档
- `QUICK_REFERENCE.md` - 快速参考卡片
- `HTTPS_CONFIGURATION_SUMMARY.md` - HTTPS配置总结
- `WZBC_CAS_SETUP.md` - CAS系统配置详解

### 部署文档
- `HTTPS_DEPLOYMENT.md` - HTTPS部署详细指南
- `DEPLOYMENT_CHECKLIST.md` - 部署检查清单
- `apache-config-example.conf` - Apache配置示例

### 工具文件
- `deploy.sh` - 自动化部署脚本
- `public/.htaccess` - SPA路由配置

---

## ✅ 部署检查清单

### 服务器配置
- [ ] SSL证书已安装
- [ ] Apache配置已更新
- [ ] 必要模块已启用
- [ ] HTTP重定向到HTTPS

### CAS系统
- [ ] 回调URL已注册（HTTPS）

### Supabase
- [ ] 环境变量已配置（HTTPS）
- [ ] Edge Function已部署
- [ ] 数据库迁移已应用

### 应用部署
- [ ] 代码已构建
- [ ] 文件已上传
- [ ] 权限已设置
- [ ] Apache已重启

### 功能测试
- [ ] HTTPS访问正常
- [ ] OAuth登录正常
- [ ] 所有功能正常

---

## 🆘 需要帮助？

### 快速问题
→ 查看 `QUICK_REFERENCE.md`

### HTTPS配置
→ 查看 `HTTPS_DEPLOYMENT.md`

### CAS系统
→ 查看 `WZBC_CAS_SETUP.md`

### 完整检查
→ 查看 `DEPLOYMENT_CHECKLIST.md`

---

**🎉 准备就绪，开始部署！**
