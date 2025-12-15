#!/bin/bash

# 为 Vite 开发服务器生成本地 HTTPS 证书

# 创建 certs 目录
mkdir -p certs

# 进入 certs 目录
cd certs

# 生成私钥和自签名证书
openssl req -x509 -newkey rsa:4096 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj "/CN=aigc.wzbc.edu.cn"

echo "证书已生成到 certs/ 目录"
echo "请更新您的 Vite 配置以使用这些证书"