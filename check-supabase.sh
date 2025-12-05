#!/bin/bash

# Supabase配置检查脚本

echo "========================================="
echo "  Supabase配置检查"
echo "========================================="
echo ""

# 检查Supabase CLI
echo "1. 检查Supabase CLI..."
if command -v supabase &> /dev/null; then
    echo "✓ Supabase CLI已安装: $(supabase --version)"
else
    echo "✗ Supabase CLI未安装"
    echo "  安装命令: npm install -g supabase"
    exit 1
fi
echo ""

# 检查登录状态
echo "2. 检查登录状态..."
if supabase projects list &> /dev/null; then
    echo "✓ 已登录Supabase"
    echo ""
    echo "项目列表:"
    supabase projects list
else
    echo "✗ 未登录Supabase"
    echo "  登录命令: supabase login"
    exit 1
fi
echo ""

# 检查项目关联
echo "3. 检查项目关联..."
if [ -f ".supabase/config.toml" ]; then
    echo "✓ 项目已关联"
    echo ""
    echo "项目配置:"
    cat .supabase/config.toml | grep -E "(project_id|api)"
else
    echo "✗ 项目未关联"
    echo "  关联命令: supabase link --project-ref supabase254442544895672320"
    exit 1
fi
echo ""

# 检查Edge Function
echo "4. 检查Edge Function..."
echo ""
echo "已部署的函数:"
supabase functions list
echo ""

# 检查.env文件
echo "5. 检查.env配置..."
if [ -f ".env" ]; then
    echo "✓ .env文件存在"
    echo ""
    echo "Supabase配置:"
    cat .env | grep -E "VITE_SUPABASE"
else
    echo "✗ .env文件不存在"
    exit 1
fi
echo ""

# 测试Edge Function
echo "6. 测试Edge Function..."
echo ""
SUPABASE_URL=$(cat .env | grep VITE_SUPABASE_URL | cut -d '=' -f2)
SUPABASE_KEY=$(cat .env | grep VITE_SUPABASE_ANON_KEY | cut -d '=' -f2)

echo "测试URL: ${SUPABASE_URL}/functions/v1/oauth-callback"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${SUPABASE_URL}/functions/v1/oauth-callback" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -d '{"code":"test","state":"test"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP状态码: $HTTP_CODE"
echo "响应内容: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "✓ Edge Function可访问"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "✗ 认证失败 (401)"
    echo "  可能原因:"
    echo "  1. ANON_KEY不正确"
    echo "  2. Edge Function未部署"
    echo "  3. Supabase URL不正确"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "✗ Edge Function不存在 (404)"
    echo "  部署命令: supabase functions deploy oauth-callback"
else
    echo "✗ 请求失败 (HTTP $HTTP_CODE)"
fi
echo ""

# 总结
echo "========================================="
echo "  检查完成"
echo "========================================="
echo ""
echo "如果发现问题，请按照提示修复。"
echo ""
