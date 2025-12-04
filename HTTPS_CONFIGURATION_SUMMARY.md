# 🔒 HTTPS配置总结 - aigc.wzbc.edu.cn

## ✅ 已完成的配置更新

**更新日期**: 2025-12-03  
**生产域名**: https://aigc.wzbc.edu.cn  
**协议**: HTTPS (SSL/TLS)

---

## 📝 配置文件更新清单

### 1. OAuth配置

**文件**: `src/config/oauth.ts`

```typescript
// 回调URL自动适配HTTPS
redirectUri: `${window.location.origin}/auth/callback`
// 生产环境将自动使用: https://aigc.wzbc.edu.cn/auth/callback
```

✅ 已配置为自动检测协议和域名

---

### 2. 环境变量示例

**文件**: `.env.example`

```bash
OAUTH_REDIRECT_URI=https://aigc.wzbc.edu.cn/auth/callback
```

✅ 已更新为生产HTTPS地址

---

### 3. 文档更新

已更新所有文档中的URL示例：

| 文档 | 更新内容 |
|------|---------|
| WZBC_CAS_SETUP.md | CAS回调URL示例 |
| START_HERE.md | 快速部署指南 |
| DEPLOYMENT_CHECKLIST.md | 部署检查清单 |
| CONFIGURATION_CHECKLIST.md | 配置检查清单 |
| OAUTH_SETUP.md | OAuth配置说明 |
| QUICK_START.md | 快速开始指南 |
| FINAL_SUMMARY.md | 最终总结 |
| IMPLEMENTATION_SUMMARY.md | 实施总结 |
| 其他所有.md文件 | URL示例 |

✅ 共更新21处URL为 `https://aigc.wzbc.edu.cn`

---

### 4. Apache配置文件

**文件**: `apache-config-example.conf`

包含完整的Apache HTTPS配置：

- ✅ SSL证书配置
- ✅ 安全协议配置（TLS 1.2+）
- ✅ HTTP到HTTPS重定向
- ✅ SPA路由支持
- ✅ 安全响应头
- ✅ Gzip压缩
- ✅ 浏览器缓存
- ✅ HTTP/2支持

---

### 5. .htaccess文件

**文件**: `public/.htaccess`

包含SPA路由和安全配置：

- ✅ URL重写规则
- ✅ 安全响应头
- ✅ Gzip压缩
- ✅ 浏览器缓存
- ✅ 敏感文件保护

---

### 6. 部署脚本

**文件**: `deploy.sh`

自动化部署脚本：

- ✅ 依赖安装
- ✅ 代码检查
- ✅ 生产构建
- ✅ 部署提示
- ✅ 检查清单

---

## 🔐 CAS系统配置

### 需要在CAS系统注册的回调URL

**开发环境**:
```
http://localhost:5173/auth/callback
```

**生产环境**:
```
https://aigc.wzbc.edu.cn/auth/callback
```

⚠️ **重要**: 必须使用HTTPS协议

---

## 🌐 Supabase环境变量配置

在Supabase Dashboard中配置：

```bash
OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile
OAUTH_CLIENT_ID=CijBwB5EwTTXouO7
OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6
OAUTH_REDIRECT_URI=https://aigc.wzbc.edu.cn/auth/callback
```

⚠️ **重要**: `OAUTH_REDIRECT_URI` 必须使用HTTPS

---

## 🚀 部署流程

### 步骤1: 准备SSL证书

Apache证书文件：
- `aigc.wzbc.edu.cn.crt` - 域名证书
- `aigc.wzbc.edu.cn.key` - 私钥
- `ca_bundle.crt` - CA证书链

### 步骤2: 配置Apache

1. 复制 `apache-config-example.conf` 内容
2. 修改证书文件路径
3. 保存到Apache配置目录
4. 启用必要的模块：
   ```bash
   sudo a2enmod ssl
   sudo a2enmod rewrite
   sudo a2enmod headers
   sudo a2enmod deflate
   sudo a2enmod expires
   ```

### 步骤3: 构建应用

```bash
# 运行部署脚本
./deploy.sh

# 或手动构建
npm install
npm run build
```

