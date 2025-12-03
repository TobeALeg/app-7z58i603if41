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
  project_name: string;
  project_description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
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

// 扩展类型（包含关联数据）
export interface RegistrationWithWorks extends Registration {
  works?: Work[];
}

export interface WorkWithRegistration extends Work {
  registration?: Registration;
}
