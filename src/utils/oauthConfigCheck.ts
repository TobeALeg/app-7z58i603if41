import { OAUTH_CONFIG } from '@/config/oauth';

// OAuth配置检查工具
export function checkOAuthConfig(): {
  isConfigured: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // 检查必填字段
  if (!OAUTH_CONFIG.authorizationUrl || OAUTH_CONFIG.authorizationUrl === 'YOUR_AUTHORIZATION_URL') {
    missingFields.push('authorizationUrl (授权端点URL)');
  }

  if (!OAUTH_CONFIG.tokenUrl || OAUTH_CONFIG.tokenUrl === 'YOUR_TOKEN_URL') {
    missingFields.push('tokenUrl (Token端点URL)');
  }

  if (!OAUTH_CONFIG.userInfoUrl || OAUTH_CONFIG.userInfoUrl === 'YOUR_USERINFO_URL') {
    missingFields.push('userInfoUrl (用户信息端点URL)');
  }

  if (!OAUTH_CONFIG.clientId || OAUTH_CONFIG.clientId === 'YOUR_CLIENT_ID') {
    missingFields.push('clientId (客户端ID)');
  }

  if (!OAUTH_CONFIG.clientSecret || OAUTH_CONFIG.clientSecret === 'YOUR_CLIENT_SECRET') {
    missingFields.push('clientSecret (客户端密钥)');
  }

  // 检查警告项
  if (OAUTH_CONFIG.clientSecret && OAUTH_CONFIG.clientSecret !== 'YOUR_CLIENT_SECRET') {
    warnings.push('⚠️ 客户端密钥不应在前端代码中配置，请使用Supabase环境变量');
  }

  if (!OAUTH_CONFIG.redirectUri.startsWith('https://') && !OAUTH_CONFIG.redirectUri.includes('localhost')) {
    warnings.push('⚠️ 生产环境回调URL必须使用HTTPS');
  }

  return {
    isConfigured: missingFields.length === 0,
    missingFields,
    warnings
  };
}

// 在开发环境下打印配置状态
export function logOAuthConfigStatus() {
  if (import.meta.env.DEV) {
    const status = checkOAuthConfig();
    
    console.group('🔐 OAuth 2.0 SSO 配置状态');
    
    if (status.isConfigured) {
      console.log('✅ OAuth配置已完成');
    } else {
      console.warn('❌ OAuth配置未完成，缺少以下字段：');
      status.missingFields.forEach(field => {
        console.warn(`  - ${field}`);
      });
      console.log('\n📖 配置指南: 查看 QUICK_START.md');
    }
    
    if (status.warnings.length > 0) {
      console.warn('\n⚠️ 配置警告：');
      status.warnings.forEach(warning => {
        console.warn(`  ${warning}`);
      });
    }
    
    console.log('\n当前配置：');
    console.log('  授权端点:', OAUTH_CONFIG.authorizationUrl);
    console.log('  Token端点:', OAUTH_CONFIG.tokenUrl);
    console.log('  用户信息端点:', OAUTH_CONFIG.userInfoUrl);
    console.log('  客户端ID:', OAUTH_CONFIG.clientId);
    console.log('  回调URL:', OAUTH_CONFIG.redirectUri);
    console.log('  Scope:', OAUTH_CONFIG.scope);
    
    console.groupEnd();
  }
}