### 步骤4: 上传文件

```bash
# 使用scp
scp -r dist/* user@server:/var/www/html/

# 或使用rsync
rsync -avz --delete dist/ user@server:/var/www/html/
```

### 步骤5: 设置权限

```bash
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;
```

### 步骤6: 重启Apache

```bash
# 测试配置
sudo apache2ctl configtest

# 重启服务
sudo systemctl restart apache2
```

### 步骤7: 验证部署

- [ ] 访问 https://aigc.wzbc.edu.cn
- [ ] 检查SSL证书有效
- [ ] 测试HTTP重定向
- [ ] 测试OAuth登录
- [ ] 验证所有功能

---

## 🔒 安全配置

### SSL/TLS配置

- ✅ 使用TLS 1.2及以上版本
- ✅ 禁用不安全的加密套件
- ✅ 启用HSTS
- ✅ 配置安全响应头

### 应用安全

- ✅ 所有API请求使用HTTPS
- ✅ OAuth回调使用HTTPS
- ✅ 客户端密钥存储在服务器端
- ✅ CSRF保护（state参数）
- ✅ XSS保护
- ✅ 点击劫持保护

---

## 📊 性能优化

### 已配置的优化

- ✅ Gzip压缩
- ✅ 浏览器缓存
- ✅ HTTP/2支持
- ✅ 静态资源CDN（可选）

### 缓存策略

| 资源类型 | 缓存时间 |
|---------|---------|
| HTML | 不缓存 |
| CSS/JS | 1个月 |
| 图片 | 1年 |
| 字体 | 1年 |

---

## 🐛 常见问题

### 1. SSL证书错误

**问题**: 浏览器显示证书无效

**解决**:
- 检查证书文件路径
- 验证证书有效期
- 确认证书域名匹配

### 2. 混合内容警告

**问题**: 控制台显示Mixed Content

**解决**:
- 确保所有资源使用HTTPS
- 检查外部链接
- 更新CSP策略

### 3. OAuth回调失败

**问题**: CAS登录后无法返回

**解决**:
- 确认CAS系统注册了HTTPS回调URL
- 检查Supabase环境变量
- 验证URL完全一致

### 4. 页面刷新404

**问题**: 刷新页面显示404

**解决**:
- 确认.htaccess文件存在
- 启用mod_rewrite模块
- 检查Apache配置

---

## ✅ 验证清单

### SSL配置

- [ ] SSL证书已安装
- [ ] 证书未过期
- [ ] 证书链完整
- [ ] HTTPS访问正常
- [ ] HTTP自动重定向

### OAuth配置

- [ ] CAS回调URL已注册（HTTPS）
- [ ] Supabase环境变量已配置（HTTPS）
- [ ] OAuth登录流程正常
- [ ] 用户信息同步正确

### 应用功能

- [ ] 首页加载正常
- [ ] 登录功能正常
- [ ] 报名功能正常
- [ ] 作品提交正常
- [ ] 管理后台正常

### 性能和安全

- [ ] SSL Labs评分A级以上
- [ ] 页面加载速度正常
- [ ] 安全响应头配置正确
- [ ] 压缩和缓存生效

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| **HTTPS_DEPLOYMENT.md** | 详细的HTTPS部署指南 |
| **WZBC_CAS_SETUP.md** | CAS系统配置说明 |
| **DEPLOYMENT_CHECKLIST.md** | 完整的部署检查清单 |
| **apache-config-example.conf** | Apache配置示例 |
| **deploy.sh** | 自动化部署脚本 |

---

## 📞 技术支持

### SSL证书问题

联系学校信息中心或证书提供商

### 服务器配置问题

联系服务器管理员或运维团队

### 应用功能问题

查看项目文档或联系开发团队

---

## 🎉 配置完成

所有HTTPS相关配置已完成，系统已准备好部署到生产环境！

**生产地址**: https://aigc.wzbc.edu.cn

---

**文档版本**: 1.0  
**更新日期**: 2025-12-03  
**配置状态**: ✅ 完成  
**待部署**: 是
