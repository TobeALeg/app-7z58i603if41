-- 添加新字段到 profiles 表（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN student_id text UNIQUE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'real_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN real_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'oauth_provider'
  ) THEN
    ALTER TABLE profiles ADD COLUMN oauth_provider text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'oauth_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN oauth_id text UNIQUE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'identity_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN identity_type text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'organization'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization text;
  END IF;
END
$$;

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
    ON CONFLICT (id) DO UPDATE SET
      student_id = COALESCE(user_metadata->>'student_id', profiles.student_id),
      real_name = COALESCE(user_metadata->>'real_name', profiles.real_name),
      oauth_provider = COALESCE(user_metadata->>'provider', profiles.oauth_provider),
      oauth_id = COALESCE(user_metadata->>'oauth_id', profiles.oauth_id),
      identity_type = COALESCE(user_metadata->>'identity_type', profiles.identity_type),
      organization = COALESCE(user_metadata->>'organization', profiles.organization);
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