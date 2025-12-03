import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// OAuth 2.0 SSO 回调处理函数 - 温州商学院CAS认证系统
// 此函数处理学校CAS OAuth系统的回调，完成用户认证

// 配置信息（应该通过环境变量配置）
const OAUTH_CONFIG = {
  tokenUrl: Deno.env.get('OAUTH_TOKEN_URL') || 'https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken',
  userInfoUrl: Deno.env.get('OAUTH_USERINFO_URL') || 'https://cas.wzbc.edu.cn/cas/oauth2.0/profile',
  clientId: Deno.env.get('OAUTH_CLIENT_ID') || 'CijBwB5EwTTXouO7',
  clientSecret: Deno.env.get('OAUTH_CLIENT_SECRET') || 'O8dOsXE7p7yMbh18KEP2Z6',
  redirectUri: Deno.env.get('OAUTH_REDIRECT_URI') || '',
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

    console.log('收到授权码，开始换取access_token...');

    // 1. 使用授权码换取access_token
    // CAS系统支持GET或POST请求
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
    });

    const tokenResponse = await fetch(`${OAUTH_CONFIG.tokenUrl}?${tokenParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: '获取access_token失败', details: errorText }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('Token response missing access_token:', tokenData);
      return new Response(
        JSON.stringify({ error: 'access_token不存在' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('成功获取access_token，开始获取用户信息...');

    // 2. 使用access_token获取用户信息
    const userInfoResponse = await fetch(`${OAUTH_CONFIG.userInfoUrl}?access_token=${accessToken}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('User info fetch failed:', userInfoResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: '获取用户信息失败', details: errorText }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const oauthUserInfo = await userInfoResponse.json();
    console.log('成功获取用户信息:', JSON.stringify(oauthUserInfo));

    // 3. 提取用户信息（CAS系统返回的格式）
    const attributes = oauthUserInfo.attributes || {};
    const userInfo = {
      oauth_id: oauthUserInfo.id,
      student_id: attributes.accountName || attributes.accountId,
      real_name: attributes.userName || attributes.name,
      email: attributes.email || null,
      username: attributes.accountName || oauthUserInfo.id,
      provider: 'wzbc_cas',
      identity_type: attributes.identityTypeName || null,
      organization: attributes.organizationName || null,
    };

    console.log('提取的用户信息:', JSON.stringify(userInfo));

    // 4. 生成session token用于前端登录
    const sessionToken = generateSessionToken(userInfo);

    // 重定向回前端，携带session token
    const frontendUrl = `${url.origin}/auth/callback?token=${sessionToken}&state=${state || ''}`;
    
    console.log('重定向到前端:', frontendUrl);

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

// 生成会话token（简化版本，使用base64编码）
// 注意：这只是临时方案，生产环境应该使用JWT或其他加密方式
function generateSessionToken(userInfo: any): string {
  const tokenData = {
    ...userInfo,
    timestamp: Date.now(),
    expires: Date.now() + 3600000, // 1小时过期
  };
  return btoa(encodeURIComponent(JSON.stringify(tokenData)));
}
