import { useState, useEffect } from 'react';
import { getAllRegistrations, updateRegistrationStatus, getAllProfiles, updateUserRole } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { RegistrationWithWorks, Profile } from '@/types/types';

export default function AdminPage() {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<RegistrationWithWorks[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [regsData, profilesData] = await Promise.all([
      getAllRegistrations(),
      getAllProfiles()
    ]);
    setRegistrations(regsData);
    setProfiles(profilesData);
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
        </Tabs>
      </div>
    </div>
  );
}
