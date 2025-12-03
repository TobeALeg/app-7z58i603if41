import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: '错误',
        description: '请填写用户名和密码',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginForm.username, loginForm.password);
    setLoading(false);

    if (error) {
      toast({
        title: '登录失败',
        description: error.message || '用户名或密码错误',
        variant: 'destructive'
      });
    } else {
      toast({
        title: '登录成功',
        description: '欢迎回来！'
      });
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupForm.username || !signupForm.password || !signupForm.confirmPassword) {
      toast({
        title: '错误',
        description: '请填写所有字段',
        variant: 'destructive'
      });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: '错误',
        description: '两次输入的密码不一致',
        variant: 'destructive'
      });
      return;
    }

    if (signupForm.password.length < 6) {
      toast({
        title: '错误',
        description: '密码长度至少为6位',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(signupForm.username, signupForm.password);
    setLoading(false);

    if (error) {
      toast({
        title: '注册失败',
        description: error.message || '注册失败，请稍后重试',
        variant: 'destructive'
      });
    } else {
      toast({
        title: '注册成功',
        description: '欢迎加入智能体比赛！'
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
            <span className="text-3xl">🤖</span>
          </div>
          <CardTitle className="text-2xl gradient-text">智能体比赛报名平台</CardTitle>
          <CardDescription>登录或注册以开始报名</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">用户名</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="请输入用户名"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">密码</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="请输入密码"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <LogIn className="w-4 h-4" />
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">用户名</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="只能包含字母、数字和下划线"
                    value={signupForm.username}
                    onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">密码</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="至少6位"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">确认密码</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="再次输入密码"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <UserPlus className="w-4 h-4" />
                  {loading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
