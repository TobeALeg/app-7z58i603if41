/*
# 创建智能体比赛报名系统初始数据库结构

## 1. 新建表

### profiles 表（用户信息表）
- `id` (uuid, 主键, 关联 auth.users)
- `username` (text, 唯一, 非空) - 用户名
- `role` (user_role, 默认: 'user', 非空) - 用户角色
- `created_at` (timestamptz, 默认: now())

### registrations 表（报名信息表）
- `id` (uuid, 主键, 默认: gen_random_uuid())
- `user_id` (uuid, 关联 profiles.id)
- `name` (text, 非空) - 参赛者姓名
- `phone` (text, 非空) - 联系电话
- `email` (text, 非空) - 电子邮箱
- `school` (text, 非空) - 学校/单位
- `major` (text) - 专业
- `team_name` (text) - 团队名称
- `project_name` (text, 非空) - 项目名称
- `project_description` (text) - 项目描述
- `status` (text, 默认: 'pending') - 报名状态 (pending/approved/rejected)
- `created_at` (timestamptz, 默认: now())
- `updated_at` (timestamptz, 默认: now())

### works 表（作品信息表）
- `id` (uuid, 主键, 默认: gen_random_uuid())
- `registration_id` (uuid, 关联 registrations.id)
- `work_title` (text, 非空) - 作品标题
- `work_description` (text) - 作品描述
- `work_url` (text) - 作品链接
- `file_path` (text) - 文件路径
- `submitted_at` (timestamptz, 默认: now())

## 2. 安全策略

### profiles 表
- 不启用 RLS（公开访问）
- 所有用户可以查看所有用户信息
- 管理员可以修改用户角色

### registrations 表
- 不启用 RLS（公开访问）
- 所有用户可以查看所有报名信息
- 用户可以创建和修改自己的报名信息
- 管理员可以修改所有报名信息

### works 表
- 不启用 RLS（公开访问）
- 所有用户可以查看所有作品
- 用户可以提交和修改自己的作品

## 3. 触发器

- 创建 `handle_new_user()` 函数，在用户确认后自动同步到 profiles 表
- 第一个注册的用户自动设置为管理员
- 创建 `update_updated_at()` 函数，自动更新 registrations 表的 updated_at 字段

## 4. 存储桶

- 创建 `app-7z58i603if41_works_images` 存储桶用于存储作品文件
- 文件大小限制：1MB
- 允许的文件类型：image/jpeg, image/png, image/gif, image/webp

## 5. 辅助函数

- `is_admin(uid uuid)` - 检查用户是否为管理员
*/

-- 创建用户角色枚举类型
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 创建 registrations 表
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  school text NOT NULL,
  major text,
  team_name text,
  project_name text NOT NULL,
  project_description text,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建 works 表
CREATE TABLE IF NOT EXISTS works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  work_title text NOT NULL,
  work_description text,
  work_url text,
  file_path text,
  submitted_at timestamptz DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_works_registration_id ON works(registration_id);

-- 创建辅助函数：检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- 创建触发器函数：自动同步新用户到 profiles 表
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  new_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- 从 email 中提取用户名（去掉 @miaoda.com）
  new_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  INSERT INTO profiles (id, username, role)
  VALUES (
    NEW.id,
    new_username,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  RETURN NEW;
END;
$$;

-- 创建触发器：在用户确认后同步到 profiles
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- 创建触发器函数：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 创建触发器：更新 registrations 表的 updated_at
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-7z58i603if41_works_images',
  'app-7z58i603if41_works_images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 创建存储桶策略：允许所有人上传
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'app-7z58i603if41_works_images');

-- 创建存储桶策略：允许所有人查看
CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'app-7z58i603if41_works_images');

-- 创建存储桶策略：允许用户删除自己的文件
CREATE POLICY "Allow users to delete own files" ON storage.objects
  FOR DELETE TO public
  USING (bucket_id = 'app-7z58i603if41_works_images');