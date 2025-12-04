# 🔒 HTTPS部署指南 - aigctmp.wzbc.edu.cn

## 📋 生产环境信息

**生产域名**: https://aigctmp.wzbc.edu.cn  
**协议**: HTTPS (SSL/TLS)  
**证书类型**: Apache证书  
**部署日期**: 2025-12-03

---

## ✅ 已完成的HTTPS配置

### 1. OAuth回调URL配置

所有OAuth相关配置已更新为HTTPS：

```
开发环境: http://localhost:5173/auth/callback
生产环境: https://aigctmp.wzbc.edu.cn/auth/callback
```

### 2. 环境变量配置

`.env.example` 已更新为生产域名：

```bash
OAUTH_REDIRECT_URI=https://aigctmp.wzbc.edu.cn/auth/callback
```

### 3. 文档更新

所有文档中的示例URL已更新为 `https://aigctmp.wzbc.edu.cn`

---

## 🚀 部署步骤

### 步骤1: 在CAS系统注册HTTPS回调URL

**重要**: 必须在温州商学院CAS系统中注册HTTPS回调URL

联系学校信息中心，注册：

```
https://aigctmp.wzbc.edu.cn/auth/callback
```

**验证方法**:
- [ ] 已联系学校信息中心
- [ ] 已提供HTTPS回调URL
- [ ] 已确认注册成功

---

### 步骤2: 配置Supabase环境变量

在Supabase Dashboard中配置生产环境变量：

**位置**: Supabase Dashboard → Project Settings → Edge Functions → Environment Variables

**配置内容**:

```bash
OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken
OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile
OAUTH_CLIENT_ID=CijBwB5EwTTXouO7
OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6
OAUTH_REDIRECT_URI=https://aigctmp.wzbc.edu.cn/auth/callback
```

**注意事项**:
- ✅ 所有URL必须使用HTTPS
- ✅ 回调URL必须与CAS系统注册的完全一致
- ✅ 客户端密钥不要暴露在前端代码中

---

### 步骤3: 配置Apache SSL证书

#### 3.1 证书文件准备

Apache SSL证书通常包含以下文件：

```
your_domain.crt      # 域名证书文件
your_domain.key      # 私钥文件
ca_bundle.crt        # CA证书链（可选）
```

#### 3.2 Apache配置示例

在Apache配置文件中添加SSL配置：

```apache
<VirtualHost *:443>
    ServerName aigctmp.wzbc.edu.cn
    DocumentRoot /var/www/html
    
    # SSL配置
    SSLEngine on
    SSLCertificateFile /path/to/your_domain.crt
    SSLCertificateKeyFile /path/to/your_domain.key
    SSLCertificateChainFile /path/to/ca_bundle.crt
    
    # 安全配置
    SSLProtocol all -SSLv2 -SSLv3
    SSLCipherSuite HIGH:!aNULL:!MD5
    SSLHonorCipherOrder on
    
    # 静态文件配置
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # SPA路由支持
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
</VirtualHost>

# HTTP到HTTPS重定向
<VirtualHost *:80>
    ServerName aigctmp.wzbc.edu.cn
    Redirect permanent / https://aigctmp.wzbc.edu.cn/
</VirtualHost>
```

#### 3.3 启用必要的Apache模块

```bash
# 启用SSL模块
sudo a2enmod ssl

# 启用重写模块（用于SPA路由）
sudo a2enmod rewrite

# 启用headers模块（用于安全头）
sudo a2enmod headers

# 重启Apache
sudo systemctl restart apache2
```

---

### 步骤4: 部署前端应用

#### 4.1 构建生产版本

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

#### 4.2 上传到服务器

将 `dist/` 目录中的所有文件上传到服务器的 `/var/www/html` 目录：

```bash
# 使用scp上传
scp -r dist/* user@server:/var/www/html/

# 或使用rsync
rsync -avz dist/ user@server:/var/www/html/
```

#### 4.3 设置文件权限

```bash
# 设置正确的所有者
sudo chown -R www-data:www-data /var/www/html

# 设置正确的权限
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;
```

---

### 步骤5: 配置安全头

在Apache配置中添加安全响应头：

```apache
<IfModule mod_headers.c>
    # HTTPS强制
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # XSS保护
    Header always set X-XSS-Protection "1; mode=block"
    
    # 防止点击劫持
    Header always set X-Frame-Options "SAMEORIGIN"
    
    # 内容类型嗅探保护
    Header always set X-Content-Type-Options "nosniff"
    
    # Referrer策略
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # 内容安全策略（根据实际需求调整）
    Header always set Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;"
</IfModule>
```

