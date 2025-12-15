/*
# 添加团队报名相关约束

## 1. 团队报名约束

### 团队信息完整性约束
- 团队报名时必须填写团队名称
- 团队报名时必须填写团队队长
- 学生团队报名时必须填写指导教师

### 团队成员唯一性约束
- 团队成员不能同时属于多个团队
- 用户不能既是队长又是其他团队的成员
- 指导教师不能同时指导多个团队

### 实现方式
- 使用触发器函数在插入或更新时检查约束
- 使用检查约束确保必要字段不为空
*/

-- 为团队报名添加字段非空约束
ALTER TABLE registrations 
ADD CONSTRAINT team_name_required_for_team_tracks 
CHECK (
  (track_type NOT IN ('student-team', 'teacher-team')) 
  OR (team_name IS NOT NULL AND LENGTH(team_name) > 0)
);

ALTER TABLE registrations 
ADD CONSTRAINT team_leader_required_for_team_tracks 
CHECK (
  (track_type NOT IN ('student-team', 'teacher-team')) 
  OR (team_leader IS NOT NULL AND LENGTH(team_leader) > 0)
);

-- 学生团队必须有指导教师
ALTER TABLE registrations 
ADD CONSTRAINT instructor_required_for_student_teams 
CHECK (
  track_type != 'student-team' 
  OR (instructor_name IS NOT NULL AND LENGTH(instructor_name) > 0)
);

-- 创建函数检查团队成员是否重复
CREATE OR REPLACE FUNCTION check_team_member_duplicate()
RETURNS TRIGGER AS $$
DECLARE
  member_count INTEGER;
  member_name TEXT;
  member_record RECORD;
BEGIN
  -- 只对团队报名进行检查
  IF NEW.track_type NOT IN ('student-team', 'teacher-team') THEN
    RETURN NEW;
  END IF;

  -- 检查团队队长是否已是其他团队的成员
  IF EXISTS (
    SELECT 1 FROM registrations 
    WHERE status IN ('pending', 'approved')
      AND track_type IN ('student-team', 'teacher-team')
      AND id != NEW.id
      AND (
        -- 队长在其他团队的成员列表中
        (team_members ILIKE '%' || NEW.team_leader || '%')
        OR
        -- 队长是其他团队的队长
        (team_leader = NEW.team_leader)
        OR
        -- 队长是其他团队的指导教师
        (instructor_name = NEW.team_leader)
      )
  ) THEN
    RAISE EXCEPTION '团队队长 % 已经在其他团队中', NEW.team_leader;
  END IF;

  -- 检查指导教师是否已在其他团队中
  IF NEW.instructor_name IS NOT NULL AND LENGTH(NEW.instructor_name) > 0 THEN
    IF EXISTS (
      SELECT 1 FROM registrations 
      WHERE status IN ('pending', 'approved')
        AND track_type IN ('student-team', 'teacher-team')
        AND id != NEW.id
        AND (
          -- 指导教师在其他团队的成员列表中
          (team_members ILIKE '%' || NEW.instructor_name || '%')
          OR
          -- 指导教师是其他团队的队长
          (team_leader = NEW.instructor_name)
          OR
          -- 指导教师是其他团队的指导教师
          (instructor_name = NEW.instructor_name)
        )
    ) THEN
      RAISE EXCEPTION '指导教师 % 已经在其他团队中', NEW.instructor_name;
    END IF;
  END IF;

  -- 检查团队成员是否已在其他团队中
  IF NEW.team_members IS NOT NULL AND LENGTH(NEW.team_members) > 0 THEN
    -- 分割成员列表并逐一检查
    FOR member_record IN 
      SELECT trim(unnest(string_to_array(NEW.team_members, ','))) AS member_name
    LOOP
      member_name := member_record.member_name;
      
      IF LENGTH(member_name) > 0 THEN
        IF EXISTS (
          SELECT 1 FROM registrations 
          WHERE status IN ('pending', 'approved')
            AND track_type IN ('student-team', 'teacher-team')
            AND id != NEW.id
            AND (
              -- 成员在其他团队的成员列表中
              (team_members ILIKE '%' || member_name || '%')
              OR
              -- 成员是其他团队的队长
              (team_leader = member_name)
              OR
              -- 成员是其他团队的指导教师
              (instructor_name = member_name)
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

-- 创建触发器，确保在插入或更新时检查团队成员重复
DROP TRIGGER IF EXISTS check_team_member_duplicate_trigger ON registrations;
CREATE TRIGGER check_team_member_duplicate_trigger
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_team_member_duplicate();

-- 创建函数检查用户是否已经报名（包括作为团队成员）
CREATE OR REPLACE FUNCTION check_user_registration_duplicate()
RETURNS TRIGGER AS $$
BEGIN
  -- 检查用户是否已经有有效的报名（个人或团队）
  IF EXISTS (
    SELECT 1 FROM registrations 
    WHERE user_id = NEW.user_id 
      AND status IN ('pending', 'approved')
      AND id != NEW.id
  ) THEN
    RAISE EXCEPTION '用户已经有一个有效的报名，不能重复报名';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器检查用户重复报名
DROP TRIGGER IF EXISTS check_user_registration_duplicate_trigger ON registrations;
CREATE TRIGGER check_user_registration_duplicate_trigger
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_user_registration_duplicate();