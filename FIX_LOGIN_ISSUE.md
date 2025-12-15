# 登录问题修复方案

## 问题概述

在用户登录过程中，只有第一个用户能够成功登录，其他用户登录时报"数据库修改错误"。

## 根本原因分析

经过代码审查和分析，发现问题出在数据库触发器 `handle_new_user()` 上：

1. 当OAuth用户首次登录时，系统会在 `auth.users` 表中创建记录
2. 触发器 `on_auth_user_confirmed` 会监听这个事件，并尝试在 `profiles` 表中创建对应的用户档案
3. 但是当其他用户登录时，触发器函数中的 `INSERT` 语句没有处理记录已存在的情况
4. 导致出现主键冲突错误，阻止了其他用户登录

## 解决方案

### 已实施的修复

创建了新的数据库迁移文件 `00005_fix_user_profile_trigger.sql` 来修复此问题：

1. 修改触发器函数 `handle_new_user()`：
   - 添加了检查用户是否已存在的逻辑
   - 如果用户已存在，则更新用户信息而不是插入新记录
   - 使用 `ON CONFLICT (id) DO NOTHING` 子句处理潜在的冲突

2. 更新触发器定义：
   - 修改触发器为在 INSERT 或 UPDATE 时都会触发
   - 确保即使在用户记录已存在的情况下也能正确处理

### 详细变更

在新的迁移文件中：

```sql
-- 更新触发器函数：修复冲突处理
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  new_username text;
  user_metadata jsonb;
BEGIN
  -- 获取用户元数据
  user_metadata := NEW.raw_user_meta_data;
  
  -- 从 email 中提取用户名（去掉 @miaoda.com）
  new_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  -- 检查用户是否已存在
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- 用户已存在，更新信息（如果有新的OAuth信息）
    IF user_metadata IS NOT NULL THEN
      UPDATE profiles 
      SET 
        username = COALESCE(user_metadata->>'username', user_metadata->>'name', username),
        student_id = COALESCE(user_metadata->>'student_id', student_id),
        real_name = COALESCE(user_metadata->>'real_name', real_name),
        oauth_provider = COALESCE(user_metadata->>'provider', oauth_provider),
        oauth_id = COALESCE(user_metadata->>'oauth_id', oauth_id)
      WHERE id = NEW.id;
    END IF;
    RETURN NEW;
  END IF;
  
  -- 用户不存在，创建新记录
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- 如果是OAuth用户，从元数据中提取信息
  IF user_metadata IS NOT NULL THEN
    INSERT INTO profiles (
      id, 
      username, 
      role,
      student_id,
      real_name,
      oauth_provider,
      oauth_id
    )
    VALUES (
      NEW.id,
      COALESCE(user_metadata->>'username', user_metadata->>'name', new_username),
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END,
      user_metadata->>'student_id',
      user_metadata->>'real_name',
      user_metadata->>'provider',
      user_metadata->>'oauth_id'
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- 非OAuth用户（保留原有逻辑）
    INSERT INTO profiles (id, username, role)
    VALUES (
      NEW.id,
      new_username,
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;
```

## 验证方法

1. 部署新的数据库迁移文件到生产环境
2. 让之前无法登录的用户尝试重新登录
3. 检查数据库中的 `profiles` 表，确认用户记录正确创建或更新
4. 监控应用日志，确认不再出现数据库冲突错误

## 后续步骤

1. 部署更新后的数据库迁移文件
2. 监控用户登录情况和错误报告
3. 根据实际情况进一步优化认证流程