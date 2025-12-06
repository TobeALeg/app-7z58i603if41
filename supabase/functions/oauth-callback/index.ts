import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// OAuth 2.0 SSO 回调处理函数 - 温州商学院CAS认证系统
// 此函数处理学校CAS OAuth系统的回调，完成用户认证

// 配置信息（应该通过环境变量配置）
const OAUTH_CONFIG = {
  tokenUrl: Deno.env.get('OAUTH_TOKEN_URL') || 'https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken',
  userInfoUrl: Deno.env.get('OAUTH_USERINFO_URL') || 'https://cas.wzbc.edu.cn/cas/oauth2.0/profile',
  clientId: Deno.env.get('OAUTH_CLIENT_ID') || 'CijBwB5EwTTXouO7',
  clientSecret: Deno.env.get('OAUTH_CLIENT_SECRET') || 'O8dOsXE7p7yMbh18KEP2Z6',
  redirectUri: Deno.env.get('OAUTH_REDIRECT_URI') || 'https://aigctmp.wzbc.edu.cn/auth/callback',
};

Deno.serve(async (req: Request) => {
  // 设置CORS头，允许前端调用
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // 支持GET和POST请求
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: '仅支持GET和POST请求' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    let code: string | null = null;
    let state: string | null = null;

    // 从URL参数或请求体中获取code和state
    if (req.method === 'GET') {
      const url = new URL(req.url);
      code = url.searchParams.get('code');
      state = url.searchParams.get('state');
    } else {
      const body = await req.json();
      code = body.code;
      state = body.state;
    }

    if (!code) {
      return new Response(
        JSON.stringify({ error: '缺少授权码' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('收到授权码，开始换取access_token...');
    console.log('Token URL:', OAUTH_CONFIG.tokenUrl);
    console.log('Client ID:', OAUTH_CONFIG.clientId);
    console.log('Redirect URI:', OAUTH_CONFIG.redirectUri);

    // 1. 使用授权码换取access_token
    // CAS OAuth 2.0 通常使用POST请求，参数在URL中
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
    });

    const tokenUrl = `${OAUTH_CONFIG.tokenUrl}?${tokenParams.toString()}`;
    console.log('请求Token URL:', tokenUrl);

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        tokenUrl: OAUTH_CONFIG.tokenUrl,
        clientId: OAUTH_CONFIG.clientId,
        redirectUri: OAUTH_CONFIG.redirectUri,
      });
      return new Response(
        JSON.stringify({ 
          error: '获取access_token失败', 
          details: errorText,
          status: tokenResponse.status 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Token响应:', tokenData);
    
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('Token response missing access_token:', tokenData);
      return new Response(
        JSON.stringify({ 
          error: 'access_token不存在',
          tokenData: tokenData 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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

    // 4. 返回用户信息给前端
    return new Response(
      JSON.stringify({ 
        success: true,
        userInfo: userInfo,
        state: state
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'OAuth认证失败',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
