/*
# 加强报名验证

## 问题描述

当前的验证机制还不够完善，需要进一步加强以确保：
1. 任何用户（无论是个人、队长还是队员）只要在数据库中存在有效的报名记录，就不能再次报名
2. 即使是新提交的团队也不能包含已经存在于其他团队或其他形式报名中的成员
3. 验证应该覆盖所有类型的报名（个人赛和团体赛）
4. 作为指导教师的人不能自己报名个人赛或团体赛

## 解决方案

添加更强的验证机制，确保任何新提交的报名（无论是个人赛还是团体赛）都不包含已经存在于其他报名中的用户。
*/

-- 删除旧的触发器和函数（如果存在）
DROP TRIGGER IF EXISTS check_stronger_registration_validation_trigger ON registrations;
DROP FUNCTION IF EXISTS check_stronger_registration_validation();

-- 创建更强的报名验证函数
CREATE OR REPLACE FUNCTION check_stronger_registration_validation()
RETURNS TRIGGER AS $$
DECLARE
  member_text TEXT;
  member_record RECORD;
  member_name TEXT;
BEGIN
  -- 检查当前用户是否已经有有效的报名记录（无论个人赛还是团体赛）
  IF EXISTS (
    SELECT 1 
    FROM registrations r
    WHERE r.user_id = NEW.user_id
      AND r.status IN ('pending', 'approved')
      AND r.id != NEW.id
  ) THEN
    RAISE EXCEPTION '用户已经有一个有效的报名记录，无法重复报名';
  END IF;

  -- 检查个人赛报名（适用于所有track_type）
  -- 检查报名者姓名是否已在其他报名中（作为参与者）
  IF EXISTS (
    SELECT 1 
    FROM registrations r
    WHERE r.status IN ('pending', 'approved')
      AND r.id != NEW.id
      AND (
        -- 报名者在其他个人赛报名中作为报名者
        (r.track_type NOT IN ('student-team', 'teacher-team') AND r.name = NEW.name)
        OR
        -- 报名者在其他团队报名中作为队长
        (r.track_type IN ('student-team', 'teacher-team') AND r.team_leader = NEW.name)
        OR
        -- 报名者在其他团队报名中作为指导教师
        (r.track_type IN ('student-team', 'teacher-team') AND r.instructor_name = NEW.name)
        OR
        -- 报名者在其他团队报名中作为团队成员
        (r.track_type IN ('student-team', 'teacher-team') AND r.team_members ILIKE '%' || NEW.name || '%')
      )
  ) THEN
    RAISE EXCEPTION '您已经有一个有效的报名记录，无法重复报名';
  END IF;

  -- 如果是团队报名，进行额外检查
  IF NEW.track_type IN ('student-team', 'teacher-team') THEN
    -- 检查团队队长是否已在其他报名中（作为个人赛报名者、团队队长、团队成员或指导教师）
    IF EXISTS (
      SELECT 1 
      FROM registrations r
      WHERE r.status IN ('pending', 'approved')
        AND r.id != NEW.id
        AND (
          -- 队长在其他个人赛报名中作为报名者
          (r.track_type NOT IN ('student-team', 'teacher-team') AND r.name = NEW.team_leader)
          OR
          -- 队长在其他团队报名中作为队长
          (r.track_type IN ('student-team', 'teacher-team') AND r.team_leader = NEW.team_leader)
          OR
          -- 队长在其他团队报名中作为指导教师
          (r.track_type IN ('student-team', 'teacher-team') AND r.instructor_name = NEW.team_leader)
          OR
          -- 队长在其他团队报名中作为团队成员
          (r.track_type IN ('student-team', 'teacher-team') AND r.team_members ILIKE '%' || NEW.team_leader || '%')
        )
    ) THEN
      RAISE EXCEPTION '团队队长 % 已经在其他报名中，无法重复报名', NEW.team_leader;
    END IF;

    -- 检查指导教师是否已在其他报名中（包括作为个人报名者、团队队长、团队成员或指导教师）
    IF NEW.instructor_name IS NOT NULL AND LENGTH(NEW.instructor_name) > 0 THEN
      IF EXISTS (
        SELECT 1 
        FROM registrations r
        WHERE r.status IN ('pending', 'approved')
          AND r.id != NEW.id
          AND (
            -- 指导教师在其他个人赛报名中作为报名者
            (r.track_type NOT IN ('student-team', 'teacher-team') AND r.name = NEW.instructor_name)
            OR
            -- 指导教师在其他团队报名中作为队长
            (r.track_type IN ('student-team', 'teacher-team') AND r.team_leader = NEW.instructor_name)
            OR
            -- 指导教师在其他团队报名中作为指导教师
            (r.track_type IN ('student-team', 'teacher-team') AND r.instructor_name = NEW.instructor_name)
            OR
            -- 指导教师在其他团队报名中作为团队成员
            (r.track_type IN ('student-team', 'teacher-team') AND r.team_members ILIKE '%' || NEW.instructor_name || '%')
          )
      ) THEN
        RAISE EXCEPTION '指导教师 % 已经在其他报名中，无法重复报名', NEW.instructor_name;
      END IF;
    END IF;

    -- 检查团队成员是否已在其他报名中
    IF NEW.team_members IS NOT NULL AND LENGTH(NEW.team_members) > 0 THEN
      -- 分割成员列表并逐一检查
      FOR member_record IN 
        SELECT trim(unnest(string_to_array(NEW.team_members, ','))) AS member_text
      LOOP
        member_text := member_record.member_text;
        
        -- 提取成员姓名（去除可能的学工号部分）
        IF POSITION('(' IN member_text) > 0 THEN
          member_name := TRIM(SUBSTRING(member_text FROM 1 FOR POSITION('(' IN member_text) - 1));
        ELSE
          member_name := TRIM(member_text);
        END IF;
        
        IF LENGTH(member_name) > 0 THEN
          -- 检查成员是否已经在其他报名中
          IF EXISTS (
            SELECT 1 
            FROM registrations r
            WHERE r.status IN ('pending', 'approved')
              AND r.id != NEW.id
              AND (
                -- 成员在其他个人赛报名中作为报名者
                (r.track_type NOT IN ('student-team', 'teacher-team') AND r.name = member_name)
                OR
                -- 成员在其他团队报名中作为队长
                (r.track_type IN ('student-team', 'teacher-team') AND r.team_leader = member_name)
                OR
                -- 成员在其他团队报名中作为指导教师
                (r.track_type IN ('student-team', 'teacher-team') AND r.instructor_name = member_name)
                OR
                -- 成员在其他团队报名中作为团队成员
                (r.track_type IN ('student-team', 'teacher-team') AND r.team_members ILIKE '%' || member_name || '%')
              )
          ) THEN
            RAISE EXCEPTION '团队成员 % 已经在其他报名中，无法重复报名', member_name;
          END IF;
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  -- 检查报名者是否已经在其他报名中作为指导教师
  IF EXISTS (
    SELECT 1 
    FROM registrations r
    WHERE r.status IN ('pending', 'approved')
      AND r.id != NEW.id
      AND r.instructor_name = NEW.name
      AND r.track_type IN ('student-team', 'teacher-team')
  ) THEN
    RAISE EXCEPTION '您已经作为指导教师参与了其他报名，无法自己报名参赛';
  END IF;
  
  -- 检查指导教师是否尝试为自己报名（指导教师不能以个人身份报名）
  IF NEW.track_type IN ('teacher-individual', 'teacher-team', 'student-individual', 'student-team') THEN
    IF EXISTS (
      SELECT 1
      FROM registrations r
      WHERE r.status IN ('pending', 'approved')
        AND r.id != NEW.id
        AND r.instructor_name = NEW.name
        AND r.track_type IN ('student-team', 'teacher-team')
    ) THEN
      RAISE EXCEPTION '您已经作为指导教师参与了其他报名，无法自己报名参赛';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER check_stronger_registration_validation_trigger
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_stronger_registration_validation();