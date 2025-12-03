import { OAUTH_CONFIG, extractUserInfo } from '@/config/oauth';
import { supabase } from '@/db/supabase';

// OAuth登录流程
export async function initiateOAuthLogin() {
  // 由于需要使用客户端密钥，实际的token交换应该在后端进行
  // 这里使用Supabase的signInWithOAuth方法
  // 如果学校的OAuth系统与Supabase兼容，可以直接使用
  
  // 方案1: 使用Supabase内置OAuth（如果学校系统支持）
  // 需要在Supabase后台配置OAuth提供商
  
  // 方案2: 自定义OAuth流程（推荐）
  // 跳转到学校的OAuth授权页面
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: OAUTH_CONFIG.scope,
    state: generateRandomState()
  });
  
  window.location.href = `${OAUTH_CONFIG.authorizationUrl}?${params.toString()}`;
}

// 处理OAuth回调
export async function handleOAuthCallback(code: string, state: string) {
  // 验证state
  const savedState = sessionStorage.getItem('oauth_state');
  if (state !== savedState) {
    throw new Error('State验证失败，可能存在CSRF攻击');
  }
  sessionStorage.removeItem('oauth_state');
  
  // 注意：以下代码需要在后端执行，因为涉及客户端密钥
  // 这里仅作为示例，实际应该调用后端API
  
  try {
    // 1. 使用授权码换取access_token
    const tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret
      })
    });
    
    if (!tokenResponse.ok) {
      throw new Error('获取access_token失败');
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // 2. 使用access_token获取用户信息
    const userInfoResponse = await fetch(OAUTH_CONFIG.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!userInfoResponse.ok) {
      throw new Error('获取用户信息失败');
    }
    
    const oauthUserInfo = await userInfoResponse.json();
    
    // 3. 提取用户信息
    const userInfo = extractUserInfo(oauthUserInfo);
    
    // 4. 在Supabase中创建或登录用户
    // 使用signInWithPassword的方式不适合OAuth
    // 需要使用Supabase的admin API或自定义认证
    
    // 方案A: 使用Supabase的signUp创建用户（首次登录）
    // 方案B: 使用自定义token登录
    
    // 这里使用一个临时方案：为OAuth用户创建一个虚拟的email和密码
    const virtualEmail = `${userInfo.oauth_id}@oauth.local`;
    const virtualPassword = generateSecurePassword(userInfo.oauth_id);
    
    // 尝试登录
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: virtualEmail,
      password: virtualPassword
    });
    
    // 如果登录失败，说明是首次登录，需要注册
    if (signInError) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: virtualEmail,
        password: virtualPassword,
        options: {
          data: {
            oauth_id: userInfo.oauth_id,
            student_id: userInfo.student_id,
            real_name: userInfo.real_name,
            username: userInfo.username,
            provider: userInfo.provider
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      return { success: true, isNewUser: true };
    }
    
    return { success: true, isNewUser: false };
    
  } catch (error) {
    console.error('OAuth登录失败:', error);
    throw error;
  }
}

// 生成随机state
function generateRandomState(): string {
  const state = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('oauth_state', state);
  return state;
}

// 为OAuth用户生成安全的虚拟密码
function generateSecurePassword(oauthId: string): string {
  // 使用OAuth ID和一个固定的盐值生成密码
  // 注意：这只是一个示例，实际应该使用更安全的方法
  const salt = 'YOUR_SECRET_SALT'; // 应该从环境变量读取
  return `${oauthId}_${salt}_${Date.now()}`;
}
