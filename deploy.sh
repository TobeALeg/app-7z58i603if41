#!/bin/bash

# 智能体比赛报名平台 - 自动化部署脚本
# 域名: https://aigctmp.wzbc.edu.cn
# 服务器: 10.145.251.29

set -e  # 遇到错误立即退出

# 配置变量
SERVER_USER="lw"
SERVER_IP="10.145.251.29"
SERVER_PATH="/var/www/aigctmp"
DOMAIN="aigctmp.wzbc.edu.cn"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印函数
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "========================================="
echo "  智能体比赛报名平台 - 部署脚本"
echo "  域名: $DOMAIN"
echo "  服务器: $SERVER_IP"
echo "========================================="
echo ""

# 步骤1: 检查Node.js
print_info "检查Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js已安装: $NODE_VERSION"
else
    print_error "Node.js未安装，请先安装Node.js >= 18.0.0"
    exit 1
fi

# 步骤2: 检查依赖
print_info "检查项目依赖..."
if [ ! -d "node_modules" ]; then
    print_info "依赖未安装，开始安装..."
    npm install
    print_success "依赖安装完成"
else
    print_success "依赖已安装"
fi

# 步骤3: 构建项目
print_info "开始构建项目..."
npm run build

if [ -d "dist" ]; then
    print_success "项目构建成功"
else
    print_error "构建失败，dist目录不存在"
    exit 1
fi

# 步骤4: 显示构建结果
print_info "构建结果:"
du -sh dist/
echo ""
print_info "主要文件:"
ls -lh dist/ | head -10

echo ""
echo "========================================="
echo "  构建完成！"
echo "========================================="
echo ""

# 询问是否上传到服务器
read -p "是否要上传到服务器 $SERVER_IP? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "开始上传到服务器..."
    
    # 检查rsync是否存在
    if command_exists rsync; then
        print_info "使用rsync上传..."
        rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
        print_success "文件上传完成"
    else
        print_info "使用scp上传..."
        scp -r dist/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
        print_success "文件上传完成"
    fi
    
    echo ""
    print_info "设置服务器文件权限..."
    ssh ${SERVER_USER}@${SERVER_IP} "sudo chown -R www-data:www-data ${SERVER_PATH} && sudo chmod -R 755 ${SERVER_PATH}"
    print_success "权限设置完成"
    
    echo ""
    print_info "重启Apache..."
    ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl restart apache2"
    print_success "Apache重启完成"
    
    echo ""
    echo "========================================="
    echo "  部署完成！"
    echo "========================================="
    echo ""
    print_success "网站地址: http://${DOMAIN}"
    print_success "HTTPS地址: https://${DOMAIN}"
    echo ""
    print_info "请在浏览器中访问网站进行测试"
    print_info "如果看不到更新，请按 Ctrl+Shift+R 强制刷新"
else
    echo ""
    print_info "跳过上传，您可以手动上传dist目录的内容"
    echo ""
    echo "手动上传命令:"
    echo "  rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
    echo ""
    echo "或使用scp:"
    echo "  scp -r dist/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
    echo ""
    echo "上传后执行:"
    echo "  ssh ${SERVER_USER}@${SERVER_IP} 'sudo chown -R www-data:www-data ${SERVER_PATH}'"
    echo "  ssh ${SERVER_USER}@${SERVER_IP} 'sudo systemctl restart apache2'"
fi

echo ""
print_info "部署脚本执行完毕"
