import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createRegistration } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import UserSearch from '@/components/UserSearch';
import ProjectSearch from '@/components/ProjectSearch';
import type { Profile, Registration } from '@/types/types';
import { supabase } from '@/db/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 赛道类型：student-individual(学生个人), student-team(学生团队), teacher-individual(教师个人), teacher-team(教师团队)
  // 初始化表单状态
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    department: '', // 部门替代学校/单位
    major: '',
    team_name: '',
    application_direction: '', // 应用方向
    track_type: 'student-individual', // 默认为学生个人赛道
    instructor_name: '', // 指导教师姓名（学生团队需要）
    team_members: '', // 团队成员（用逗号分隔，建议使用"姓名(学号)"格式）
    team_leader: '' // 添加团队队长字段以避免undefined错误
  });

  // 自动填充用户信息
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.real_name || '',
        department: profile.organization || '', // 从用户资料中获取部门信息
        team_leader: profile.real_name || '' // 默认团队队长为当前用户
      }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      track_type: value
    }));
  };

  // 处理用户选择
  const handleUserSelect = (user: Profile) => {
    const memberText = `${user.real_name}(${user.student_id})`;
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members 
        ? `${prev.team_members}, ${memberText}` 
        : memberText
    }));
  };

  // 处理项目选择（教师作为指导教师时使用）
  const handleProjectSelect = (registration: Registration) => {
    setFormData(prev => ({
      ...prev,
      project_name: registration.project_name,
      project_description: registration.project_description || '',
      team_name: registration.team_name || '',
      team_leader: registration.team_name ? `${registration.name}(队长)` : '' // 假设第一个报名的是队长
    }));
  };

  // 确定用户角色
  const getUserRole = (): 'teacher' | 'student' => {
    // 根据身份类型判断是教师还是学生
    if (profile?.identity_type) {
      console.log('用户身份类型:', profile.identity_type);
      
      // 转换为小写以便比较
      const identityType = profile.identity_type.toLowerCase();
      
      // 教师相关关键词
      const teacherKeywords = ['教师', '教工', '职工', '讲师', '教授', '副教授', '助教', 'faculty', 'teacher'];
      
      // 学生相关关键词
      const studentKeywords = ['学生', 'student', '本科生', '研究生', '博士生'];
      
      // 检查是否包含教师关键词
      if (teacherKeywords.some(keyword => identityType.includes(keyword))) {
        console.log('识别为教师');
        return 'teacher';
      }
      
      // 检查是否包含学生关键词
      if (studentKeywords.some(keyword => identityType.includes(keyword))) {
        console.log('识别为学生');
        return 'student';
      }
    }
    
    console.log('默认识别为学生');
    // 默认为学生
    return 'student';
  };

  // 获取可用的赛道选项
  const getAvailableTracks = () => {
    const role = getUserRole();
    if (role === 'teacher') {
      return [
        { value: 'teacher-individual', label: '单人参赛' },
        { value: 'teacher-team', label: '团体参赛（教师不超过3人）' }
      ];
    } else {
      return [
        { value: 'student-individual', label: '单人参赛' },
        { value: 'student-team', label: '团体参赛（学生不超过5人）' }
      ];
    }
  };

  // 根据赛道类型更新项目名称字段的状态
  useEffect(() => {
    // 如果是教师赛道，清空项目名称字段
    if (formData.track_type.startsWith('teacher')) {
      setFormData(prev => ({
        ...prev,
        project_name: ''
      }));
    }
  }, [formData.track_type]);

  // 检查用户是否已经报名（任何形式的报名）
  const checkIfUserHasRegistered = async (): Promise<{ hasRegistered: boolean; registration?: Registration }> => {
    if (!user?.id) return { hasRegistered: false };
    
    try {
      // 查询用户是否已有任何有效的报名记录
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved']);
      
      if (error) {
        console.error('检查用户报名状态失败:', error);
        return { hasRegistered: false };
      }
      
      if (Array.isArray(data) && data.length > 0) {
        // 用户已经有有效的报名记录
        return { hasRegistered: true, registration: data[0] };
      }
      
      // 还需要检查用户是否作为团队成员、队长或指导教师出现在其他报名中
      if (profile?.real_name) {
        // 检查作为个人报名者
        const { data: personalData, error: personalError } = await supabase
          .from('registrations')
          .select('*')
          .eq('name', profile.real_name)
          .not('track_type', 'in', '("student-team","teacher-team")')
          .in('status', ['pending', 'approved']);
          
        if (!personalError && personalData && personalData.length > 0) {
          return { hasRegistered: true, registration: personalData[0] };
        }
        
        // 检查作为团队队长
        const { data: leaderData, error: leaderError } = await supabase
          .from('registrations')
          .select('*')
          .eq('team_leader', profile.real_name)
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (!leaderError && leaderData && leaderData.length > 0) {
          return { hasRegistered: true, registration: leaderData[0] };
        }
        
        // 检查作为指导教师
        const { data: instructorData, error: instructorError } = await supabase
          .from('registrations')
          .select('*')
          .eq('instructor_name', profile.real_name)
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (!instructorError && instructorData && instructorData.length > 0) {
          return { hasRegistered: true, registration: instructorData[0] };
        }
        
        // 检查作为团队成员
        const { data: memberData, error: memberError } = await supabase
          .from('registrations')
          .select('*')
          .ilike('team_members', '%' + profile.real_name + '%')
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (!memberError && memberData && memberData.length > 0) {
          return { hasRegistered: true, registration: memberData[0] };
        }
      }
      
      return { hasRegistered: false };
    } catch (err) {
      console.error('检查用户报名状态时发生错误:', err);
      return { hasRegistered: false };
    }
  };

  // 检查用户是否在某个团队中（作为成员或指导教师）
  const checkIfUserInTeam = async (): Promise<boolean> => {
    if (!user?.id || !profile?.real_name) return false;
    
    try {
      // 检查是否作为团队成员存在（使用更精确的匹配）
      const { data: memberData, error: memberError } = await supabase
        .from('registrations')
        .select('team_members')
        .not('team_members', 'is', null)
        .eq('team_members', profile.real_name); // 精确匹配而非模糊匹配
      
      if (memberError) {
        console.error('检查用户是否为团队成员失败:', memberError);
        return false;
      }
      
      // 检查是否作为指导教师存在（使用精确匹配）
      const { data: instructorData, error: instructorError } = await supabase
        .from('registrations')
        .select('instructor_name')
        .not('instructor_name', 'is', null)
        .eq('instructor_name', profile.real_name); // 精确匹配
      
      if (instructorError) {
        console.error('检查用户是否为指导教师失败:', instructorError);
        return false;
      }
      
      // 检查是否作为团队队长存在（使用精确匹配）
      const { data: leaderData, error: leaderError } = await supabase
        .from('registrations')
        .select('team_leader')
        .not('team_leader', 'is', null)
        .eq('team_leader', profile.real_name); // 精确匹配
      
      if (leaderError) {
        console.error('检查用户是否为团队队长失败:', leaderError);
        return false;
      }
      
      return (Array.isArray(memberData) && memberData.length > 0) || 
             (Array.isArray(instructorData) && instructorData.length > 0) ||
             (Array.isArray(leaderData) && leaderData.length > 0);
    } catch (err) {
      console.error('检查用户团队状态时发生错误:', err);
      return false;
    }
  };

  // 检查团队成员是否已经在其他报名中
  const checkTeamMembersDuplicate = async (teamMembers: string, teamLeader: string, instructorName?: string): Promise<{ isDuplicate: boolean; duplicateMember?: string }> => {
    if (!teamMembers && !teamLeader && !instructorName) return { isDuplicate: false };
    
    try {
      // 检查队长是否已经在任何报名中
      if (teamLeader) {
        // 检查作为个人报名者
        const { data: personalData1, error: personalError1 } = await supabase
          .from('registrations')
          .select('name')
          .eq('name', teamLeader)
          .not('track_type', 'in', '("student-team","teacher-team")')
          .in('status', ['pending', 'approved']);
          
        if (personalError1) {
          console.error('检查队长作为个人报名者重复时发生错误:', personalError1);
        } else if (personalData1 && personalData1.length > 0) {
          return { isDuplicate: true, duplicateMember: teamLeader };
        }
        
        // 检查作为团队队长
        const { data: leaderData1, error: leaderError1 } = await supabase
          .from('registrations')
          .select('team_leader')
          .eq('team_leader', teamLeader)
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (leaderError1) {
          console.error('检查队长作为其他团队队长重复时发生错误:', leaderError1);
        } else if (leaderData1 && leaderData1.length > 0) {
          return { isDuplicate: true, duplicateMember: teamLeader };
        }
        
        // 检查作为指导教师
        const { data: instData1, error: instError1 } = await supabase
          .from('registrations')
          .select('instructor_name')
          .eq('instructor_name', teamLeader)
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (instError1) {
          console.error('检查队长作为指导教师重复时发生错误:', instError1);
        } else if (instData1 && instData1.length > 0) {
          return { isDuplicate: true, duplicateMember: teamLeader };
        }
        
        // 检查作为团队成员
        const { data: memberData1, error: memberError1 } = await supabase
          .from('registrations')
          .select('team_members')
          .ilike('team_members', '%' + teamLeader + '%')
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (memberError1) {
          console.error('检查队长作为团队成员重复时发生错误:', memberError1);
        } else if (memberData1 && memberData1.length > 0) {
          return { isDuplicate: true, duplicateMember: teamLeader };
        }
      }
      
      // 检查指导教师是否已经在任何报名中
      if (instructorName) {
        // 检查作为个人报名者
        const { data: personalData2, error: personalError2 } = await supabase
          .from('registrations')
          .select('name')
          .eq('name', instructorName)
          .not('track_type', 'in', '("student-team","teacher-team")')
          .in('status', ['pending', 'approved']);
          
        if (personalError2) {
          console.error('检查指导教师作为个人报名者重复时发生错误:', personalError2);
        } else if (personalData2 && personalData2.length > 0) {
          return { isDuplicate: true, duplicateMember: instructorName };
        }
        
        // 检查作为团队队长
        const { data: leaderData2, error: leaderError2 } = await supabase
          .from('registrations')
          .select('team_leader')
          .eq('team_leader', instructorName)
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (leaderError2) {
          console.error('检查指导教师作为其他团队队长重复时发生错误:', leaderError2);
        } else if (leaderData2 && leaderData2.length > 0) {
          return { isDuplicate: true, duplicateMember: instructorName };
        }
        
        // 检查作为指导教师
        const { data: instData2, error: instError2 } = await supabase
          .from('registrations')
          .select('instructor_name')
          .eq('instructor_name', instructorName)
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (instError2) {
          console.error('检查指导教师作为其他指导教师重复时发生错误:', instError2);
        } else if (instData2 && instData2.length > 0) {
          return { isDuplicate: true, duplicateMember: instructorName };
        }
        
        // 检查作为团队成员
        const { data: memberData2, error: memberError2 } = await supabase
          .from('registrations')
          .select('team_members')
          .ilike('team_members', '%' + instructorName + '%')
          .in('track_type', ['student-team', 'teacher-team'])
          .in('status', ['pending', 'approved']);
          
        if (memberError2) {
          console.error('检查指导教师作为团队成员重复时发生错误:', memberError2);
        } else if (memberData2 && memberData2.length > 0) {
          return { isDuplicate: true, duplicateMember: instructorName };
        }
      }
      
      // 检查团队成员是否已经在任何报名中
      if (teamMembers) {
        const members = teamMembers.split(',').map(m => m.trim()).filter(m => m.length > 0);
        for (const member of members) {
          let memberName = member;
          
          // 提取成员姓名（去除可能的学工号部分）
          if (member.includes('(')) {
            memberName = member.substring(0, member.indexOf('(')).trim();
          }
          
          if (memberName) {
            // 检查作为个人报名者
            const { data: personalData3, error: personalError3 } = await supabase
              .from('registrations')
              .select('name')
              .eq('name', memberName)
              .not('track_type', 'in', '("student-team","teacher-team")')
              .in('status', ['pending', 'approved']);
              
            if (personalError3) {
              console.error('检查成员作为个人报名者重复时发生错误:', personalError3);
            } else if (personalData3 && personalData3.length > 0) {
              return { isDuplicate: true, duplicateMember: memberName };
            }
            
            // 检查作为团队队长
            const { data: leaderData3, error: leaderError3 } = await supabase
              .from('registrations')
              .select('team_leader')
              .eq('team_leader', memberName)
              .in('track_type', ['student-team', 'teacher-team'])
              .in('status', ['pending', 'approved']);
              
            if (leaderError3) {
              console.error('检查成员作为其他团队队长重复时发生错误:', leaderError3);
            } else if (leaderData3 && leaderData3.length > 0) {
              return { isDuplicate: true, duplicateMember: memberName };
            }
            
            // 检查作为指导教师
            const { data: instData3, error: instError3 } = await supabase
              .from('registrations')
              .select('instructor_name')
              .eq('instructor_name', memberName)
              .in('track_type', ['student-team', 'teacher-team'])
              .in('status', ['pending', 'approved']);
              
            if (instError3) {
              console.error('检查成员作为其他指导教师重复时发生错误:', instError3);
            } else if (instData3 && instData3.length > 0) {
              return { isDuplicate: true, duplicateMember: memberName };
            }
            
            // 检查作为团队成员
            const { data: memberData3, error: memberError3 } = await supabase
              .from('registrations')
              .select('team_members')
              .ilike('team_members', '%' + memberName + '%')
              .in('track_type', ['student-team', 'teacher-team'])
              .in('status', ['pending', 'approved']);
              
            if (memberError3) {
              console.error('检查成员作为团队成员重复时发生错误:', memberError3);
            } else if (memberData3 && memberData3.length > 0) {
              return { isDuplicate: true, duplicateMember: memberName };
            }
          }
        }
      }
      
      return { isDuplicate: false };
    } catch (err) {
      console.error('检查团队成员重复时发生错误:', err);
      return { isDuplicate: false };
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: '错误',
        description: '请输入姓名',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: '错误',
        description: '请输入联系电话',
        variant: 'destructive'
      });
      return false;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast({
        title: '错误',
        description: '请输入正确的手机号码',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: '错误',
        description: '请输入电子邮箱',
        variant: 'destructive'
      });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: '错误',
        description: '请输入正确的邮箱地址',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.department?.trim()) {
      toast({
        title: '错误',
        description: '请输入部门',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.application_direction?.trim()) {
      toast({
        title: '错误',
        description: '请选择应用方向',
        variant: 'destructive'
      });
      return false;
    }

    // 验证团队相关信息
    if (formData.track_type === 'student-team' || formData.track_type === 'teacher-team') {
      if (!formData.team_name.trim()) {
        toast({
          title: '错误',
          description: '请输入团队名称',
          variant: 'destructive'
        });
        return false;
      }

      // 团队队长在团队报名时默认为当前用户，无需额外验证
      
      // 验证团队成员数量
      if (formData.track_type === 'student-team' && formData.team_members?.trim()) {
        const members = formData.team_members.split(',').filter(member => member.trim() !== '');
        if (members.length > 4) { // 加上队长总共5人
          toast({
            title: '错误',
            description: '学生团队成员不得超过5人（包括队长）',
            variant: 'destructive'
          });
          return false;
        }
      }
      
      if (formData.track_type === 'teacher-team' && formData.team_members?.trim()) {
        const members = formData.team_members.split(',').filter(member => member.trim() !== '');
        if (members.length > 2) { // 加上队长总共3人
          toast({
            title: '错误',
            description: '教师团队成员不得超过3人（包括队长）',
            variant: 'destructive'
          });
          return false;
        }
      }
    }

    if (formData.track_type === 'student-team') {
      if (!formData.instructor_name || !formData.instructor_name.trim()) {
        toast({
          title: '错误',
          description: '请输入指导教师姓名',
          variant: 'destructive'
        });
        return false;
      }
    }

    // 个人赛道（无论是学生还是教师）都有相同的验证要求
    if (formData.track_type === 'student-individual' || formData.track_type === 'teacher-individual') {
      // 个人赛道只需要基本信息验证，已在上面完成
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: '错误',
        description: '请先登录',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    // 检查用户是否已经报名
    const { hasRegistered, registration } = await checkIfUserHasRegistered();
    if (hasRegistered) {
      toast({
        title: '报名失败',
        description: `您已经报名过比赛，当前状态为：${getStatusDisplayName(registration!.status)}。根据规定，只有在报名被拒绝后才能重新报名。`,
        variant: 'destructive'
      });
      return;
    }

    // 检查用户是否已经在某个团队中
    const isInTeam = await checkIfUserInTeam();
    if (isInTeam) {
      toast({
        title: '报名失败',
        description: '您已经是其他团队的成员、队长或指导教师，无法再次报名',
        variant: 'destructive'
      });
      return;
    }

    // 如果是团队报名，检查团队成员是否已经在其他团队中
    if (formData.track_type === 'student-team' || formData.track_type === 'teacher-team') {
      const { isDuplicate, duplicateMember } = await checkTeamMembersDuplicate(
        formData.team_members || '', 
        formData.team_leader || '', 
        formData.instructor_name
      );
      
      if (isDuplicate) {
        toast({
          title: '报名失败',
          description: `团队成员 ${duplicateMember} 已经在其他团队中，无法重复加入`,
          variant: 'destructive'
        });
        return;
      }
      
      // 检查指导教师是否已经在其他团队中担任指导教师
      if (formData.instructor_name) {
        const { data: existingInstructorRegs, error: instructorCheckError } = await supabase
          .from('registrations')
          .select('id')
          .in('status', ['pending', 'approved'])
          .in('track_type', ['student-team', 'teacher-team'])
          .eq('instructor_name', formData.instructor_name);
        
        if (instructorCheckError) {
          console.error('检查指导教师状态失败:', instructorCheckError);
        } else if (existingInstructorRegs && existingInstructorRegs.length > 0) {
          toast({
            title: '报名失败',
            description: `指导教师 ${formData.instructor_name} 已经在其他团队中担任指导教师，无法重复指导`,
            variant: 'destructive'
          });
          return;
        }
      }
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // 构造提交数据
    const submissionData = {
      user_id: user.id,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      school: formData.department.trim(), // 使用部门字段替代学校
      major: (getUserRole() === 'student' ? formData.major?.trim() : null) || null, // 教师不需要专业
      team_name: formData.team_name?.trim() || null,
      project_name: null, // 移除项目名称字段，始终为null
      application_direction: formData.application_direction?.trim() || null, // 添加应用方向
      project_description: null, // 移除项目描述
      track_type: formData.track_type as 'student-individual' | 'student-team' | 'teacher-individual' | 'teacher-team' | 'student-instructor',
      // 教师作为指导教师时，自己就是指导教师，不需要额外输入
      instructor_name: formData.track_type === 'student-instructor' 
        ? (profile?.real_name || formData.name) 
        : (formData.instructor_name?.trim() || null),
      team_members: formData.team_members?.trim() || null,
      team_leader: formData.team_leader?.trim() || null // 团队队长默认为当前用户
    };

    try {
      const result = await createRegistration(submissionData);

      setLoading(false);

      if (result) {
        toast({
          title: '报名成功',
          description: '您的报名信息已提交，请等待审核'
        });
        navigate('/my-registration');
      } else {
        toast({
          title: '报名失败',
          description: '提交失败，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setLoading(false);
      toast({
        title: '报名失败',
        description: error.message || '提交失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const userRole = getUserRole();
  const availableTracks = getAvailableTracks();
  
  // 获取状态显示名称
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-glow">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">比赛报名</CardTitle>
                <CardDescription>请填写以下信息完成报名</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 角色提醒 */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {userRole === 'teacher' ? '教师用户' : '学生用户'}
                </p>
                <p className="text-sm text-blue-700">
                  {userRole === 'teacher' 
                    ? '个人或者团体报名，需要每位用户（包括每位团队成员）先登录平台激活账号才能顺利完成报名'
                    : '个人或者团体报名，需要每位用户（包括每位团队成员）先登录平台激活账号才能顺利完成报名'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="请输入您的姓名"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话 <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="请输入手机号码"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">电子邮箱 <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">部门 <span className="text-destructive">*</span></Label>
                  <Input
                    id="department"
                    name="department"
                    placeholder="请输入部门名称"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* 只有学生才显示专业输入框 */}
                {userRole === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="major">专业</Label>
                    <Input
                      id="major"
                      name="major"
                      placeholder="请输入专业（选填）"
                      value={formData.major}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="track_type">参赛方式 <span className="text-destructive">*</span></Label>
                  <Select 
                    name="track_type" 
                    value={formData.track_type} 
                    onValueChange={handleSelectChange}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择参赛赛道" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTracks.map(track => (
                        <SelectItem key={track.value} value={track.value}>
                          {track.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application_direction">应用方向 <span className="text-destructive">*</span></Label>
                  <Select 
                    name="application_direction" 
                    value={formData.application_direction} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, application_direction: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择应用方向" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="教学赋能">教学赋能</SelectItem>
                      <SelectItem value="科研增效">科研增效</SelectItem>
                      <SelectItem value="管理提效">管理提效</SelectItem>
                      <SelectItem value="服务提质">服务提质</SelectItem>
                      <SelectItem value="其他方向">其他方向</SelectItem>
                    </SelectContent>
                  </Select>
                </div>



                {/* 个人赛道不显示额外字段，保持简洁 */}
                {/* 团队赛道显示团队相关信息 */}
                {(formData.track_type === 'student-team' || formData.track_type === 'teacher-team') && (
                  <div className="space-y-2">
                    <Label htmlFor="team_name">团队名称 <span className="text-destructive">*</span></Label>
                    <Input
                      id="team_name"
                      name="team_name"
                      placeholder="请输入团队名称"
                      value={formData.team_name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                )}

                {formData.track_type === 'student-team' && (
                  <>
                    <div className="space-y-2 xl:col-span-2">
                      <Label htmlFor="instructor_name">指导教师 <span className="text-destructive">*</span></Label>
                      <Input
                        id="instructor_name"
                        name="instructor_name"
                        placeholder="输入指导教师姓名+教职工号，例如：张三(123456)"
                        value={formData.instructor_name}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <p className="text-sm text-red-500">
                        输入格式：姓名(教职工号)，例如：张三(123456)
                      </p>
                    </div>

                    <div className="space-y-2 xl:col-span-2">
                      <Label htmlFor="team_members">团队成员</Label>
                      <UserSearch 
                        onSelect={handleUserSelect}
                        placeholder="搜索并添加团队成员..."
                        disabled={loading}
                        userTypeFilter="student" // 只搜索学生
                        currentUser={profile} // 排除当前用户
                        maxUsers={4} // 学生团队最多4个成员（加上队长总共5人）
                        selectedUsers={formData.team_members ? 
                          formData.team_members.split(',').map(name => ({ 
                            id: name, 
                            real_name: name,
                            student_id: '',
                            identity_type: '',
                            username: null,
                            role: 'user',
                            created_at: '',
                            organization: null
                          })) : []}
                      />
                      <Input
                        id="team_members"
                        name="team_members"
                        placeholder="已添加的团队成员会显示在这里"
                        value={formData.team_members}
                        onChange={handleChange}
                        disabled={loading}
                        className="mt-2"
                      />
                      <p className="text-sm text-red-500">
                        每位用户需要先登录过报名平台才能在搜索框检索到该用户，学生团队成员总数不得超过5人（包括队长），教师团队成员总数不得超过3人（包括队长）
                      </p>
                    </div>
                    
                    <input
                      type="hidden"
                      name="team_leader"
                      value={formData.team_leader}
                    />
                  </>
                )}

                {/* 教师作为指导教师参与学生项目 */}
                {formData.track_type === 'student-instructor' && (
                  <>
                    <div className="space-y-2 xl:col-span-2">
                      <Label htmlFor="project_search">搜索学生项目</Label>
                      <ProjectSearch 
                        onSelect={handleProjectSelect}
                        placeholder="搜索学生项目以作为指导教师参与..."
                        disabled={loading}
                      />
                      <p className="text-sm text-muted-foreground">
                        您可以搜索学生已经创建的项目，作为指导教师参与该项目
                      </p>
                    </div>
                    
                    {/* 教师作为指导教师时，不需要再输入指导教师姓名，因为教师本人就是指导教师 */}
                  </>
                )}
                
                {formData.track_type === 'teacher-team' && (
                  <div className="space-y-2 xl:col-span-2">
                    <Label htmlFor="team_members">团队成员</Label>
                    <UserSearch 
                      onSelect={handleUserSelect}
                      placeholder="搜索并添加团队成员..."
                      disabled={loading}
                      userTypeFilter="teacher" // 只搜索教师
                      currentUser={profile} // 排除当前用户
                      maxUsers={2} // 教师团队最多2个成员（加上队长总共3人）
                      selectedUsers={formData.team_members ? 
                        formData.team_members.split(',').map(name => ({ 
                          id: name, 
                          real_name: name,
                          student_id: '',
                          identity_type: '',
                          username: null,
                          role: 'user',
                          created_at: '',
                          organization: null
                        })) : []}
                    />
                    <Input
                      id="team_members"
                      name="team_members"
                      placeholder="已添加的团队成员会显示在这里"
                      value={formData.team_members}
                      onChange={handleChange}
                      disabled={loading}
                      className="mt-2"
                    />
                    <p className="text-sm text-red-500">
                      每位用户需要先登录过报名平台才能在搜索框检索到该用户，学生团队成员总数不得超过5人（包括队长），教师团队成员总数不得超过3人（包括队长）
                    </p>
                    <input
                      type="hidden"
                      name="team_leader"
                      value={formData.team_leader}
                    />
                  </div>
                )}
              </div>

              {/* 项目描述已移至作品提交页面 */}

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      提交报名
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}