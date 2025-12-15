// 数据库表类型定义

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username: string | null;
  role: UserRole;
  student_id: string | null;
  real_name: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  created_at: string;
  identity_type?: string | null; // 身份类型（从OAuth获取）
  organization?: string | null; // 组织机构（从OAuth获取）
}

export interface Registration {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  school: string;
  major: string | null;
  team_name: string | null;
  project_name: string | null;  // 保留字段定义但不再使用
  application_direction: string | null;
  project_description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  // 新增字段
  track_type?: 'student-individual' | 'student-team' | 'teacher-individual' | 'teacher-team' | 'student-instructor' | null;
  instructor_name?: string | null;
  team_members?: string | null;
  team_leader?: string | null;
}

export interface Work {
  id: string;
  registration_id: string;
  work_title: string;
  work_description: string | null;
  work_url: string | null;
  file_path: string | null;
  submitted_at: string;
}

// 比赛组别
export interface CompetitionGroup {
  id: string;
  name: string;
  description: string | null;
  order_number: number;
  created_at: string;
}

// 比赛结果
export interface CompetitionResult {
  id: string;
  registration_id: string;
  group_id: string;
  award_level: 'first_prize' | 'second_prize' | 'third_prize' | 'honorable_mention';
  award_name: string;
  ranking: number | null;
  score: number | null;
  remarks: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// 扩展类型（包含关联数据）
export interface RegistrationWithWorks extends Registration {
  works?: Work[];
  profile?: Profile; // 关联的用户资料
}

export interface WorkWithRegistration extends Work {
  registration?: Registration;
}

export interface CompetitionResultWithDetails extends CompetitionResult {
  registration?: RegistrationWithWorks;
  group?: CompetitionGroup;
}