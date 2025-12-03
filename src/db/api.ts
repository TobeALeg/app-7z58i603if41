import { supabase } from './supabase';
import type { Profile, Registration, Work, RegistrationWithWorks } from '@/types/types';

// ==================== Profile API ====================

export async function getCurrentUser(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }

  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取用户列表失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('更新用户角色失败:', error);
    return false;
  }

  return true;
}

// ==================== Registration API ====================

export async function createRegistration(data: Omit<Registration, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Registration | null> {
  const { data: result, error } = await supabase
    .from('registrations')
    .insert({
      user_id: data.user_id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      school: data.school,
      major: data.major || null,
      team_name: data.team_name || null,
      project_name: data.project_name,
      project_description: data.project_description || null,
      status: 'pending'
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('创建报名失败:', error);
    return null;
  }

  return result;
}

export async function getRegistrationsByUserId(userId: string): Promise<RegistrationWithWorks[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      works (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取用户报名列表失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getAllRegistrations(): Promise<RegistrationWithWorks[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      works (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取所有报名列表失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getRegistrationById(id: string): Promise<RegistrationWithWorks | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      works (*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('获取报名详情失败:', error);
    return null;
  }

  return data;
}

export async function updateRegistration(id: string, updates: Partial<Registration>): Promise<boolean> {
  const { error } = await supabase
    .from('registrations')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('更新报名信息失败:', error);
    return false;
  }

  return true;
}

export async function updateRegistrationStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<boolean> {
  return updateRegistration(id, { status });
}

// ==================== Work API ====================

export async function createWork(data: Omit<Work, 'id' | 'submitted_at'>): Promise<Work | null> {
  const { data: result, error } = await supabase
    .from('works')
    .insert({
      registration_id: data.registration_id,
      work_title: data.work_title,
      work_description: data.work_description || null,
      work_url: data.work_url || null,
      file_path: data.file_path || null
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('创建作品失败:', error);
    return null;
  }

  return result;
}

export async function getWorksByRegistrationId(registrationId: string): Promise<Work[]> {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('registration_id', registrationId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('获取作品列表失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function updateWork(id: string, updates: Partial<Work>): Promise<boolean> {
  const { error } = await supabase
    .from('works')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('更新作品信息失败:', error);
    return false;
  }

  return true;
}

export async function deleteWork(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('works')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('删除作品失败:', error);
    return false;
  }

  return true;
}

// ==================== Storage API ====================

export async function uploadWorkFile(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `works/${fileName}`;

  const { error } = await supabase.storage
    .from('app-7z58i603if41_works_images')
    .upload(filePath, file);

  if (error) {
    console.error('上传文件失败:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('app-7z58i603if41_works_images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteWorkFile(filePath: string): Promise<boolean> {
  const path = filePath.split('/works/')[1];
  if (!path) return false;

  const { error } = await supabase.storage
    .from('app-7z58i603if41_works_images')
    .remove([`works/${path}`]);

  if (error) {
    console.error('删除文件失败:', error);
    return false;
  }

  return true;
}
