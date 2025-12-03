# 📁 项目结构说明

## OAuth 2.0 SSO 相关文件

### 配置文件

```
src/config/
└── oauth.ts                    # OAuth配置中心（需要修改）
```

### 服务层

```
src/services/
└── oauthService.ts            # OAuth服务（可选使用）
```

### 工具函数

```
src/utils/
└── oauthConfigCheck.ts        # OAuth配置检查工具
```

### 页面组件

```
src/pages/
├── LoginPage.tsx              # 登录页面（已改为OAuth登录）
└── OAuthCallbackPage.tsx      # OAuth回调处理页面
```

### 认证上下文

```
src/contexts/
└── AuthContext.tsx            # 认证上下文（已更新为OAuth）
```

### 后端函数

```
supabase/functions/
└── oauth-callback/
    └── index.ts               # OAuth回调处理Edge Function
```

### 数据库迁移

```
supabase/migrations/
└── 00002_update_schema_for_oauth_sso.sql  # OAuth数据库结构
```

## 文档文件

```
├── START_HERE.md                      # 从这里开始
├── QUICK_START.md                     # 5分钟快速配置
├── OAUTH_SETUP.md                     # 完整配置指南
├── OAUTH_MIGRATION_SUMMARY.md         # 系统改造总结
├── CONFIGURATION_CHECKLIST.md         # 配置检查清单
└── .env.example                       # 环境变量示例
```

## 完整项目结构

```
app-7z58i603if41/
├── public/                            # 静态资源
├── src/
│   ├── components/
│   │   ├── common/                    # 通用组件
│   │   │   ├── Header.tsx            # 导航栏（显示学号姓名）
│   │   │   ├── Footer.tsx            # 页脚
│   │   │   └── ProtectedRoute.tsx    # 路由守卫
│   │   └── ui/                        # UI组件库
│   ├── config/
│   │   └── oauth.ts                   # ⭐ OAuth配置
│   ├── contexts/
│   │   └── AuthContext.tsx            # ⭐ 认证上下文
│   ├── db/
│   │   ├── supabase.ts               # Supabase客户端
│   │   └── api.ts                    # 数据库API
│   ├── lib/
│   │   └── imageCompression.ts       # 图片压缩
│   ├── pages/
│   │   ├── HomePage.tsx              # 首页
│   │   ├── LoginPage.tsx             # ⭐ 登录页
│   │   ├── OAuthCallbackPage.tsx     # ⭐ OAuth回调
│   │   ├── RegisterPage.tsx          # 报名页
│   │   ├── SubmitWorkPage.tsx        # 作品提交
│   │   ├── MyRegistrationPage.tsx    # 我的报名
│   │   ├── RulesPage.tsx             # 比赛规则
│   │   └── AdminPage.tsx             # 管理后台
│   ├── services/
│   │   └── oauthService.ts           # ⭐ OAuth服务
│   ├── types/
│   │   └── types.ts                  # 类型定义
│   ├── utils/
│   │   └── oauthConfigCheck.ts       # ⭐ 配置检查
│   ├── App.tsx                        # 应用入口
│   ├── main.tsx                       # 主入口
│   ├── routes.tsx                     # 路由配置
│   └── index.css                      # 全局样式
├── supabase/
│   ├── functions/
│   │   └── oauth-callback/           # ⭐ OAuth后端处理
│   │       └── index.ts
│   └── migrations/
│       ├── 00001_initial_schema.sql
│       └── 00002_update_schema_for_oauth_sso.sql  # ⭐ OAuth数据库
├── .env                               # 环境变量（不提交）
├── .env.example                       # 环境变量示例
├── package.json                       # 依赖配置
├── vite.config.ts                     # Vite配置
├── tailwind.config.mjs                # Tailwind配置
└── 文档文件...

⭐ = OAuth相关的核心文件
```

## 需要修改的文件

### 必须修改

1. **src/config/oauth.ts**
   - 填写学校OAuth配置信息

### 可选修改

2. **src/config/oauth.ts** 中的 `userInfoMapping`
   - 根据学校OAuth返回的字段调整映射

## 不需要修改的文件

- ✅ 所有页面组件（已适配OAuth）
- ✅ 数据库API（已支持OAuth字段）
- ✅ 认证上下文（已改为OAuth）
- ✅ 路由配置（已添加OAuth回调路由）
- ✅ UI组件（无需修改）

## 配置流程

```
1. 修改 src/config/oauth.ts
   ↓
2. 配置 Supabase 环境变量
   ↓
3. 在学校系统注册回调URL
   ↓
4. 测试登录流程
   ↓
5. 完成！
```

## 文件依赖关系

```
main.tsx
  ↓
App.tsx
  ↓
AuthContext.tsx ← oauth.ts
  ↓
routes.tsx
  ↓
LoginPage.tsx → signInWithOAuth() → 学校OAuth系统
  ↓
OAuthCallbackPage.tsx → Edge Function → 创建用户
  ↓
其他页面（报名、作品提交等）
```

## 数据流

```
用户点击登录
  ↓
oauth.ts (生成授权URL)
  ↓
学校OAuth系统
  ↓
回调到 OAuthCallbackPage
  ↓
Edge Function (oauth-callback)
  ↓
Supabase Auth + Database
  ↓
AuthContext (更新用户状态)
  ↓
应用内页面
```

---

**提示**: 重点关注标记为 ⭐ 的文件，这些是OAuth功能的核心。
