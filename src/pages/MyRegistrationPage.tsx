import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRegistrationsByUserId, getUserRelatedRegistrations, getCompetitionResultsByRegistrationId } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Upload, Clock, CheckCircle, XCircle, Image as ImageIcon, Users, Trophy } from 'lucide-react';
import type { RegistrationWithWorks, CompetitionResultWithDetails } from '@/types/types';

// 调试组件
const DebugInfo = ({ user, profile, registrations }: { user: any; profile: any; registrations: any[] }) => {
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-4">
      <h2 className="text-lg font-bold mb-2">调试信息</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-bold">用户信息:</h3>
          <pre className="text-xs overflow-auto bg-white p-2 rounded">
            {JSON.stringify({ id: user?.id }, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-bold">资料信息:</h3>
          <pre className="text-xs overflow-auto bg-white p-2 rounded">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-bold">报名信息:</h3>
          <pre className="text-xs overflow-auto bg-white p-2 rounded">
            {JSON.stringify(registrations, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default function MyRegistrationPage() {
  const { user, profile } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationWithWorks[]>([]);
  const [results, setResults] = useState<Record<string, CompetitionResultWithDetails[]>>({});
  const [loading, setLoading] = useState(true);

  // 缓存团队角色信息，避免重复计算
  const teamRoles = useMemo(() => {
    const roles: Record<string, string> = {};
    registrations.forEach(registration => {
      roles[registration.id] = getUserRoleInTeam(registration);
    });
    return roles;
  }, [registrations, user?.id, profile?.real_name]);

  useEffect(() => {
    console.log('MyRegistrationPage useEffect 被调用', { user, profile });
    if (user) {
      loadRegistrations();
    }
  }, [user, profile]);

  const loadRegistrations = async () => {
    console.log('loadRegistrations 被调用');
    if (!user) {
      console.log('没有用户信息，返回');
      return;
    }
    
    setLoading(true);
    
    try {
      // 如果有用户资料，获取用户相关的所有报名信息
      // 否则只获取用户自己创建的报名信息
      let data: RegistrationWithWorks[] = [];
      if (profile?.real_name) {
        console.log('获取用户相关的报名信息，使用 profile:', profile);
        data = await getUserRelatedRegistrations(profile);
      } else {
        console.log('获取用户自己创建的报名信息，使用 user.id:', user.id);
        data = await getRegistrationsByUserId(user.id);
      }
      
      console.log('获取到的报名信息:', data);
      setRegistrations(data);
      
      // 获取每个报名的比赛结果
      const resultsData: Record<string, CompetitionResultWithDetails[]> = {};
      for (const registration of data) {
        console.log('正在获取报名ID的比赛结果:', registration.id);
        const registrationResults = await getCompetitionResultsByRegistrationId(registration.id);
        console.log('获取到的比赛结果:', registrationResults);
        resultsData[registration.id] = registrationResults;
      }
      console.log('所有比赛结果数据:', resultsData);
      setResults(resultsData);
    } catch (err) {
      console.error('加载报名信息时发生错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            待审核
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="gap-1 bg-secondary text-secondary-foreground">
            <CheckCircle className="w-3 h-3" />
            已通过
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            未通过
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 获取赛道类型显示文本
  const getTrackTypeText = (trackType: string) => {
    switch (trackType) {
      case 'student-individual':
        return '学生个人赛';
      case 'student-team':
        return '学生团队赛';
      case 'teacher-individual':
        return '教师个人赛';
      case 'teacher-team':
        return '教师团队赛';
      case 'student-instructor':
        return '学生赛道（指导教师）';
      default:
        return '未知赛道';
    }
  };

  // 获取奖项等级显示文本
  const getAwardLevelText = (awardLevel: string) => {
    switch (awardLevel) {
      case 'first_prize':
        return '一等奖';
      case 'second_prize':
        return '二等奖';
      case 'third_prize':
        return '三等奖';
      case 'honorable_mention':
        return '优胜奖';
      default:
        return awardLevel;
    }
  };

  // 获取用户在团队中的角色
  const getUserRoleInTeam = (registration: RegistrationWithWorks) => {
    console.log('getUserRoleInTeam 被调用', { registration, profile });
    if (!profile?.real_name) return '';
    
    if (registration.team_leader === profile.real_name) {
      return '（队长）';
    } else if (registration.instructor_name === profile.real_name) {
      return '（指导教师）';
    } else if (registration.team_members) {
      // 检查是否为团队成员，需要处理带学工号的情况
      const members = registration.team_members.split(',').map(m => m.trim());
      for (const member of members) {
        // 处理 "张三(20210001)" 格式
        let memberName = member;
        if (member.includes('(')) {
          memberName = member.substring(0, member.indexOf('(')).trim();
        }
        
        if (memberName === profile.real_name) {
          return '（成员）';
        }
        
        // 也检查带括号的格式
        if (member.includes(`(${profile.real_name}`) || member.includes(`${profile.real_name})`)) {
          return '（成员）';
        }
        
        // 检查 "张三 (20210001)" 格式（中间有空格）
        if (member.match(new RegExp(`${profile.real_name}\\s*\\(`))) {
          return '（成员）';
        }
        
        // 检查是否直接匹配（处理没有学工号的情况）
        if (member === profile.real_name) {
          return '（成员）';
        }
      }
    }
    return '';
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 xl:px-8">
          <Card>
            <CardHeader>
              <CardTitle>请先登录</CardTitle>
              <CardDescription>登录后查看您的报名信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button>前往登录</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-7xl mx-auto px-4 xl:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">我的报名</h1>
          <p className="text-muted-foreground">查看和管理您的报名信息</p>
        </div>

        <DebugInfo user={user} profile={profile} registrations={registrations} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3 bg-muted" />
                  <Skeleton className="h-4 w-1/4 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>暂无报名记录</CardTitle>
              <CardDescription>您还没有提交任何报名信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/register">
                <Button className="gap-2">
                  <FileText className="w-4 h-4" />
                  立即报名
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {registrations.map((registration) => (
              <Card key={registration.id} className="shadow-elegant">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{registration.project_name || '未命名项目'}</CardTitle>
                      <CardDescription>
                        报名时间: {new Date(registration.created_at).toLocaleDateString('zh-CN')}
                        {teamRoles[registration.id] && (
                          <span className="ml-2 text-primary">{teamRoles[registration.id]}</span>
                        )}
                      </CardDescription>
                    </div>
                    {getStatusBadge(registration.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">姓名：</span>
                      <span className="font-medium">{registration.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">联系电话：</span>
                      <span className="font-medium">{registration.phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">邮箱：</span>
                      <span className="font-medium">{registration.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">学校/单位：</span>
                      <span className="font-medium">{registration.school}</span>
                    </div>
                    {registration.major && (
                      <div>
                        <span className="text-muted-foreground">专业：</span>
                        <span className="font-medium">{registration.major}</span>
                      </div>
                    )}
                    {registration.track_type && (
                      <div>
                        <span className="text-muted-foreground">参赛赛道：</span>
                        <span className="font-medium">{getTrackTypeText(registration.track_type)}</span>
                        {(() => {
                          const role = teamRoles[registration.id];
                          const cleanRole = role?.replace('（', '').replace('）', '');
                          return cleanRole ? <Badge variant="secondary" className="ml-2">{cleanRole}</Badge> : null;
                        })()}
                      </div>
                    )}
                    {registration.team_name && (
                      <div>
                        <span className="text-muted-foreground">团队名称：</span>
                        <span className="font-medium">{registration.team_name}</span>
                      </div>
                    )}
                    {registration.team_leader && (
                      <div>
                        <span className="text-muted-foreground">团队队长：</span>
                        <span className="font-medium">{registration.team_leader}</span>
                      </div>
                    )}
                    {registration.instructor_name && (
                      <div>
                        <span className="text-muted-foreground">指导教师：</span>
                        <span className="font-medium">{registration.instructor_name}</span>
                      </div>
                    )}
                    {registration.application_direction && (
                      <div>
                        <span className="text-muted-foreground">应用方向：</span>
                        <span className="font-medium">{registration.application_direction}</span>
                      </div>
                    )}
                  </div>

                  {registration.team_members && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        团队成员：
                      </p>
                      <p className="text-sm">{registration.team_members}</p>
                    </div>
                  )}

                  {registration.project_description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">项目描述：</p>
                      <p className="text-sm">{registration.project_description}</p>
                    </div>
                  )}

                  {(registration.works && registration.works.length > 0) || (results[registration.id] && results[registration.id].length > 0) && (
                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        已提交作品 ({registration.works?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {registration.works.map((work) => (
                          <div key={work.id} className="bg-muted rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium">{work.work_title}</h5>
                              <span className="text-xs text-muted-foreground">
                                {new Date(work.submitted_at).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            {work.work_description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {work.work_description}
                              </p>
                            )}
                            <div className="flex gap-2">
                              {work.work_url && (
                                <a
                                  href={work.work_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  查看作品链接
                                </a>
                              )}
                              {work.file_path && (
                                <a
                                  href={work.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  查看上传文件
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 比赛结果（赛程进度） - 始终显示，即使没有作品 */}
                  {results[registration.id] && (
                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        比赛结果
                      </h4>
                      {results[registration.id].length > 0 ? (
                        <div className="space-y-3">
                          {results[registration.id].map((result) => (
                            <div key={result.id} className="bg-muted rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium">{result.award_name}</h5>
                                {result.group && (
                                  <Badge variant="secondary">{result.group.name}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span>奖项等级:</span>
                                <Badge>{getAwardLevelText(result.award_level)}</Badge>
                              </div>
                              {result.ranking && (
                                <p className="text-sm mt-1">排名: 第{result.ranking}名</p>
                              )}
                              {result.score && (
                                <p className="text-sm">得分: {result.score}</p>
                              )}
                              {result.remarks && (
                                <p className="text-sm text-muted-foreground mt-1">备注: {result.remarks}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">暂无比赛结果</p>
                      )}
                    </div>
                  )}

                  {/* 只有队长或者指导教师才能提交作品 */}
                  {registration.status === 'approved' && 
                   (registration.team_leader === profile?.real_name || 
                    registration.instructor_name === profile?.real_name) && (
                    <div className="pt-4 border-t border-border">
                      <Link to="/submit-work">
                        <Button variant="outline" className="gap-2">
                          <Upload className="w-4 h-4" />
                          提交作品
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}