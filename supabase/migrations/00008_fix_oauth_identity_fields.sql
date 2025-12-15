/*
# 修复OAuth身份字段未正确同步到用户档案的问题

## 问题描述
在OAuth登录流程中，虽然从CAS系统获取了identity_type和organization字段，
但由于数据库触发器函数未正确处理这些字段，导致它们未被存储到profiles表中。

## 解决方案
更新handle_new_user触发器函数，确保正确处理identity_type和organization字段。
同时更新registrations表，添加缺失的application_direction字段。
*/

-- 添加缺失的application_direction字段到registrations表（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'application_direction'
  ) THEN
    ALTER TABLE registrations ADD COLUMN application_direction text;
  END IF;
END
$$;

-- 为application_direction添加检查约束：确保值在有效范围内（如果约束不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_application_direction'
  ) THEN
    ALTER TABLE registrations ADD CONSTRAINT valid_application_direction
    CHECK (application_direction IN ('教学赋能', '科研增效', '管理提效', '服务提质', '其他方向'));
  END IF;
END
$$;

-- 修改registrations表的project_name字段，移除NOT NULL约束（如果存在）
ALTER TABLE registrations ALTER COLUMN project_name DROP NOT NULL;

-- 更新触发器函数：修复identity_type和organization字段处理
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
        oauth_id = COALESCE(user_metadata->>'oauth_id', oauth_id),
        identity_type = COALESCE(user_metadata->>'identity_type', identity_type),
        organization = COALESCE(user_metadata->>'organization', organization)
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
      oauth_id,
      identity_type,
      organization
    )
    VALUES (
      NEW.id,
      COALESCE(user_metadata->>'username', user_metadata->>'name', new_username),
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END,
      user_metadata->>'student_id',
      user_metadata->>'real_name',
      user_metadata->>'provider',
      user_metadata->>'oauth_id',
      user_metadata->>'identity_type',
      user_metadata->>'organization'
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