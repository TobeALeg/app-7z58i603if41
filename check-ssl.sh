#!/bin/bash

# SSL证书检查脚本
# 用于诊断SSL"不安全"问题

echo "========================================="
echo "  SSL证书检查工具"
echo "  域名: aigctmp.wzbc.edu.cn"
echo "========================================="
echo ""

CERT_PATH="/home/lw/projects/app-7z58i603if41/apache/wzbc-edu-cn-1024225915.crt"
KEY_PATH="/home/lw/projects/app-7z58i603if41/apache/wzbc-edu-cn-1024225915_key.key"
CHAIN_PATH="/home/lw/projects/app-7z58i603if41/apache/ca_bundle.crt"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查1: 证书文件是否存在
echo "检查1: 证书文件是否存在"
echo "-----------------------------------"
if [ -f "$CERT_PATH" ]; then
    echo -e "${GREEN}✓ 证书文件存在${NC}"
else
    echo -e "${RED}✗ 证书文件不存在: $CERT_PATH${NC}"
    exit 1
fi

if [ -f "$KEY_PATH" ]; then
    echo -e "${GREEN}✓ 私钥文件存在${NC}"
else
    echo -e "${RED}✗ 私钥文件不存在: $KEY_PATH${NC}"
    exit 1
fi

if [ -f "$CHAIN_PATH" ]; then
    echo -e "${GREEN}✓ 证书链文件存在${NC}"
else
    echo -e "${YELLOW}⚠ 证书链文件不存在: $CHAIN_PATH${NC}"
fi
echo ""

# 检查2: 证书域名
echo "检查2: 证书支持的域名"
echo "-----------------------------------"
echo "证书主题:"
openssl x509 -in "$CERT_PATH" -noout -subject
echo ""
echo "证书支持的域名 (SAN):"
openssl x509 -in "$CERT_PATH" -noout -text | grep -A 1 "Subject Alternative Name" || echo "未找到SAN扩展"
echo ""

# 检查aigctmp.wzbc.edu.cn是否在证书中
if openssl x509 -in "$CERT_PATH" -noout -text | grep -q "aigctmp.wzbc.edu.cn"; then
    echo -e "${GREEN}✓ 证书包含域名: aigctmp.wzbc.edu.cn${NC}"
elif openssl x509 -in "$CERT_PATH" -noout -text | grep -q "\*.wzbc.edu.cn"; then
    echo -e "${GREEN}✓ 证书包含通配符: *.wzbc.edu.cn${NC}"
else
    echo -e "${RED}✗ 证书不包含 aigctmp.wzbc.edu.cn 或 *.wzbc.edu.cn${NC}"
    echo -e "${RED}  这是导致浏览器显示'不安全'的主要原因！${NC}"
    echo ""
    echo "解决方案:"
    echo "1. 重新申请包含 aigctmp.wzbc.edu.cn 的证书"
    echo "2. 或使用 *.wzbc.edu.cn 通配符证书"
fi
echo ""

# 检查3: 证书有效期
echo "检查3: 证书有效期"
echo "-----------------------------------"
openssl x509 -in "$CERT_PATH" -noout -dates
echo ""

# 检查证书是否过期
if openssl x509 -in "$CERT_PATH" -noout -checkend 0 > /dev/null; then
    echo -e "${GREEN}✓ 证书未过期${NC}"
else
    echo -e "${RED}✗ 证书已过期！${NC}"
fi
echo ""

# 检查4: 证书和私钥是否匹配
echo "检查4: 证书和私钥是否匹配"
echo "-----------------------------------"
CERT_MD5=$(openssl x509 -noout -modulus -in "$CERT_PATH" | openssl md5 | cut -d' ' -f2)
KEY_MD5=$(openssl rsa -noout -modulus -in "$KEY_PATH" 2>/dev/null | openssl md5 | cut -d' ' -f2)

if [ "$CERT_MD5" == "$KEY_MD5" ]; then
    echo -e "${GREEN}✓ 证书和私钥匹配${NC}"
else
    echo -e "${RED}✗ 证书和私钥不匹配！${NC}"
fi
echo ""

# 检查5: 证书颁发者
echo "检查5: 证书颁发者"
echo "-----------------------------------"
openssl x509 -in "$CERT_PATH" -noout -issuer
echo ""

# 检查6: 在线SSL测试
echo "检查6: 在线SSL连接测试"
echo "-----------------------------------"
echo "测试SSL连接到 aigctmp.wzbc.edu.cn:443 ..."
echo ""

timeout 5 openssl s_client -connect aigctmp.wzbc.edu.cn:443 -servername aigctmp.wzbc.edu.cn < /dev/null 2>&1 | grep -E "(Verify return code|subject=|issuer=)" || echo "无法连接到服务器"
echo ""

# 总结
echo "========================================="
echo "  检查完成"
echo "========================================="
echo ""
echo "如果发现问题，请查看上面的详细信息"
echo ""
echo "常见问题解决方案:"
echo "1. 证书域名不匹配 → 重新申请正确的证书"
echo "2. 证书过期 → 续期证书"
echo "3. 证书和私钥不匹配 → 使用正确的私钥文件"
echo "4. 证书链不完整 → 配置完整的证书链"
echo ""
echo "详细解决方案请查看: 问题排查与解决.md"
echo ""
