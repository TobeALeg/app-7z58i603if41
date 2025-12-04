#!/bin/bash
# 批量更新域名：aigc.wzbc.edu.cn -> aigctmp.wzbc.edu.cn

echo "开始更新域名..."

# 更新所有.md文件
find . -name "*.md" -type f -exec sed -i 's/aigc\.wzbc\.edu\.cn/aigctmp.wzbc.edu.cn/g' {} \\;

# 更新Apache配置文件
find . -name "*.conf" -type f -exec sed -i 's/aigc\.wzbc\.edu\.cn/aigctmp.wzbc.edu.cn/g' {} \\;

# 更新部署脚本
find . -name "*.sh" -type f -exec sed -i 's/aigc\.wzbc\.edu\.cn/aigctmp.wzbc.edu.cn/g' {} \\;

echo "域名更新完成！"
echo "已将 aigc.wzbc.edu.cn 替换为 aigctmp.wzbc.edu.cn"
