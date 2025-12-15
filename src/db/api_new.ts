import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import { uploadLargeFile } from '@/lib/fileChunkUploader';
import type { 
  Profile, 
  Registration, 
  Work, 
  RegistrationWithWorks, 
  CompetitionGroup, 
  CompetitionResult, 
  CompetitionResultWithDetails 
} from '@/types/types';

// 初始化用于分片上传的 Supabase 客户端
const uploadSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ==================== Profile API ====================

export async function getCurrentUser(): Promise<Profile | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('Supabase auth getUser 结果:', { user, authError });
  if (authError && authError.name !== 'AuthSessionMissingError') {
    console.error('获取认证用户失败:', authError);
    return null;
  }

  // 即使有AuthSessionMissingError，也要尝试获取用户信息
  if (!user) {
    // 尝试刷新会话
    console.log('尝试刷新会话');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('会话信息:', { session: sessionData?.session, error: sessionError });
    
    if (sessionData?.session?.user) {
      console.log('从会话中获取到用户信息');
      // 如果能从会话中获取到用户，继续处理
    } else {
      console.log('未获取到用户信息');
      return null;
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || sessionData?.session?.user?.id)
    .maybeSingle();

  console.log('从profiles表获取用户数据:', { data, error });
  
  if (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }

  // 如果没有找到profile数据，尝试创建一个
  if (!data) {
    console.log('未找到profile数据，尝试创建一个新的');
    try {
      const userData = (user?.user_metadata || sessionData?.session?.user?.user_metadata) || {};
      const userId = user?.id || sessionData?.session?.user?.id;
      const userEmail = user?.email || sessionData?.session?.user?.email;
      
      if (!userId) {
        console.log('无法确定用户ID');
        return null;
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: userData.username || userData.name || userEmail?.split('@')[0] || null,
          role: 'user',
          student_id: userData.student_id || null,
          real_name: userData.real_name || userData.name || null,
          oauth_provider: userData.provider || null,
          oauth_id: userData.oauth_id || null,
          identity_type: userData.identity_type || null,
          organization: userData.organization || null
        })
        .select()
        .maybeSingle();
      
      console.log('创建profile结果:', { data: insertData, error: insertError });
      return insertData || null;
    } catch (insertError) {
      console.error('创建profile失败:', insertError);
    }
  }

  return data;
}

