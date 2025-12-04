#!/bin/bash

# 智能体比赛报名平台 - 部署脚本
# 生产域名: https://aigc.wzbc.edu.cn

set -e  # 遇到错误立即退出

echo "🚀 开始部署智能体比赛报名平台..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未安装Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: 未安装npm${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm版本: $(npm -v)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install
echo -e "${GREEN}✓${NC} 依赖安装完成"
echo ""

# 运行lint检查
echo "🔍 运行代码检查..."
npm run lint
echo -e "${GREEN}✓${NC} 代码检查通过"
echo ""

# 构建生产版本
echo "🏗️  构建生产版本..."
npm run build
echo -e "${GREEN}✓${NC} 构建完成"
echo ""

# 检查dist目录
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 错误: dist目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} dist目录已生成"
echo ""

# 显示构建文件大小
echo "📊 构建文件统计:"
du -sh dist
echo ""

# 检查.htaccess文件
if [ -f "dist/.htaccess" ]; then
    echo -e "${GREEN}✓${NC} .htaccess文件已包含"
else
    echo -e "${YELLOW}⚠${NC}  警告: .htaccess文件未找到"
fi
echo ""

# 部署提示
echo "📋 部署步骤:"
echo ""
echo "1. 上传dist目录到服务器:"
echo "   ${YELLOW}scp -r dist/* user@server:/var/www/html/${NC}"
echo ""
echo "2. 或使用rsync:"
echo "   ${YELLOW}rsync -avz --delete dist/ user@server:/var/www/html/${NC}"
echo ""
echo "3. 设置文件权限:"
echo "   ${YELLOW}sudo chown -R www-data:www-data /var/www/html${NC}"
echo "   ${YELLOW}sudo find /var/www/html -type d -exec chmod 755 {} \;${NC}"
echo "   ${YELLOW}sudo find /var/www/html -type f -exec chmod 644 {} \;${NC}"
echo ""
echo "4. 重启Apache:"
echo "   ${YELLOW}sudo systemctl restart apache2${NC}"
echo ""
echo "5. 访问网站:"
echo "   ${GREEN}https://aigc.wzbc.edu.cn${NC}"
echo ""

# 部署检查清单
echo "✅ 部署前检查清单:"
echo ""
echo "□ SSL证书已安装"
echo "□ Apache配置已更新"
echo "□ CAS回调URL已注册 (https://aigc.wzbc.edu.cn/auth/callback)"
echo "□ Supabase环境变量已配置"
echo "□ Edge Function已部署"
echo "□ 数据库迁移已应用"
echo ""

echo -e "${GREEN}🎉 构建完成！准备部署到生产环境${NC}"
echo ""
echo "📚 相关文档:"
echo "  - HTTPS_DEPLOYMENT.md - HTTPS部署指南"
echo "  - WZBC_CAS_SETUP.md - CAS系统配置"
echo "  - DEPLOYMENT_CHECKLIST.md - 部署检查清单"
echo ""
