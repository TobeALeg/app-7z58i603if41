import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// OAuth 2.0 SSO 回调处理函数
// 此函数处理学校OAuth系统的回调，完成用户认证

// 配置信息（应该通过环境变量配置）
const OAUTH_CONFIG = {
  tokenUrl: Deno.env.get('OAUTH_TOKEN_URL') || '',
  userInfoUrl: Deno.env.get('OAUTH_USERINFO_URL') || '',
  clientId: Deno.env.get('OAUTH_CLIENT_ID') || '',
  clientSecret: Deno.env.get('OAUTH_CLIENT_SECRET') || '',
  redirectUri: Deno.env.get('OAUTH_REDIRECT_URI') || '',
};

// 用户信息字段映射
const USER_INFO_MAPPING = {
  oauthId: 'sub',
  studentId: 'student_id',
  realName: 'name',
  email: 'email',
  username: 'preferred_username'
};

Deno.serve(async (req: Request) => {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: '仅支持GET请求' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // 从URL中获取授权码和state
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return new Response(
        JSON.stringify({ error: '缺少授权码' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 1. 使用授权码换取access_token
    const tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new Response(
        JSON.stringify({ error: '获取access_token失败' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. 使用access_token获取用户信息
    const userInfoResponse = await fetch(OAUTH_CONFIG.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('User info fetch failed:', errorText);
      return new Response(
        JSON.stringify({ error: '获取用户信息失败' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const oauthUserInfo = await userInfoResponse.json();

    // 3. 提取用户信息
    const userInfo = {
      oauth_id: oauthUserInfo[USER_INFO_MAPPING.oauthId],
      student_id: oauthUserInfo[USER_INFO_MAPPING.studentId],
      real_name: oauthUserInfo[USER_INFO_MAPPING.realName],
      email: oauthUserInfo[USER_INFO_MAPPING.email],
      username: oauthUserInfo[USER_INFO_MAPPING.username] || oauthUserInfo[USER_INFO_MAPPING.studentId],
    };

    // 4. 生成JWT token用于前端登录
    // 这里返回用户信息和一个临时token，前端使用这个token完成Supabase登录
    const sessionToken = generateSessionToken(userInfo);

    // 重定向回前端，携带session token
    const frontendUrl = `${url.origin}/auth/callback?token=${sessionToken}&state=${state || ''}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': frontendUrl,
      },
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'OAuth认证失败',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

// 生成会话token（简化版本，实际应该使用JWT）
function generateSessionToken(userInfo: any): string {
  // 这里应该生成一个加密的JWT token
  // 为了简化，这里使用base64编码（不安全，仅用于演示）
  const tokenData = {
    ...userInfo,
    timestamp: Date.now(),
  };
  return btoa(JSON.stringify(tokenData));
}
