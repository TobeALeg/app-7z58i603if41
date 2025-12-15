import { useState, useEffect } from 'react';
import { 
  getAllRegistrations, 
  updateRegistrationStatus, 
  getAllProfiles, 
  updateUserRole,
  getAllCompetitionGroups,
  getAllCompetitionResults,
  createCompetitionResult,
  updateCompetitionResult,
  publishCompetitionResult,
  unpublishCompetitionResult,
  deleteCompetitionResult,
  createCompetitionGroup,
  updateCompetitionGroup,
  deleteCompetitionGroup
} from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import ResultForm from '@/components/results/ResultForm';
import GroupForm from '@/components/results/GroupForm';
import BatchImportResults from '@/components/results/BatchImportResults';
import type { RegistrationWithWorks, Profile, CompetitionGroup, CompetitionResultWithDetails, CompetitionResult } from '@/types/types';

export default function AdminPage() {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<RegistrationWithWorks[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<CompetitionGroup[]>([]);
  const [results, setResults] = useState<CompetitionResultWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // 表单相关状态
  const [resultFormOpen, setResultFormOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<CompetitionResultWithDetails | null>(null);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CompetitionGroup | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [regsData, profilesData, groupsData, resultsData] = await Promise.all([
      getAllRegistrations(),
      getAllProfiles(),
      getAllCompetitionGroups(),
      getAllCompetitionResults()
    ]);
    setRegistrations(regsData);
    setProfiles(profilesData);
    setGroups(groupsData);
    setResults(resultsData);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id);
    const success = await updateRegistrationStatus(id, status);
    setUpdating(null);

    if (success) {
      toast({
        title: '更新成功',
        description: `报名状态已更新为${status === 'approved' ? '已通过' : '未通过'}`
      });
      loadData();
    } else {
      toast({
        title: '更新失败',
        description: '状态更新失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateRole = async (userId: string, role: 'user' | 'admin') => {
    setUpdating(userId);
    const success = await updateUserRole(userId, role);
    setUpdating(null);

    if (success) {
      toast({
        title: '更新成功',
        description: `用户角色已更新为${role === 'admin' ? '管理员' : '普通用户'}`
      });
      loadData();
    } else {
      toast({
        title: '更新失败',
        description: '角色更新失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleCreateResult = async (data: Omit<CompetitionResult, 'id' | 'created_at' | 'updated_at' | 'published' | 'published_at'>) => {
    const success = await createCompetitionResult(data);
    
    if (success) {
      toast({
        title: '添加成功',
        description: '比赛结果已添加'
      });
      loadData();
    } else {
      toast({
        title: '添加失败',
        description: '比赛结果添加失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateResult = async (id: string, data: Partial<CompetitionResult>) => {
    const success = await updateCompetitionResult(id, data);
    
    if (success) {
      toast({
        title: '更新成功',
        description: '比赛结果已更新'
      });
      loadData();
    } else {
      toast({
        title: '更新失败',
        description: '比赛结果更新失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteResult = async (id: string) => {
    const success = await deleteCompetitionResult(id);
    
    if (success) {
      toast({
        title: '删除成功',
        description: '比赛结果已删除'
      });
      loadData();
    } else {
      toast({
        title: '删除失败',
        description: '比赛结果删除失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handlePublishResult = async (id: string) => {
    setUpdating(id);
    const success = await publishCompetitionResult(id);
    setUpdating(null);

    if (success) {
      toast({
        title: '公布成功',
        description: '比赛结果已公布'
      });
      loadData();
    } else {
      toast({
        title: '公布失败',
        description: '比赛结果公布失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleUnpublishResult = async (id: string) => {
    setUpdating(id);
    const success = await unpublishCompetitionResult(id);
    setUpdating(null);

    if (success) {
      toast({
        title: '取消成功',
        description: '比赛结果已取消公布'
      });
      loadData();
    } else {
      toast({
        title: '取消失败',
        description: '比赛结果取消公布失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleCreateGroup = async (data: Omit<CompetitionGroup, 'id' | 'created_at'>) => {
    const success = await createCompetitionGroup(data);
    
    if (success) {
      toast({
        title: '添加成功',
        description: '比赛组别已添加'
      });
      loadData();
    } else {
      toast({
        title: '添加失败',
        description: '比赛组别添加失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateGroup = async (id: string, data: Partial<CompetitionGroup>) => {
    const success = await updateCompetitionGroup(id, data);
    
    if (success) {
      toast({
        title: '更新成功',
        description: '比赛组别已更新'
      });
      loadData();
    } else {
      toast({
        title: '更新失败',
        description: '比赛组别更新失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    const success = await deleteCompetitionGroup(id);
    
    if (success) {
      toast({
        title: '删除成功',
        description: '比赛组别已删除'
      });
      loadData();
    } else {
      toast({
        title: '删除失败',
        description: '比赛组别删除失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 批量导入结果
  const handleBatchImport = async (importData: any[]) => {
    console.log('开始处理导入数据，接收到的数据:', importData);
    
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // 创建一个组别名称到ID的映射
    const groupMap = groups.reduce((acc, group) => {
      acc[group.name] = group.id;
      return acc;
    }, {} as Record<string, string>);
    
    console.log('当前系统中的组别映射:', groupMap);

    // 创建一个项目名称到报名ID的映射
    const registrationMap = registrations.reduce((acc, reg) => {
      acc[reg.project_name] = reg.id;
      return acc;
    }, {} as Record<string, string>);
    
    console.log('当前系统中的报名映射:', registrationMap);

    // 处理每条导入的数据
    for (let i = 0; i < importData.length; i++) {
      const item = importData[i];
      console.log(`处理第${i + 1}条数据:`, item);
      
      try {
        // 检查必要字段是否存在
        if (!item.group_name && !item.project_name && !item.winner_name && !item.award_name) {
          // 如果所有字段都为空，可能是空行，跳过
          console.log(`第${i + 1}行为空行，跳过处理`);
          continue;
        }
        
        if (!item.group_name || !item.project_name || !item.winner_name || !item.award_name) {
          const missingFields = [];
          if (!item.group_name) missingFields.push('组别名称');
          if (!item.project_name) missingFields.push('项目名称');
          if (!item.winner_name) missingFields.push('获奖者姓名');
          if (!item.award_name) missingFields.push('奖项名称');
          
          const errorMsg = `第${i + 2}行: 缺少${missingFields.join('、')}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          failedCount++;
          continue;
        }

        // 查找组别ID
        const groupId = groupMap[item.group_name];
        console.log(`查找组别 "${item.group_name}" 的ID:`, groupId);
        if (!groupId) {
          const errorMsg = `第${i + 2}行: 未找到组别 "${item.group_name}"`;
          console.error(errorMsg);
          errors.push(errorMsg);
          failedCount++;
          continue;
        }

        // 查找报名ID
        const registrationId = registrationMap[item.project_name];
        console.log(`查找项目 "${item.project_name}" 的报名ID:`, registrationId);
        if (!registrationId) {
          const errorMsg = `第${i + 2}行: 未找到项目 "${item.project_name}"`;
          console.error(errorMsg);
          errors.push(errorMsg);
          failedCount++;
          continue;
        }

        // 创建比赛结果
        console.log(`准备创建比赛结果，数据:`, {
          registration_id: registrationId,
          group_id: groupId,
          award_level: item.award_level || 'honorable_mention',
          award_name: item.award_name,
          ranking: item.ranking ? Number(item.ranking) : null,
          score: item.score ? Number(item.score) : null,
          remarks: item.remarks || null
        });
        
        const result = await createCompetitionResult({
          registration_id: registrationId,
          group_id: groupId,
          award_level: item.award_level || 'honorable_mention',
          award_name: item.award_name,
          ranking: item.ranking ? Number(item.ranking) : null,
          score: item.score ? Number(item.score) : null,
          remarks: item.remarks || null
        });
        
        console.log(`创建比赛结果结果:`, result);

        if (result) {
          successCount++;
          console.log(`第${i + 2}行数据导入成功`);
        } else {
          const errorMsg = `第${i + 2}行: 创建比赛结果失败`;
          console.error(errorMsg);
          errors.push(errorMsg);
          failedCount++;
        }
      } catch (error: any) {
        const errorMsg = `第${i + 2}行: ${error.message || '未知错误'}`;
        console.error(errorMsg, error);
        errors.push(errorMsg);
        failedCount++;
      }
    }

    console.log(`数据处理完成，成功: ${successCount}, 失败: ${failedCount}`);
    
    // 重新加载数据
    console.log('重新加载数据');
    await loadData();

    const finalResult = {
      success: successCount,
      failed: failedCount,
      errors
    };
    
    console.log('最终导入结果:', finalResult);
    return finalResult;
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

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-7xl mx-auto px-4 xl:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">管理后台</h1>
              <p className="text-muted-foreground">管理报名信息和用户权限</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="registrations" className="gap-2">
              <FileText className="w-4 h-4" />
              报名管理
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              用户管理
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <Trophy className="w-4 h-4" />
              比赛结果
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
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
                  <CardDescription>还没有用户提交报名信息</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              registrations.map((registration) => (
                <Card key={registration.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{registration.project_name}</CardTitle>
                        <CardDescription>
                          报名时间: {new Date(registration.created_at).toLocaleDateString('zh-CN')}
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
                      {registration.team_name && (
                        <div>
                          <span className="text-muted-foreground">团队名称：</span>
                          <span className="font-medium">{registration.team_name}</span>
                        </div>
                      )}
                    </div>

                    {registration.project_description && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">项目描述：</p>
                        <p className="text-sm">{registration.project_description}</p>
                      </div>
                    )}

                    {registration.works && registration.works.length > 0 && (
                      <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-semibold mb-3">
                          已提交作品 ({registration.works.length})
                        </h4>
                        <div className="space-y-2">
                          {registration.works.map((work) => (
                            <div key={work.id} className="bg-muted rounded-lg p-3 text-sm">
                              <div className="font-medium mb-1">{work.work_title}</div>
                              {work.work_description && (
                                <p className="text-muted-foreground mb-2">{work.work_description}</p>
                              )}
                              <div className="flex gap-2">
                                {work.work_url && (
                                  <a
                                    href={work.work_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    查看链接
                                  </a>
                                )}
                                {work.file_path && (
                                  <a
                                    href={work.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    查看文件
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {registration.status === 'pending' && (
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(registration.id, 'approved')}
                          disabled={updating === registration.id}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          通过
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(registration.id, 'rejected')}
                          disabled={updating === registration.id}
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          拒绝
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="py-4">
                      <Skeleton className="h-12 w-full bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>用户列表</CardTitle>
                  <CardDescription>管理用户角色和权限</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{profile.username}</div>
                            <div className="text-sm text-muted-foreground">
                              注册时间: {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={profile.role === 'admin' ? 'default' : 'outline'}>
                            {profile.role === 'admin' ? '管理员' : '普通用户'}
                          </Badge>
                          {profile.role === 'user' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateRole(profile.id, 'admin')}
                              disabled={updating === profile.id}
                            >
                              设为管理员
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateRole(profile.id, 'user')}
                              disabled={updating === profile.id}
                            >
                              设为普通用户
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="py-4">
                        <Skeleton className="h-16 w-full bg-muted" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">比赛结果管理</h3>
                    <p className="text-sm text-muted-foreground">
                      管理各组别的比赛结果和获奖名单
                    </p>
                  </div>
                  <Button onClick={() => setResultFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加结果
                  </Button>
                </div>
                
                {/* 批量导入组件 */}
                <BatchImportResults 
                  groups={groups}
                  registrations={registrations}
                  onImport={handleBatchImport}
                />
                
                <div className="grid gap-6">
                  {groups.map((group) => {
                    const groupResults = results.filter(r => r.group_id === group.id);
                    
                    return (
                      <Card key={group.id} className="shadow-elegant">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {group.name}
                              </CardTitle>
                              {group.description && (
                                <CardDescription>{group.description}</CardDescription>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setEditingGroup(group);
                                setGroupFormOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              编辑组别
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {groupResults.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              该组别暂无比赛结果
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {groupResults.map((result) => (
                                <div 
                                  key={result.id} 
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted rounded-lg"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {result.registration?.project_name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      获奖者: {result.registration?.name}
                                      {result.award_name && ` - ${result.award_name}`}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={result.published ? "default" : "secondary"}>
                                      {result.published ? "已公布" : "未公布"}
                                    </Badge>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        if (result.published) {
                                          handleUnpublishResult(result.id);
                                        } else {
                                          handlePublishResult(result.id);
                                        }
                                      }}
                                      disabled={updating === result.id}
                                    >
                                      {result.published ? (
                                        <>
                                          <EyeOff className="w-4 h-4 mr-1" />
                                          取消公布
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="w-4 h-4 mr-1" />
                                          公布
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setEditingResult(result);
                                        setResultFormOpen(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleDeleteResult(result.id)}
                                      disabled={updating === result.id}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {groups.length === 0 && (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">暂无比赛组别</p>
                        <Button 
                          className="mt-4"
                          onClick={() => setGroupFormOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          添加组别
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 比赛结果表单 */}
      <ResultForm
        open={resultFormOpen}
        onOpenChange={setResultFormOpen}
        onSubmit={editingResult ? 
          (data) => handleUpdateResult(editingResult.id, data) : 
          handleCreateResult
        }
        groups={groups}
        registrations={registrations}
        result={editingResult || undefined}
      />
      
      {/* 比赛组别表单 */}
      <GroupForm
        open={groupFormOpen}
        onOpenChange={setGroupFormOpen}
        onSubmit={editingGroup ? 
          (data) => handleUpdateGroup(editingGroup.id, data) : 
          handleCreateGroup
        }
        group={editingGroup}
      />
    </div>
  );
}