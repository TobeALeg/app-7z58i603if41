import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, School, IdCard, Calendar, BadgeInfo } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen py-12 bg-muted">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>无法加载用户信息</CardTitle>
              <CardDescription>请先登录系统</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/login')}>前往登录</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.real_name || profile.username}</CardTitle>
                <CardDescription>
                  {profile.identity_type ? profile.identity_type : '用户'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BadgeInfo className="w-5 h-5" />
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">姓名</p>
                    <p className="font-medium">{profile.real_name || '未设置'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">邮箱</p>
                    <p className="font-medium">{user.email || '未设置'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <IdCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {profile.identity_type?.includes('教师') ? '工号' : '学号'}
                    </p>
                    <p className="font-medium">{profile.student_id || '未设置'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <School className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">身份类型</p>
                    <p className="font-medium">{profile.identity_type || '未设置'}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">账户信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">账户创建时间</p>
                    <p className="font-medium">
                      {new Date(user.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Badge className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">用户角色</p>
                    <p className="font-medium capitalize">{profile.role || 'user'}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleSignOut} 
                variant="destructive" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? '退出中...' : '退出登录'}
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="flex-1"
              >
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}