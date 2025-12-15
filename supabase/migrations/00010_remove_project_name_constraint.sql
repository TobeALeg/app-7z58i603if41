/*
# 移除项目名称相关约束

## 1. 移除约束原因

根据产品需求变更，报名表单不再包含项目名称字段，因此需要移除相关的数据库约束。

## 2. 需要移除的约束

- 学生赛道项目名称必填约束
- 相关的检查约束和索引
*/

-- 删除项目名称相关约束（如果存在）
DO $$ 
BEGIN
  -- 删除学生赛道项目名称必填约束
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'project_name_required_for_student_tracks'
  ) THEN
    ALTER TABLE registrations DROP CONSTRAINT project_name_required_for_student_tracks;
  END IF;
  
  -- 删除旧的约束名称（如果存在）
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'project_name_required_for_non_teacher_individual'
  ) THEN
    ALTER TABLE registrations DROP CONSTRAINT project_name_required_for_non_teacher_individual;
  END IF;
END
$$;