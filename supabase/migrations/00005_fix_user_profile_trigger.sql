/*
# 修复用户档案触发器冲突问题

## 问题描述
当OAuth用户登录时，数据库触发器handle_new_user()试图插入用户档案记录，
但如果记录已存在会导致主键冲突错误，使得除第一个用户外的其他用户无法登录。

## 解决方案
修改触发器函数，使用ON CONFLICT子句处理重复插入的情况。
*/

-- 删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

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

-- 创建新的触发器
CREATE TRIGGER on_auth_user_confirmed
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();