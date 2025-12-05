import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { validateState } from '@/config/oauth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理登录...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // 获取URL参数
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const token = searchParams.get('token');

      // 检查是否有错误
      if (error) {
        setStatus('error');
        setMessage(`登录失败: ${error}`);
        return;
      }

      // 验证state（防止CSRF攻击）
      if (state && !validateState(state)) {
        setStatus('error');
        setMessage('登录验证失败，请重试');
        return;
      }

      // 如果有token，说明是从Edge Function返回的
      if (token) {
        // 解析token获取用户信息（注意：需要先decodeURIComponent再atob）
        const userInfo = JSON.parse(decodeURIComponent(atob(token)));
        
        // 检查token是否过期
        if (userInfo.expires && userInfo.expires < Date.now()) {
          setStatus('error');
          setMessage('登录已过期，请重新登录');
          return;
        }
        
        // 使用用户信息在Supabase中创建或登录用户
        const virtualEmail = `${userInfo.oauth_id}@oauth.wzbc.local`;
        const virtualPassword = `oauth_${userInfo.oauth_id}_${userInfo.provider}`;
        
        // 尝试登录
        let { error: signInError } = await supabase.auth.signInWithPassword({
          email: virtualEmail,
          password: virtualPassword
        });
        
        // 如果登录失败，说明是首次登录，需要注册
        if (signInError) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: virtualEmail,
            password: virtualPassword,
            options: {
              data: {
                oauth_id: userInfo.oauth_id,
                student_id: userInfo.student_id,
                real_name: userInfo.real_name,
                username: userInfo.username,
                provider: userInfo.provider || 'wzbc_cas'
              }
            }
          });
          
          if (signUpError) {
            throw signUpError;
          }
        }
        
        setStatus('success');
        setMessage('登录成功！正在跳转...');
        
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          navigate('/');
        }, 1500);
        
      } else if (code) {
        // 如果有授权码，调用Supabase Edge Function处理
        setMessage('正在验证身份...');
        
        try {
          // 调用Supabase Edge Function
          const { data, error } = await supabase.functions.invoke('oauth-callback', {
            body: JSON.stringify({ code, state: state || '' }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (error) {
            console.error('Edge Function调用失败:', error);
            throw new Error(error.message || 'OAuth认证失败');
          }
          
          // Edge Function应该返回用户信息
          if (data && data.userInfo) {
            const userInfo = data.userInfo;
            
            // 使用用户信息在Supabase中创建或登录用户
            const virtualEmail = `${userInfo.oauth_id}@oauth.wzbc.local`;
            const virtualPassword = `oauth_${userInfo.oauth_id}_${userInfo.provider}`;
            
            // 尝试登录
            let { error: signInError } = await supabase.auth.signInWithPassword({
              email: virtualEmail,
              password: virtualPassword
            });
            
            // 如果登录失败，说明是首次登录，需要注册
            if (signInError) {
              const { error: signUpError } = await supabase.auth.signUp({
                email: virtualEmail,
                password: virtualPassword,
                options: {
                  data: {
                    oauth_id: userInfo.oauth_id,
                    student_id: userInfo.student_id,
                    real_name: userInfo.real_name,
                    username: userInfo.username,
                    provider: userInfo.provider || 'wzbc_cas'
                  }
                }
              });
              
              if (signUpError) {
                throw signUpError;
              }
            }
            
            setStatus('success');
            setMessage('登录成功！正在跳转...');
            
            // 延迟跳转，让用户看到成功消息
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            throw new Error('未能获取用户信息');
          }
        } catch (err) {
          console.error('OAuth处理失败:', err);
          throw err;
        }
        
      } else {
        setStatus('error');
        setMessage('缺少必要的认证参数');
      }
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : '登录失败，请重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
            {status === 'loading' && <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-primary-foreground" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-primary-foreground" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && '正在登录'}
            {status === 'success' && '登录成功'}
            {status === 'error' && '登录失败'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigate('/login')} className="flex-1">
                返回登录
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                返回首页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
