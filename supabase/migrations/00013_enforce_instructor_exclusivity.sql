/*
# 强制执行指导教师独占性约束

## 问题描述

当前的验证机制不够严格，允许已经被指定为指导教师的用户再次报名参赛，
这违反了指导教师不能同时指导多个团队的规定。

## 解决方案

添加一个触发器，在创建或更新报名记录时，检查指导教师是否已经在其他有效报名中担任指导教师角色。
*/

-- 删除旧的触发器和函数（如果存在）
DROP TRIGGER IF EXISTS enforce_instructor_exclusivity_trigger ON registrations;
DROP FUNCTION IF EXISTS enforce_instructor_exclusivity();

-- 创建强制指导教师独占性的函数
CREATE OR REPLACE FUNCTION enforce_instructor_exclusivity()
RETURNS TRIGGER AS $$
BEGIN
  -- 只检查团队报名类型
  IF NEW.track_type NOT IN ('student-team', 'teacher-team') THEN
    RETURN NEW;
  END IF;

  -- 检查指导教师是否已经在其他有效的报名中担任指导教师
  IF NEW.instructor_name IS NOT NULL AND LENGTH(NEW.instructor_name) > 0 THEN
    IF EXISTS (
      SELECT 1 
      FROM registrations r
      WHERE r.status IN ('pending', 'approved')
        AND r.track_type IN ('student-team', 'teacher-team')
        AND r.id != NEW.id
        AND r.instructor_name = NEW.instructor_name
    ) THEN
      RAISE EXCEPTION '指导教师 % 已经在其他团队中担任指导教师，无法重复指导', NEW.instructor_name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER enforce_instructor_exclusivity_trigger
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_instructor_exclusivity();