/*
# 创建比赛结果相关表

## 1. 新建表

### competition_groups 表（比赛组别表）
- `id` (uuid, 主键, 默认: gen_random_uuid())
- `name` (text, 非空) - 组别名称
- `description` (text) - 组别描述
- `order_number` (integer, 默认: 0) - 显示顺序
- `created_at` (timestamptz, 默认: now())

### competition_results 表（比赛结果表）
- `id` (uuid, 主键, 默认: gen_random_uuid())
- `registration_id` (uuid, 关联 registrations.id)
- `group_id` (uuid, 关联 competition_groups.id)
- `award_level` (text, 非空) - 奖项等级 (first_prize, second_prize, third_prize, honorable_mention)
- `award_name` (text, 非空) - 奖项名称
- `ranking` (integer) - 排名
- `score` (numeric) - 得分
- `remarks` (text) - 备注
- `published` (boolean, 默认: false) - 是否已公布
- `published_at` (timestamptz) - 公布时间
- `created_at` (timestamptz, 默认: now())
- `updated_at` (timestamptz, 默认: now())
*/

-- 创建比赛组别表
CREATE TABLE IF NOT EXISTS competition_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 创建比赛结果表
CREATE TABLE IF NOT EXISTS competition_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  group_id uuid REFERENCES competition_groups(id) ON DELETE SET NULL,
  award_level text NOT NULL,
  award_name text NOT NULL,
  ranking integer,
  score numeric,
  remarks text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_competition_groups_order ON competition_groups(order_number);
CREATE INDEX IF NOT EXISTS idx_competition_results_group ON competition_results(group_id);
CREATE INDEX IF NOT EXISTS idx_competition_results_award_level ON competition_results(award_level);
CREATE INDEX IF NOT EXISTS idx_competition_results_published ON competition_results(published);

-- 创建更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 为 competition_results 表创建更新时间戳的触发器
DROP TRIGGER IF EXISTS update_competition_results_updated_at ON competition_results;
CREATE TRIGGER update_competition_results_updated_at
  BEFORE UPDATE ON competition_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 插入一些示例组别数据
INSERT INTO competition_groups (name, description, order_number)
VALUES 
  ('AI应用组', '人工智能应用创新类项目', 1),
  ('算法创新组', '算法研究与创新类项目', 2),
  ('机器人组', '机器人技术与应用类项目', 3),
  ('大数据组', '大数据分析与处理类项目', 4)
ON CONFLICT DO NOTHING;