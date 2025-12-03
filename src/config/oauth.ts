// OAuth 2.0 SSO 配置
// 请根据学校提供的OAuth配置信息修改以下参数

export const OAUTH_CONFIG = {
  // OAuth 2.0 授权端点
  // 示例: 'https://sso.university.edu.cn/oauth/authorize'
  authorizationUrl: 'YOUR_AUTHORIZATION_URL',
  
  // OAuth 2.0 Token端点
  // 示例: 'https://sso.university.edu.cn/oauth/token'
  tokenUrl: 'YOUR_TOKEN_URL',
  
  // 用户信息端点
  // 示例: 'https://sso.university.edu.cn/oauth/userinfo'
  userInfoUrl: 'YOUR_USERINFO_URL',
  
  // 客户端ID（由学校OAuth系统提供）
  clientId: 'YOUR_CLIENT_ID',
  
  // 客户端密钥（由学校OAuth系统提供）
  // 注意：在生产环境中，此密钥应该存储在后端，不应暴露在前端代码中
  clientSecret: 'YOUR_CLIENT_SECRET',
  
  // 回调URL（需要在学校OAuth系统中注册）
  // 示例: 'https://your-domain.com/auth/callback'
  redirectUri: `${window.location.origin}/auth/callback`,
  
  // OAuth scope（根据学校系统要求配置）
  // 示例: 'openid profile email student_info'
  scope: 'openid profile email',
  
  // OAuth提供商标识
  provider: 'university_sso',
  
  // 用户信息字段映射
  // 根据学校OAuth系统返回的用户信息字段进行映射
  userInfoMapping: {
    // OAuth返回的用户ID字段名
    oauthId: 'sub', // 或 'id', 'user_id' 等
    
    // 学号字段名
    studentId: 'student_id', // 或 'student_number', 'username' 等
    
    // 真实姓名字段名
    realName: 'name', // 或 'real_name', 'full_name' 等
    
    // 邮箱字段名
    email: 'email',
    
    // 用户名字段名（可选）
    username: 'preferred_username' // 或 'username', 'login_name' 等
  }
};

// 生成OAuth授权URL
export function generateAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: OAUTH_CONFIG.scope,
    state: generateRandomState()
  });
  
  return `${OAUTH_CONFIG.authorizationUrl}?${params.toString()}`;
}

// 生成随机state用于防止CSRF攻击
function generateRandomState(): string {
  const state = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('oauth_state', state);
  return state;
}

// 验证state
export function validateState(state: string): boolean {
  const savedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');
  return state === savedState;
}

// 从OAuth用户信息中提取所需字段
export function extractUserInfo(oauthUserInfo: any) {
  const mapping = OAUTH_CONFIG.userInfoMapping;
  
  return {
    oauth_id: oauthUserInfo[mapping.oauthId],
    student_id: oauthUserInfo[mapping.studentId],
    real_name: oauthUserInfo[mapping.realName],
    email: oauthUserInfo[mapping.email],
    username: oauthUserInfo[mapping.username] || oauthUserInfo[mapping.studentId],
    provider: OAUTH_CONFIG.provider
  };
}
