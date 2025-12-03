import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRegistrationsByUserId } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Upload, Clock, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import type { RegistrationWithWorks } from '@/types/types';

export default function MyRegistrationPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationWithWorks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRegistrations();
    }
  }, [user]);

  const loadRegistrations = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getRegistrationsByUserId(user.id);
    setRegistrations(data);
    setLoading(false);
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
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        已提交作品 ({registration.works.length})
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

                  {registration.status === 'approved' && (
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
