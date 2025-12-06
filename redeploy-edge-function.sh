#!/bin/bash

# 重新部署Edge Function脚本

echo "========================================="
echo "  重新部署Edge Function"
echo "========================================="
echo ""

cd ~/projects/app-7z58i603if41 || exit 1

# 检查Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "✗ Supabase CLI未安装"
    echo "  安装命令: npm install -g supabase"
    exit 1
fi

# 检查登录状态
if ! supabase projects list &> /dev/null; then
    echo "✗ 未登录Supabase"
    echo "  登录命令: supabase login"
    exit 1
fi

# 检查项目关联
if [ ! -f ".supabase/config.toml" ]; then
    echo "✗ 项目未关联"
    echo "  关联命令: supabase link --project-ref <项目ID>"
    exit 1
fi

echo "1. 当前Edge Function列表:"
supabase functions list
echo ""

echo "2. 重新部署oauth-callback函数..."
supabase functions deploy oauth-callback

if [ $? -eq 0 ]; then
    echo "✓ Edge Function部署成功"
else
    echo "✗ Edge Function部署失败"
    exit 1
fi
echo ""

echo "3. 查看最新日志..."
echo "   (按Ctrl+C退出日志查看)"
echo ""
sleep 2
supabase functions logs oauth-callback --limit 10
echo ""

echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 测试Edge Function:"
echo "   ./check-supabase.sh"
echo ""
echo "2. 查看实时日志:"
echo "   supabase functions logs oauth-callback --follow"
echo ""
echo "3. 测试登录:"
echo "   访问 https://aigctmp.wzbc.edu.cn"
echo ""
