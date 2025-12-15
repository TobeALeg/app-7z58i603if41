/*
# 添加防止重复报名的约束

## 1. 添加唯一约束

确保每个用户只能有一个非拒绝状态的报名记录
- 用户不能同时拥有多个待审核或已通过的报名
- 用户被拒绝后可以重新报名

## 2. 实现方式

使用部分唯一索引来实现此约束：
- 在 user_id 和 status 上创建部分唯一索引
- 索引只包含状态为 pending 或 approved 的记录
- 这样确保每个用户最多只能有一条非 rejected 状态的报名记录
*/

-- 创建部分唯一索引，确保每个用户只能有一个非拒绝状态的报名
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_registration_per_user 
ON registrations (user_id) 
WHERE status IN ('pending', 'approved');