#!/bin/bash

# 完整部署脚本 - 包含Edge Function部署
# 用于修复CAS登录问题

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
SERVER_USER="lw"
SERVER_IP="10.145.251.29"
SERVER_PATH="/var/www/aigctmp"
DOMAIN="aigctmp.wzbc.edu.cn"
PROJECT_REF="supabase254442544895672320"

echo "========================================="
echo "  智能体比赛报名平台 - 完整部署"
echo "  包含Edge Function部署"
echo "========================================="
echo ""

# 步骤1: 检查Supabase CLI
echo -e "${BLUE}步骤1: 检查Supabase CLI${NC}"
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓ Supabase CLI已安装: $(supabase --version)${NC}"
else
    echo -e "${YELLOW}⚠ Supabase CLI未安装${NC}"
    echo ""
    read -p "是否要安装Supabase CLI? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在安装Supabase CLI..."
        npm install -g supabase
        echo -e "${GREEN}✓ Supabase CLI安装完成${NC}"
    else
        echo -e "${RED}✗ 需要Supabase CLI才能部署Edge Function${NC}"
        echo "请手动安装: npm install -g supabase"
        exit 1
    fi
fi
echo ""

# 步骤2: 检查Supabase登录状态
echo -e "${BLUE}步骤2: 检查Supabase登录状态${NC}"
if supabase projects list &> /dev/null; then
    echo -e "${GREEN}✓ 已登录Supabase${NC}"
else
    echo -e "${YELLOW}⚠ 未登录Supabase${NC}"
    echo ""
    read -p "是否要登录Supabase? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在打开浏览器登录..."
        supabase login
        echo -e "${GREEN}✓ 登录成功${NC}"
    else
        echo -e "${RED}✗ 需要登录Supabase才能部署Edge Function${NC}"
        exit 1
    fi
fi
echo ""

# 步骤3: 关联项目
echo -e "${BLUE}步骤3: 关联Supabase项目${NC}"
if [ -f ".supabase/config.toml" ]; then
    echo -e "${GREEN}✓ 项目已关联${NC}"
else
    echo "正在关联项目..."
    supabase link --project-ref $PROJECT_REF
    echo -e "${GREEN}✓ 项目关联成功${NC}"
fi
echo ""

# 步骤4: 部署Edge Function
echo -e "${BLUE}步骤4: 部署Edge Function${NC}"
echo "正在部署oauth-callback函数..."
supabase functions deploy oauth-callback

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Edge Function部署成功${NC}"
else
    echo -e "${RED}✗ Edge Function部署失败${NC}"
    echo "请查看错误信息并重试"
    exit 1
fi
echo ""

# 步骤5: 配置环境变量提示
echo -e "${BLUE}步骤5: 配置Edge Function环境变量${NC}"
echo -e "${YELLOW}请在Supabase控制台配置以下环境变量：${NC}"
echo ""
echo "1. 访问 Supabase 控制台"
echo "2. 进入项目设置 → Edge Functions"
echo "3. 找到 oauth-callback 函数"
echo "4. 添加以下环境变量："
echo ""
echo "  OAUTH_TOKEN_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken"
echo "  OAUTH_USERINFO_URL=https://cas.wzbc.edu.cn/cas/oauth2.0/profile"
echo "  OAUTH_CLIENT_ID=CijBwB5EwTTXouO7"
echo "  OAUTH_CLIENT_SECRET=O8dOsXE7p7yMbh18KEP2Z6"
echo "  OAUTH_REDIRECT_URI=https://aigctmp.wzbc.edu.cn/auth/callback"
echo ""
read -p "环境变量配置完成后，按回车继续..."
echo ""

# 步骤6: 构建前端
echo -e "${BLUE}步骤6: 构建前端项目${NC}"
echo "正在构建..."
npm run build

if [ -d "dist" ]; then
    echo -e "${GREEN}✓ 前端构建成功${NC}"
else
    echo -e "${RED}✗ 构建失败${NC}"
    exit 1
fi
echo ""

# 步骤7: 部署到服务器
echo -e "${BLUE}步骤7: 部署到服务器${NC}"
read -p "是否要上传到服务器 $SERVER_IP? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在上传文件..."
    
    if command -v rsync &> /dev/null; then
        rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
    else
        scp -r dist/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
    fi
    
    echo -e "${GREEN}✓ 文件上传完成${NC}"
    echo ""
    
    echo "正在设置权限..."
    ssh ${SERVER_USER}@${SERVER_IP} "sudo chown -R www-data:www-data ${SERVER_PATH} && sudo chmod -R 755 ${SERVER_PATH}"
    echo -e "${GREEN}✓ 权限设置完成${NC}"
    echo ""
    
    echo "正在重启Apache..."
    ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl restart apache2"
    echo -e "${GREEN}✓ Apache重启完成${NC}"
fi
echo ""

# 完成
echo "========================================="
echo -e "${GREEN}  部署完成！${NC}"
echo "========================================="
echo ""
echo -e "${GREEN}✓ Edge Function已部署${NC}"
echo -e "${GREEN}✓ 前端已构建并部署${NC}"
echo ""
echo "测试步骤:"
echo "1. 访问: https://${DOMAIN}"
echo "2. 点击'登录'按钮"
echo "3. 输入学号和密码"
echo "4. 检查是否成功登录"
echo ""
echo "如果登录失败，请："
echo "1. 打开浏览器开发者工具（F12）"
echo "2. 查看Console标签的错误信息"
echo "3. 查看Edge Function日志："
echo "   supabase functions logs oauth-callback --follow"
echo ""
echo "详细文档: CAS登录配置指南.md"
echo ""
