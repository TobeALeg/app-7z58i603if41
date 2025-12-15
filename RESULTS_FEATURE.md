# 比赛结果功能说明

## 功能概述

本系统新增了比赛结果管理与展示功能，支持按组别分类管理比赛结果，并提供公众查看页面。

## 主要特性

### 1. 分组管理
- 支持创建和管理多个比赛组别（如：AI应用组、算法创新组等）
- 可自定义组别名称、描述和显示顺序

### 2. 结果管理
- 管理员可以在后台录入比赛结果
- 支持设置奖项等级（一等奖、二等奖、三等奖、优秀奖）
- 可以为每个结果添加备注和评分
- 支持分组公布结果（可以先公布某些组别的结果）

### 3. 批量导入
- 提供CSV模板下载
- 支持批量导入比赛结果
- 自动数据验证和错误提示
- 支持CSV格式

### 4. 公众展示
- 提供专门的结果展示页面（/results）
- 按组别分类展示获奖名单
- 清晰展示获奖项目信息和获奖者信息

## 数据库结构

### competition_groups 表（比赛组别表）
| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | uuid | 主键 |
| name | text | 组别名称 |
| description | text | 组别描述 |
| order_number | integer | 显示顺序 |
| created_at | timestamptz | 创建时间 |

### competition_results 表（比赛结果表）
| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | uuid | 主键 |
| registration_id | uuid | 关联的报名ID |
| group_id | uuid | 所属组别ID |
| award_level | text | 奖项等级 |
| award_name | text | 奖项名称 |
| ranking | integer | 排名 |
| score | numeric | 得分 |
| remarks | text | 备注 |
| published | boolean | 是否已公布 |
| published_at | timestamptz | 公布时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

## 使用说明

### 管理员操作
1. 登录系统并进入管理后台（/admin）
2. 在"比赛结果"标签页中管理组别和结果
3. 点击"添加组别"按钮创建新的比赛组别
4. 点击"编辑组别"按钮修改现有组别信息
5. 点击"添加结果"按钮为比赛添加获奖结果
6. 可以编辑现有结果或删除不需要的结果
7. 控制结果的公布状态（公布/取消公布）
8. 使用批量导入功能快速添加大量比赛结果

### 批量导入操作步骤
1. 点击"下载模板"按钮下载CSV模板
2. 按照模板格式填写比赛结果数据
3. 点击"选择文件"按钮选择填写好的CSV文件
4. 点击"导入"按钮开始批量导入
5. 等待导入完成，查看导入结果

### CSV模板字段说明
- 组别名称（必填）：比赛组别的名称，必须与系统中存在的组别名称一致
- 项目名称（必填）：参赛项目的名称，必须与系统中已有的项目名称一致
- 获奖者姓名（必填）：获奖者的姓名
- 奖项等级（必填）：可选值包括 first_prize（一等奖）、second_prize（二等奖）、third_prize（三等奖）、honorable_mention（优秀奖）
- 奖项名称（必填）：奖项的具体名称，如"一等奖"、"最佳创新奖"等
- 排名（可选）：数字类型的排名
- 得分（可选）：数字类型的得分
- 备注（可选）：文本类型的备注信息

### 公众查看
1. 访问比赛结果页面（/results）
2. 通过标签页切换查看不同组别的结果
3. 按奖项等级查看获奖名单

## API接口

### 组别管理
- `getAllCompetitionGroups()` - 获取所有组别
- `getCompetitionGroupById(id)` - 获取指定组别详情
- `createCompetitionGroup(data)` - 创建新组别
- `updateCompetitionGroup(id, data)` - 更新组别信息
- `deleteCompetitionGroup(id)` - 删除组别

### 结果管理
- `getPublishedCompetitionResults()` - 获取已公布的比赛结果
- `getCompetitionResultsByGroup(groupId)` - 按组别获取比赛结果
- `getAllCompetitionResults()` - 获取所有比赛结果（管理员）
- `createCompetitionResult(data)` - 创建比赛结果
- `updateCompetitionResult(id, data)` - 更新比赛结果
- `publishCompetitionResult(id)` - 公布比赛结果
- `unpublishCompetitionResult(id)` - 取消公布比赛结果
- `deleteCompetitionResult(id)` - 删除比赛结果

## 前端页面

### ResultsPage.tsx
公众查看比赛结果的页面，按组别和奖项等级展示获奖名单。

### AdminPage.tsx
管理员管理比赛结果的页面，包含组别管理和结果管理功能。

### 新增组件
- `ResultForm.tsx` - 比赛结果表单组件
- `GroupForm.tsx` - 比赛组别表单组件
- `BatchImportResults.tsx` - 批量导入比赛结果组件

## 后续可扩展功能

1. 获奖证书生成功能
2. 结果导出为Excel或PDF格式
3. 增加评委打分功能
4. 支持获奖者照片展示
5. 添加评论和点赞功能