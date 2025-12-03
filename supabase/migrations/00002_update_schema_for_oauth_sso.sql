/*
# 更新数据库结构以支持OAuth 2.0 SSO

## 1. 修改 profiles 表

添加字段：
- `student_id` (text, 唯一) - 学号
- `real_name` (text) - 真实姓名
- `oauth_provider` (text) - OAuth提供商标识
- `oauth_id` (text, 唯一) - OAuth用户ID

## 2. 修改触发器

- 更新 `handle_new_user()` 函数以支持OAuth用户自动创建
- OAuth用户首次登录时自动创建profile记录

## 3. 说明

- 保留原有的username字段用于显示
- student_id用于存储学号
- real_name用于存储真实姓名
- oauth_id用于唯一标识OAuth用户
*/

-- 添加新字段到 profiles 表
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS real_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_provider text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_id text UNIQUE;

-- 修改username字段，允许为空（OAuth用户可能没有username）
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_oauth_id ON profiles(oauth_id);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);

-- 更新触发器函数：支持OAuth用户自动创建
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
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- 获取用户元数据
  user_metadata := NEW.raw_user_meta_data;
  
  -- 从 email 中提取用户名（去掉 @miaoda.com）
  new_username := REPLACE(NEW.email, '@miaoda.com', '');
  
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
    );
  ELSE
    -- 非OAuth用户（保留原有逻辑）
    INSERT INTO profiles (id, username, role)
    VALUES (
      NEW.id,
      new_username,
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    );
  END IF;
  
  RETURN NEW;
END;
$$;