// 根据学工号搜索用户
export async function searchUsersByStudentId(studentId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('student_id', `%${studentId}%`)
    .limit(10);

  if (error) {
    console.error('搜索用户失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// 根据姓名搜索用户
export async function searchUsersByName(name: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('real_name', `%${name}%`)
    .limit(10);

  if (error) {
    console.error('搜索用户失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// 根据项目名称搜索学生报名信息
export async function searchStudentRegistrationsByProjectName(projectName: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      profile:profiles(real_name, student_id, identity_type)
    `)
    .ilike('project_name', `%${projectName}%`)
    .limit(10);

  if (error) {
    console.error('搜索学生报名信息失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
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
      track_type: data.track_type || null,
      instructor_name: data.instructor_name || null,
      team_members: data.team_members || null,
      team_leader: data.team_leader || null,
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

// ==================== Competition Groups API ====================

export async function getAllCompetitionGroups(): Promise<CompetitionGroup[]> {
  const { data, error } = await supabase
    .from('competition_groups')
    .select('*')
    .order('order_number', { ascending: true });

  if (error) {
    console.error('获取比赛组别列表失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getCompetitionGroupById(id: string): Promise<CompetitionGroup | null> {
  const { data, error } = await supabase
    .from('competition_groups')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('获取比赛组别详情失败:', error);
    return null;
  }

  return data;
}

export async function createCompetitionGroup(data: Omit<CompetitionGroup, 'id' | 'created_at'>): Promise<CompetitionGroup | null> {
  const { data: result, error } = await supabase
    .from('competition_groups')
    .insert({
      name: data.name,
      description: data.description || null,
      order_number: data.order_number || 0
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('创建比赛组别失败:', error);
    return null;
  }

  return result;
}

export async function updateCompetitionGroup(id: string, updates: Partial<CompetitionGroup>): Promise<boolean> {
  const { error } = await supabase
    .from('competition_groups')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('更新比赛组别失败:', error);
    return false;
  }

  return true;
}

export async function deleteCompetitionGroup(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('competition_groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('删除比赛组别失败:', error);
    return false;
  }

  return true;
}

// ==================== Competition Results API ====================

export async function getPublishedCompetitionResults(): Promise<CompetitionResultWithDetails[]> {
  const { data, error } = await supabase
    .from('competition_results')
    .select(`
      *,
      registration:registrations!inner(*, works (*)),
      group:competition_groups!inner(*)
    `)
    .eq('published', true)
    .order('group_id')
    .order('award_level');

  if (error) {
    console.error('获取已公布的比赛结果失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getCompetitionResultsByGroup(groupId: string): Promise<CompetitionResultWithDetails[]> {
  const { data, error } = await supabase
    .from('competition_results')
    .select(`
      *,
      registration:registrations!inner(*, works (*)),
      group:competition_groups!inner(*)
    `)
    .eq('group_id', groupId)
    .order('award_level');

  if (error) {
    console.error('获取比赛组别结果失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getAllCompetitionResults(): Promise<CompetitionResultWithDetails[]> {
  const { data, error } = await supabase
    .from('competition_results')
    .select(`
      *,
      registration:registrations!inner(*, works (*)),
      group:competition_groups!inner(*)
    `)
    .order('group_id')
    .order('award_level');

  if (error) {
    console.error('获取所有比赛结果失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function createCompetitionResult(data: Omit<CompetitionResult, 'id' | 'created_at' | 'updated_at' | 'published' | 'published_at'>): Promise<CompetitionResult | null> {
  console.log('开始创建比赛结果，传入数据:', data);
  
  const { data: result, error } = await supabase
    .from('competition_results')
    .insert({
      registration_id: data.registration_id,
      group_id: data.group_id,
      award_level: data.award_level,
      award_name: data.award_name,
      ranking: data.ranking || null,
      score: data.score || null,
      remarks: data.remarks || null,
      published: false
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('创建比赛结果失败:', error);
    return null;
  }
  
  console.log('创建比赛结果成功:', result);
  return result;
}

export async function updateCompetitionResult(id: string, updates: Partial<CompetitionResult>): Promise<boolean> {
  const { error } = await supabase
    .from('competition_results')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('更新比赛结果失败:', error);
    return false;
  }

  return true;
}

export async function publishCompetitionResult(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('competition_results')
    .update({ 
      published: true,
      published_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('公布比赛结果失败:', error);
    return false;
  }

  return true;
}

export async function unpublishCompetitionResult(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('competition_results')
    .update({ 
      published: false,
      published_at: null
    })
    .eq('id', id);

  if (error) {
    console.error('取消公布比赛结果失败:', error);
    return false;
  }

  return true;
}

export async function deleteCompetitionResult(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('competition_results')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('删除比赛结果失败:', error);
    return false;
  }

  return true;
}

// ==================== Storage API ====================

/**
 * 上传作品文件（支持大文件分片上传）
 * @param file 要上传的文件
 * @param onProgress 进度回调函数
 * @returns 文件的公共URL或null（如果失败）
 */
export async function uploadWorkFile(file: File, onProgress?: (progress: number) => void): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `works/${fileName}`;

  // 添加调试日志
  console.log('准备上传文件:', {
    name: file.name,
    size: file.size,
    type: file.type,
    fileName: fileName,
    filePath: filePath
  });

  try {
    // 对大文件使用分片上传
    if (file.size > 50 * 1024 * 1024) { // 大于50MB的文件使用分片上传
      console.log('文件较大，使用分片上传方式');
      
      const { data, error } = await uploadLargeFile(
        uploadSupabase,
        file,
        'app-7z58i603if41_works_images',
        filePath,
        {
          chunkSize: 10 * 1024 * 1024, // 10MB 每个分片
          onProgress: onProgress || ((progress) => {
            console.log(`上传进度: ${progress.toFixed(2)}%`);
          })
        }
      );

      if (error) {
        console.error('分片上传失败:', error);
        return null;
      }

      console.log('分片上传成功:', data);
      
      const { data: urlData } = uploadSupabase.storage
        .from('app-7z58i603if41_works_images')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } else {
      // 对于较小的文件，使用标准上传
      console.log('文件较小，使用标准上传方式');
      
      // 确保为文件设置正确的MIME类型
      let contentType = 'application/octet-stream';
      if (file.type) {
        contentType = file.type;
      } else {
        // 根据文件扩展名推断MIME类型
        const ext = file.name.split('.').pop()?.toLowerCase();
        switch (ext) {
          case 'zip':
            contentType = 'application/zip';
            break;
          case 'rar':
            contentType = 'application/x-rar-compressed';
            break;
          case '7z':
            contentType = 'application/x-7z-compressed';
            break;
          case 'tar':
            contentType = 'application/x-tar';
            break;
          default:
            contentType = 'application/octet-stream';
        }
      }
      
      const { error } = await supabase.storage
        .from('app-7z58i603if41_works_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType
        });

      if (error) {
        console.error('上传文件失败:', error);
        // 显示更详细的错误信息
        console.error('错误详情:', {
          name: error.name,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details
        });
        return null;
      }

      const { data } = supabase.storage
        .from('app-7z58i603if41_works_images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    }
  } catch (error) {
    console.error('上传过程中发生异常:', error);
    return null;
  }
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