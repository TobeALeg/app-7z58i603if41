import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import { createBrowserClient } from '@supabase/ssr';
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
    console.log('开始获取当前用户信息');
    const currentProfile = await getCurrentUser();
    console.log('获取到的用户信息:', currentProfile);
    setProfile(currentProfile);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('初始化认证状态');
      
      // 检查当前会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('当前会话:', { session, sessionError });
      
      if (session?.user) {
        console.log('发现已登录用户:', session.user);
        setUser(session.user);
        await refreshProfile();
      }
      
      setLoading(false);
      
      // 监听认证状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('认证状态变化:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          await refreshProfile();
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  const signInWithOAuth = () => {
    const authUrl = generateAuthUrl();
    console.log('跳转到认证URL:', authUrl);
    window.location.href = authUrl;
  };

  const signOut = async () => {
    console.log('用户登出');
    const logoutUrl = generateLogoutUrl();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = logoutUrl;
  };

  const value = {
    user,
    profile,
    loading,
    signInWithOAuth,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}