import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/types';
import { getCurrentUser } from '@/db/api';
import { generateAuthUrl, generateLogoutUrl } from '@/config/oauth';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithOAuth: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const currentProfile = await getCurrentUser();
    setProfile(currentProfile);
  };

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        refreshProfile();
      }
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // OAuth登录
  const signInWithOAuth = () => {
    // 跳转到学校OAuth授权页面
    const authUrl = generateAuthUrl();
    window.location.href = authUrl;
  };

  const signOut = async () => {
    // 先退出Supabase会话
    await supabase.auth.signOut();
    
    // 然后跳转到CAS注销页面，完成单点登出
    const logoutUrl = generateLogoutUrl();
    window.location.href = logoutUrl;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithOAuth, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}
