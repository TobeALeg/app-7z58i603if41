# 🚀 快速参考卡片

## 📍 生产环境信息

| 项目 | 信息 |
|------|------|
| **生产域名** | https://aigctmp.wzbc.edu.cn |
| **协议** | HTTPS (SSL/TLS) |
| **认证系统** | 温州商学院CAS OAuth 2.0 |
| **部署日期** | 2025-12-03 |

---

## 🔑 关键URL

| 用途 | URL |
|------|-----|
| **生产网站** | https://aigctmp.wzbc.edu.cn |
| **OAuth回调** | https://aigctmp.wzbc.edu.cn/auth/callback |
| **CAS授权** | https://cas.wzbc.edu.cn/cas/oauth2.0/authorize |
| **CAS Token** | https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken |
| **CAS用户信息** | https://cas.wzbc.edu.cn/cas/oauth2.0/profile |

---

## 🔐 Supabase环境变量

```bash
OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile
OAUTH_CLIENT_ID=CijBwB5EwTTXouO7
OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6
OAUTH_REDIRECT_URI=https://aigctmp.wzbc.edu.cn/auth/callback
```

---

## 📦 快速部署

```bash
# 1. 构建
./deploy.sh

# 2. 上传
rsync -avz --delete dist/ user@server:/var/www/html/

# 3. 设置权限
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;

# 4. 重启Apache
sudo systemctl restart apache2
```

---

## 🔧 Apache模块

```bash
# 启用必要模块
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
sudo a2enmod expires

# 重启Apache
sudo systemctl restart apache2
```

---

## 📚 文档导航

| 文档 | 用途 |
|------|------|
| **START_HERE.md** | 👈 从这里开始 |
| **HTTPS_DEPLOYMENT.md** | HTTPS部署详细指南 |
| **HTTPS_CONFIGURATION_SUMMARY.md** | HTTPS配置总结 |
| **WZBC_CAS_SETUP.md** | CAS系统配置 |
| **DEPLOYMENT_CHECKLIST.md** | 部署检查清单 |
| **apache-config-example.conf** | Apache配置示例 |
| **deploy.sh** | 部署脚本 |

---

## ✅ 部署检查清单

### 服务器配置
- [ ] SSL证书已安装
- [ ] Apache配置已更新
- [ ] 必要模块已启用
- [ ] HTTP重定向到HTTPS

### CAS系统
- [ ] 回调URL已注册（HTTPS）
- [ ] 客户端凭证已确认

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
- [ ] 用户信息同步正常
- [ ] 所有功能正常

---

## 🐛 快速故障排查

### SSL证书错误
```bash
# 检查证书
openssl x509 -in /path/to/cert.crt -text -noout

# 检查私钥
openssl rsa -in /path/to/cert.key -check
```

### Apache配置测试
```bash
# 测试配置
sudo apache2ctl configtest

# 查看错误日志
sudo tail -f /var/log/apache2/error.log
```

### OAuth调试
```bash
# 查看Edge Function日志
# 在Supabase Dashboard → Edge Functions → Logs

# 查看浏览器控制台
# F12 → Console → 查看OAuth配置状态
```

---

## 📞 联系方式

| 问题类型 | 联系方式 |
|---------|---------|
| **SSL证书** | 学校信息中心 |
| **CAS系统** | 学校信息中心 |
| **服务器** | 运维团队 |
| **应用功能** | 开发团队 |

---

## 🎯 下一步

1. **在CAS系统注册回调URL**
   - 联系学校信息中心
   - 提供: https://aigctmp.wzbc.edu.cn/auth/callback

2. **配置Supabase环境变量**
   - 登录Supabase Dashboard
   - 添加上述环境变量

3. **部署Edge Function**
   ```bash
   supabase functions deploy oauth-callback
   ```

4. **部署前端应用**
   ```bash
   ./deploy.sh
   ```

5. **测试完整流程**
   - 访问 https://aigctmp.wzbc.edu.cn
   - 测试OAuth登录
   - 验证所有功能

---

**🎉 准备就绪，开始部署！**
