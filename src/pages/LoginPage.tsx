import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Shield } from 'lucide-react';

export default function LoginPage() {
  const { user, signInWithOAuth } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
            <span className="text-3xl">🤖</span>
          </div>
          <CardTitle className="text-2xl gradient-text">智能体比赛报名平台</CardTitle>
          <CardDescription>使用学校统一身份认证登录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="w-4 h-4 text-primary" />
              <span>安全登录说明</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>使用学校统一身份认证系统</li>
              <li>无需单独注册账号</li>
              <li>自动同步学号和姓名信息</li>
              <li>保障账号安全</li>
            </ul>
          </div>

          <Button 
            onClick={signInWithOAuth} 
            className="w-full gap-2 h-12 text-base shadow-elegant"
            size="lg"
          >
            <LogIn className="w-5 h-5" />
            通过学校统一身份认证登录
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>点击登录即表示您同意遵守比赛规则</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
