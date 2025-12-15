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

      console.log('OAuth回调参数:', { code, state, error, token });

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
        console.log('从token解析的用户信息:', userInfo);
        
        // 检查token是否过期
        if (userInfo.expires && userInfo.expires < Date.now()) {
          setStatus('error');
          setMessage('登录已过期，请重新登录');
          return;
        }
        
        // 使用用户信息在Supabase中创建或登录用户
        const virtualEmail = `${userInfo.oauth_id}@wzbc.edu.cn`;
        // 使用固定的密码模式，确保注册和登录使用相同密码
        const virtualPassword = `oauth_${userInfo.oauth_id}_${userInfo.provider}`;
        
        try {
          // 尝试直接登录，如果用户不存在会返回错误
          console.log('尝试直接登录用户:', { email: virtualEmail });
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: virtualEmail,
            password: virtualPassword
          });
          
          // 如果登录成功，直接跳转
          if (!signInError) {
            console.log('直接登录成功:', signInData);
            setStatus('success');
            setMessage('登录成功！正在跳转...');
            setTimeout(() => {
              navigate('/');
            }, 1500);
            return;
          } else {
            console.log('直接登录失败:', signInError);
          }
        } catch (e) {
          // 登录失败，继续下面的注册流程
          console.log("直接登录失败，继续注册流程:", e);
        }
        
        // 如果登录失败，尝试注册用户
        console.log('开始注册用户:', { email: virtualEmail });
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: virtualEmail,
          password: virtualPassword,
          options: {
            data: {
              oauth_id: userInfo.oauth_id,
              student_id: userInfo.student_id,
              real_name: userInfo.real_name,
              username: userInfo.username,
              provider: userInfo.provider || 'wzbc_cas',
              // 添加缺失的字段
              identity_type: userInfo.identity_type || null,
              organization: userInfo.organization || null
            },
            emailRedirectTo: window.location.origin
          }
        });
        
        console.log('注册结果:', { data: signUpData, error: signUpError });
        
        // 如果注册失败且不是因为用户已存在，则抛出错误
        if (signUpError && !signUpError.message.includes('already registered')) {
          throw signUpError;
        }
        
        // 等待一段时间确保触发器执行
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 手动检查并创建profile记录（如果触发器未工作）
        if (signUpData?.user) {
          console.log('检查并创建profile记录');
          try {
            // 检查profile是否已存在
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', signUpData.user.id)
              .maybeSingle();
            
            console.log('profile查询结果:', { data: profileData, error: profileError });
            
            // 如果profile不存在，则创建它
            if (!profileData && !profileError) {
              console.log('profile不存在，正在创建');
              const { data: insertData, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: signUpData.user.id,
                  username: userInfo.username || userInfo.oauth_id,
                  role: 'user',
                  student_id: userInfo.student_id,
                  real_name: userInfo.real_name,
                  oauth_provider: userInfo.provider || 'wzbc_cas',
                  oauth_id: userInfo.oauth_id,
                  // 添加缺失的字段
                  identity_type: userInfo.identity_type || null,
                  organization: userInfo.organization || null
                });
              
              console.log('profile创建结果:', { data: insertData, error: insertError });
            } else if (profileData) {
              console.log('profile已存在');
              // 如果profile已存在，尝试更新它
              const { data: updateData, error: updateError } = await supabase
                .from('profiles')
                .update({
                  student_id: userInfo.student_id,
                  real_name: userInfo.real_name,
                  oauth_provider: userInfo.provider || 'wzbc_cas',
                  oauth_id: userInfo.oauth_id,
                  identity_type: userInfo.identity_type || null,
                  organization: userInfo.organization || null
                })
                .eq('id', signUpData.user.id);
              
              console.log('profile更新结果:', { data: updateData, error: updateError });
            }
          } catch (profileCheckError) {
            console.error('检查或创建profile时出错:', profileCheckError);
          }
        }
        
        // 尝试通过更新用户记录来绕过邮箱验证问题
        if (signUpData?.user) {
          console.log('尝试更新用户记录以绕过邮箱验证');
          try {
            // 获取当前会话
            const { data: { session } } = await supabase.auth.getSession();
            console.log('当前会话:', session);
            
            if (!session) {
              // 如果没有会话，尝试使用注册时返回的会话
              if (signUpData.session) {
                console.log('使用注册返回的会话');
                // 设置会话
                await supabase.auth.setSession(signUpData.session);
              } else {
                // 如果没有可用会话，尝试刷新
                console.log('尝试刷新会话');
                await supabase.auth.refreshSession();
              }
            }
          } catch (sessionError) {
            console.error('会话处理错误:', sessionError);
          }
        }
        
        // 再次尝试登录
        console.log('再次尝试登录');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: virtualEmail,
          password: virtualPassword
        });
        
        console.log('再次登录结果:', { data: signInData, error: signInError });
        
        // 如果还是邮箱未确认错误，尝试其他方式
        if (signInError && signInError.message.includes('Email not confirmed')) {
          console.log('邮箱未确认错误，尝试获取当前用户');
          try {
            // 尝试获取当前用户
            const { data: { user }, error: getUserError } = await supabase.auth.getUser();
            console.log('获取当前用户结果:', { user, error: getUserError });
            
            if (user) {
              // 如果能获取到用户，直接跳转
              setStatus('success');
              setMessage('登录成功！正在跳转...');
              setTimeout(() => {
                navigate('/');
              }, 1500);
              return;
            }
          } catch (getUserError) {
            console.error('获取当前用户失败:', getUserError);
          }
        }
        
        if (signInError) {
          // 最后的备选方案：刷新页面
          console.log('登录失败，刷新页面');
          window.location.href = '/';
          return;
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
          console.log('开始调用Edge Function，参数:', { code: code?.substring(0, 10) + '...', state });
          
          const { data, error } = await supabase.functions.invoke('oauth-callback', {
            body: { code, state: state || '' },
          });
          
          console.log('Edge Function响应:', { data, error });
          
          if (error) {
            console.error('Edge Function调用失败:', error);
            // 尝试获取更详细的错误信息
            let errorMsg = 'OAuth认证失败';
            if (error.message) {
              errorMsg = error.message;
            }
            if (error.context) {
              try {
                const contextText = await error.context.text();
                console.error('错误详情:', contextText);
                errorMsg = `${errorMsg}: ${contextText}`;
              } catch (e) {
                console.error('无法读取错误详情:', e);
              }
            }
            throw new Error(errorMsg);
          }
          
          // Edge Function应该返回用户信息
          if (data && data.userInfo) {
            const userInfo = data.userInfo;
            console.log('从Edge Function获取的用户信息:', userInfo);
            
            // 使用用户信息在Supabase中创建或登录用户
            const virtualEmail = `${userInfo.oauth_id}@wzbc.edu.cn`;
            // 使用固定的密码模式，确保注册和登录使用相同密码
            const virtualPassword = `oauth_${userInfo.oauth_id}_${userInfo.provider}`;
            
            try {
              // 尝试直接登录，如果用户不存在会返回错误
              console.log('尝试直接登录用户:', { email: virtualEmail });
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: virtualEmail,
                password: virtualPassword
              });
              
              // 如果登录成功，直接跳转
              if (!signInError) {
                console.log('直接登录成功:', signInData);
                setStatus('success');
                setMessage('登录成功！正在跳转...');
                setTimeout(() => {
                  navigate('/');
                }, 1500);
                return;
              } else {
                console.log('直接登录失败:', signInError);
              }
            } catch (e) {
              // 登录失败，继续下面的注册流程
              console.log("直接登录失败，继续注册流程:", e);
            }
            
            // 如果登录失败，尝试注册用户
            console.log('开始注册用户:', { email: virtualEmail });
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: virtualEmail,
              password: virtualPassword,
              options: {
                data: {
                  oauth_id: userInfo.oauth_id,
                  student_id: userInfo.student_id,
                  real_name: userInfo.real_name,
                  username: userInfo.username,
                  provider: userInfo.provider || 'wzbc_cas',
                  // 添加缺失的字段
                  identity_type: userInfo.identity_type || null,
                  organization: userInfo.organization || null
                },
                emailRedirectTo: window.location.origin
              }
            });
            
            console.log('注册结果:', { data: signUpData, error: signUpError });
            
            // 如果注册失败且不是因为用户已存在，则抛出错误
            if (signUpError && !signUpError.message.includes('already registered')) {
              throw signUpError;
            }
            
            // 等待一段时间确保触发器执行
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 手动检查并创建profile记录（如果触发器未工作）
            if (signUpData?.user) {
              console.log('检查并创建profile记录');
              try {
                // 检查profile是否已存在
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', signUpData.user.id)
                  .maybeSingle();
                
                console.log('profile查询结果:', { data: profileData, error: profileError });
                
                // 如果profile不存在，则创建它
                if (!profileData && !profileError) {
                  console.log('profile不存在，正在创建');
                  const { data: insertData, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                      id: signUpData.user.id,
                      username: userInfo.username || userInfo.oauth_id,
                      role: 'user',
                      student_id: userInfo.student_id,
                      real_name: userInfo.real_name,
                      oauth_provider: userInfo.provider || 'wzbc_cas',
                      oauth_id: userInfo.oauth_id,
                      // 添加缺失的字段
                      identity_type: userInfo.identity_type || null,
                      organization: userInfo.organization || null
                    });
                  
                  console.log('profile创建结果:', { data: insertData, error: insertError });
                } else if (profileData) {
                  console.log('profile已存在');
                  // 如果profile已存在，尝试更新它
                  const { data: updateData, error: updateError } = await supabase
                    .from('profiles')
                    .update({
                      student_id: userInfo.student_id,
                      real_name: userInfo.real_name,
                      oauth_provider: userInfo.provider || 'wzbc_cas',
                      oauth_id: userInfo.oauth_id,
                      identity_type: userInfo.identity_type || null,
                      organization: userInfo.organization || null
                    })
                    .eq('id', signUpData.user.id);
                  
                  console.log('profile更新结果:', { data: updateData, error: updateError });
                }
              } catch (profileCheckError) {
                console.error('检查或创建profile时出错:', profileCheckError);
              }
            }
            
            // 尝试通过更新用户记录来绕过邮箱验证问题
            if (signUpData?.user) {
              console.log('尝试更新用户记录以绕过邮箱验证');
              try {
                // 获取当前会话
                const { data: { session } } = await supabase.auth.getSession();
                console.log('当前会话:', session);
                
                if (!session) {
                  // 如果没有会话，尝试使用注册时返回的会话
                  if (signUpData.session) {
                    console.log('使用注册返回的会话');
                    // 设置会话
                    await supabase.auth.setSession(signUpData.session);
                  } else {
                    // 如果没有可用会话，尝试刷新
                    console.log('尝试刷新会话');
                    await supabase.auth.refreshSession();
                  }
                }
              } catch (sessionError) {
                console.error('会话处理错误:', sessionError);
              }
            }
            
            // 再次尝试登录
            console.log('再次尝试登录');
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: virtualEmail,
              password: virtualPassword
            });
            
            console.log('再次登录结果:', { data: signInData, error: signInError });
            
            // 如果还是邮箱未确认错误，尝试其他方式
            if (signInError && signInError.message.includes('Email not confirmed')) {
              console.log('邮箱未确认错误，尝试获取当前用户');
              try {
                // 尝试获取当前用户
                const { data: { user }, error: getUserError } = await supabase.auth.getUser();
                console.log('获取当前用户结果:', { user, error: getUserError });
                
                if (user) {
                  // 如果能获取到用户，直接跳转
                  setStatus('success');
                  setMessage('登录成功！正在跳转...');
                  setTimeout(() => {
                    navigate('/');
                  }, 1500);
                  return;
                }
              } catch (getUserError) {
                console.error('获取当前用户失败:', getUserError);
              }
            }
            
            if (signInError) {
              // 最后的备选方案：刷新页面
              console.log('登录失败，刷新页面');
              window.location.href = '/';
              return;
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
      
      // 提供更友好的错误提示
      let errorMessage = '登录失败，请重试';
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('edge function')) {
          errorMessage = '认证服务暂时不可用，请稍后重试或联系管理员';
        } else if (msg.includes('network') || msg.includes('fetch')) {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else if (msg.includes('timeout')) {
          errorMessage = '请求超时，请重试';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage(errorMessage);
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