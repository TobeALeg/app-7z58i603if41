// OAuth 2.0 SSO 配置 - 温州商学院CAS认证系统
// 基于学校提供的CAS OAuth 2.0接口文档配置

export const OAUTH_CONFIG = {
  // OAuth 2.0 授权端点
  authorizationUrl: 'https://cas.wzbc.edu.cn/cas/oauth2.0/authorize',
  
  // OAuth 2.0 Token端点
  tokenUrl: 'https://cas.wzbc.edu.cn/cas/oauth2.0/accessToken',
  
  // 用户信息端点
  userInfoUrl: 'https://cas.wzbc.edu.cn/cas/oauth2.0/profile',
  
  // CAS注销端点
  logoutUrl: 'https://cas.wzbc.edu.cn/cas/logout',
  
  // 客户端ID（学校提供）
  clientId: 'CijBwB5EwTTXouO7',
  
  // 客户端密钥（学校提供）
  // 注意：生产环境应该存储在Supabase环境变量中，不应暴露在前端代码
  clientSecret: 'O8dOsXE7p7yMbh18KEP2Z6',
  
  // 回调URL（需要在学校OAuth系统中注册）
  redirectUri: `${window.location.origin}/auth/callback`,
  
  // OAuth scope（根据CAS系统要求，可以为空或不传）
  scope: '',
  
  // OAuth提供商标识
  provider: 'wzbc_cas',
  
  // 用户信息字段映射
  // 根据CAS系统返回的用户信息结构进行映射
  userInfoMapping: {
    // OAuth返回的用户ID字段名（CAS返回的是 id）
    oauthId: 'id',
    
    // 学号字段名（从 attributes.accountName 获取）
    studentId: 'accountName',
    
    // 真实姓名字段名（从 attributes.userName 或 attributes.name 获取）
    realName: 'userName',
    
    // 邮箱字段名（如果有的话）
    email: 'email',
    
    // 用户名字段名（使用 accountName）
    username: 'accountName'
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

// 生成CAS注销URL
export function generateLogoutUrl(): string {
  // CAS注销后重定向到首页
  const serviceUrl = window.location.origin;
  return `${OAUTH_CONFIG.logoutUrl}?service=${encodeURIComponent(serviceUrl)}`;
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
// CAS系统返回的用户信息格式：
// {
//   "id": "smartadmin",
//   "attributes": {
//     "name": "智慧校园管理员",
//     "accountId": "1",
//     "accountName": "smartadmin",
//     "userId": "1",
//     "userName": "智慧校园管理员",
//     "identityTypeId": "1",
//     "identityTypeCode": "admin",
//     "identityTypeName": "管理",
//     "organizationId": "1",
//     "organizationCode": "1",
//     "organizationName": "智慧大学"
//   }
// }
export function extractUserInfo(oauthUserInfo: any) {
  const mapping = OAUTH_CONFIG.userInfoMapping;
  const attributes = oauthUserInfo.attributes || {};
  
  return {
    oauth_id: oauthUserInfo[mapping.oauthId] || oauthUserInfo.id,
    student_id: attributes[mapping.studentId] || attributes.accountName,
    real_name: attributes[mapping.realName] || attributes.userName || attributes.name,
    email: attributes[mapping.email] || null,
    username: attributes[mapping.username] || attributes.accountName || oauthUserInfo.id,
    provider: OAUTH_CONFIG.provider,
    // 额外保存的信息
    identity_type: attributes.identityTypeName || null,
    organization: attributes.organizationName || null
  };
}