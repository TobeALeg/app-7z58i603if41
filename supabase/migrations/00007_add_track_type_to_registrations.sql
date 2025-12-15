/*
# 添加赛道类型字段到报名表

## 1. 新增字段

### registrations 表新增字段：
- `track_type` (text) - 赛道类型
  - 'student-individual' 学生个人赛
  - 'student-team' 学生团队赛
  - 'teacher-individual' 教师个人赛
  - 'teacher-team' 教师团队赛
  - 'student-instructor' 学生赛道（指导教师）
- `instructor_name` (text) - 指导教师姓名
- `team_members` (text) - 团队成员（用逗号分隔）
- `team_leader` (text) - 团队队长
- `application_direction` (text) - 应用方向

## 2. 添加约束

- 为 track_type 添加检查约束，确保值的有效性
- 为 project_name 添加条件约束，确保非教师个人赛道项目名称不为空
- 为 application_direction 添加检查约束，确保值在有效范围内
*/

-- 添加新字段到 registrations 表（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'track_type'
  ) THEN
    ALTER TABLE registrations ADD COLUMN track_type text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'instructor_name'
  ) THEN
    ALTER TABLE registrations ADD COLUMN instructor_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'team_members'
  ) THEN
    ALTER TABLE registrations ADD COLUMN team_members text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'team_leader'
  ) THEN
    ALTER TABLE registrations ADD COLUMN team_leader text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'application_direction'
  ) THEN
    ALTER TABLE registrations ADD COLUMN application_direction text;
  END IF;
END
$$;

-- 为 track_type 添加检查约束（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_track_type'
  ) THEN
    ALTER TABLE registrations ADD CONSTRAINT valid_track_type 
    CHECK (track_type IN ('student-individual', 'student-team', 'teacher-individual', 'teacher-team', 'student-instructor'));
  END IF;
END
$$;

-- 修改registrations表的project_name字段，移除NOT NULL约束（如果存在）
ALTER TABLE registrations ALTER COLUMN project_name DROP NOT NULL;

-- 删除项目名称相关约束（如果存在）
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'project_name_required_for_student_tracks'
  ) THEN
    ALTER TABLE registrations DROP CONSTRAINT project_name_required_for_student_tracks;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'project_name_required_for_non_teacher_individual'
  ) THEN
    ALTER TABLE registrations DROP CONSTRAINT project_name_required_for_non_teacher_individual;
  END IF;
END
$$;

-- 为 project_name 添加条件约束：学生个人赛、学生团队赛和学生指导教师赛道项目名称不能为空
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'project_name_required_for_student_tracks'
  ) THEN
    ALTER TABLE registrations ADD CONSTRAINT project_name_required_for_student_tracks 
    CHECK (
      track_type IN ('teacher-individual', 'teacher-team') 
      OR project_name IS NOT NULL
    );
  END IF;
END
$$;

-- 为 application_direction 添加检查约束：确保值在有效范围内（如果不存在）
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_registrations_track_type ON registrations(track_type);