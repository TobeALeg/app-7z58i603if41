#!/bin/bash

# 401错误一键修复脚本

echo "========================================="
echo "  修复401 Unauthorized错误"
echo "========================================="
echo ""

# 进入项目目录
cd ~/projects/app-7z58i603if41 || exit 1

# 1. 检查并安装Supabase CLI
echo "步骤1: 检查Supabase CLI..."
if command -v supabase &> /dev/null; then
    echo "✓ Supabase CLI已安装: $(supabase --version)"
else
    echo "正在安装Supabase CLI..."
    npm install -g supabase
    if [ $? -eq 0 ]; then
        echo "✓ Supabase CLI安装成功"
    else
        echo "✗ Supabase CLI安装失败"
        exit 1
    fi
fi
echo ""

# 2. 登录Supabase
echo "步骤2: 登录Supabase..."
if supabase projects list &> /dev/null; then
    echo "✓ 已登录Supabase"
else
    echo "请登录Supabase（会打开浏览器）..."
    supabase login
    if [ $? -eq 0 ]; then
        echo "✓ 登录成功"
    else
        echo "✗ 登录失败"
        exit 1
    fi
fi
echo ""

# 3. 显示项目列表
echo "步骤3: 显示项目列表..."
echo ""
supabase projects list
echo ""

# 4. 关联项目
echo "步骤4: 关联项目..."
read -p "请输入项目引用ID（Reference ID）[默认: supabase254442544895672320]: " PROJECT_REF
PROJECT_REF=${PROJECT_REF:-supabase254442544895672320}

if [ -f ".supabase/config.toml" ]; then
    echo "项目已关联，跳过..."
else
    echo "正在关联项目: $PROJECT_REF"
    supabase link --project-ref "$PROJECT_REF"
    if [ $? -eq 0 ]; then
        echo "✓ 项目关联成功"
    else
        echo "✗ 项目关联失败"
        exit 1
    fi
fi
echo ""

# 5. 部署Edge Function
echo "步骤5: 部署Edge Function..."
supabase functions deploy oauth-callback
if [ $? -eq 0 ]; then
    echo "✓ Edge Function部署成功"
else
    echo "✗ Edge Function部署失败"
    exit 1
fi
echo ""

# 6. 提示配置环境变量
echo "========================================="
echo "  重要：配置Edge Function环境变量"
echo "========================================="
echo ""
echo "请访问 Supabase 控制台配置以下环境变量："
echo ""
echo "1. 访问: https://supabase.com"
echo "2. 进入项目 → Edge Functions → oauth-callback"
echo "3. Settings → Secrets → Add new secret"
echo "4. 逐个添加以下5个变量："
echo ""
echo "变量1:"
echo "  名称: OAUTH_TOKEN_URL"
echo "  值: https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken"
echo ""
echo "变量2:"
echo "  名称: OAUTH_USERINFO_URL"
echo "  值: https://cas.wzbc.edu.cn/cas/oauth2.0/profile"
echo ""
echo "变量3:"
echo "  名称: OAUTH_CLIENT_ID"
echo "  值: CijBwB5EwTTXouO7"
echo ""
echo "变量4:"
echo "  名称: OAUTH_CLIENT_SECRET"
echo "  值: O8dOsXE7p7yMbh18KEP2Z6"
echo ""
echo "变量5:"
echo "  名称: OAUTH_REDIRECT_URI"
echo "  值: https://aigctmp.wzbc.edu.cn/auth/callback"
echo ""
echo "========================================="
echo ""
read -p "配置完成后，按回车继续..." 

# 7. 测试Edge Function
echo ""
echo "步骤6: 测试Edge Function..."
echo ""

if [ -f "./check-supabase.sh" ]; then
    ./check-supabase.sh
else
    echo "诊断脚本不存在，手动测试..."
    
    SUPABASE_URL=$(cat .env | grep VITE_SUPABASE_URL | cut -d '=' -f2)
    SUPABASE_KEY=$(cat .env | grep VITE_SUPABASE_ANON_KEY | cut -d '=' -f2)
    
    echo "测试URL: ${SUPABASE_URL}/functions/v1/oauth-callback"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${SUPABASE_URL}/functions/v1/oauth-callback" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${SUPABASE_KEY}" \
      -d '{"code":"test","state":"test"}')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "HTTP状态码: $HTTP_CODE"
    echo "响应内容: $BODY"
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
        echo "✓ Edge Function可访问"
    elif [ "$HTTP_CODE" = "401" ]; then
        echo "✗ 仍然返回401，请检查："
        echo "  1. 环境变量是否已在Supabase控制台配置"
        echo "  2. ANON_KEY是否正确"
        echo "  3. 等待几分钟后重试（配置可能需要时间生效）"
        exit 1
    elif [ "$HTTP_CODE" = "404" ]; then
        echo "✗ Edge Function不存在"
        exit 1
    else
        echo "✗ 请求失败 (HTTP $HTTP_CODE)"
        exit 1
    fi
fi
echo ""

# 8. 重新构建并部署
echo "步骤7: 重新构建并部署..."
echo ""

read -p "是否重新构建并部署前端？(y/n) [y]: " REBUILD
REBUILD=${REBUILD:-y}

if [ "$REBUILD" = "y" ] || [ "$REBUILD" = "Y" ]; then
    echo "正在构建项目..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✓ 构建成功"
        
        if [ -f "./deploy.sh" ]; then
            echo "正在部署到服务器..."
            ./deploy.sh
            
            if [ $? -eq 0 ]; then
                echo "✓ 部署成功"
            else
                echo "✗ 部署失败"
                exit 1
            fi
        else
            echo "⚠ deploy.sh不存在，请手动部署"
        fi
    else
        echo "✗ 构建失败"
        exit 1
    fi
else
    echo "跳过构建和部署"
fi
echo ""

# 完成
echo "========================================="
echo "  修复完成！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 访问 https://aigctmp.wzbc.edu.cn"
echo "2. 按F12打开开发者工具"
echo "3. 切换到Console标签"
echo "4. 点击登录按钮"
echo "5. 输入学号和密码"
echo "6. 查看控制台输出"
echo ""
echo "如果仍然失败，请查看："
echo "- 浏览器控制台错误信息"
echo "- Edge Function日志: supabase functions logs oauth-callback --follow"
echo "- 详细指南: 修复401错误指南.md"
echo ""