---

### 步骤6: 验证HTTPS配置

#### 6.1 SSL证书验证

访问以下网站检查SSL证书：

```
https://www.ssllabs.com/ssltest/analyze.html?d=aigctmp.wzbc.edu.cn
```

**期望结果**: A级或以上评分

#### 6.2 功能测试

- [ ] 访问 https://aigctmp.wzbc.edu.cn 正常加载
- [ ] 浏览器地址栏显示锁图标
- [ ] 点击登录按钮正常跳转到CAS系统
- [ ] CAS登录后正常回调
- [ ] 用户信息正确显示
- [ ] 所有功能正常工作

#### 6.3 HTTP重定向测试

- [ ] 访问 http://aigctmp.wzbc.edu.cn 自动重定向到HTTPS
- [ ] 重定向后功能正常

---

## 🔒 安全检查清单

### SSL/TLS配置

- [ ] SSL证书已正确安装
- [ ] 证书未过期
- [ ] 证书链完整
- [ ] 使用TLS 1.2或更高版本
- [ ] 禁用不安全的加密套件
- [ ] 启用HSTS

### OAuth安全

- [ ] 回调URL使用HTTPS
- [ ] State参数验证正常
- [ ] 客户端密钥存储在服务器端
- [ ] Token传输加密

### 应用安全

- [ ] 所有API请求使用HTTPS
- [ ] 安全响应头已配置
- [ ] XSS保护已启用
- [ ] CSRF保护已启用
- [ ] 内容安全策略已配置

---

## 🐛 常见问题排查

### 问题1: SSL证书错误

**症状**: 浏览器显示"您的连接不是私密连接"

**可能原因**:
- 证书未正确安装
- 证书已过期
- 证书与域名不匹配

**解决方法**:
1. 检查证书文件路径
2. 验证证书有效期
3. 确认证书域名与访问域名一致

### 问题2: 混合内容警告

**症状**: 浏览器控制台显示"Mixed Content"警告

**可能原因**:
- 页面中包含HTTP资源

**解决方法**:
1. 检查所有资源URL
2. 确保所有资源使用HTTPS
3. 更新CSP策略

### 问题3: OAuth回调失败

**症状**: CAS登录后无法返回应用

**可能原因**:
- 回调URL未在CAS系统注册
- 回调URL协议不匹配（HTTP vs HTTPS）

**解决方法**:
1. 确认CAS系统中注册的是HTTPS回调URL
2. 检查Supabase环境变量中的回调URL
3. 验证URL完全一致（包括协议、域名、路径）

### 问题4: 页面刷新404错误

**症状**: 刷新页面时显示404错误

**可能原因**:
- Apache未配置SPA路由支持

**解决方法**:
1. 启用mod_rewrite模块
2. 配置.htaccess或VirtualHost重写规则
3. 重启Apache服务

---

## 📊 性能优化

### 启用Gzip压缩

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 启用浏览器缓存

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

---

## 📞 技术支持

### 服务器配置问题

联系服务器管理员或运维团队

### SSL证书问题

联系证书提供商或学校信息中心

### 应用功能问题

查看相关文档：
- `WZBC_CAS_SETUP.md` - CAS系统配置
- `DEPLOYMENT_CHECKLIST.md` - 部署清单
- `START_HERE.md` - 快速开始

---

## ✅ 部署完成确认

- [ ] SSL证书已安装并验证
- [ ] Apache配置已更新
- [ ] 前端应用已部署
- [ ] HTTPS访问正常
- [ ] HTTP自动重定向到HTTPS
- [ ] CAS回调URL已注册（HTTPS）
- [ ] Supabase环境变量已配置（HTTPS）
- [ ] OAuth登录流程测试通过
- [ ] 所有功能正常工作
- [ ] 安全检查已完成

---

## 🎉 部署成功

完成所有步骤后，您的智能体比赛报名平台已成功部署到：

**https://aigctmp.wzbc.edu.cn**

用户现在可以通过HTTPS安全访问，使用温州商学院CAS统一身份认证登录！

---

**文档版本**: 1.0  
**更新日期**: 2025-12-03  
**生产域名**: https://aigctmp.wzbc.edu.cn  
**协议**: HTTPS (SSL/TLS)
