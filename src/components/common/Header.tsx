import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import routes from '@/routes';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const navigation = routes.filter((route) => route.visible !== false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-elegant">
      <nav className="max-w-7xl mx-auto px-4 xl:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg gradient-bg-primary flex items-center justify-center shadow-glow">
                <span className="text-2xl">🤖</span>
              </div>
              <span className="text-xl font-bold gradient-text">
                智能体比赛报名平台
              </span>
            </Link>
          </div>

          <div className="hidden xl:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-smooth ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <>
                {profile?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="w-4 h-4" />
                      管理后台
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {profile?.real_name || profile?.username}
                      {profile?.student_id && (
                        <span className="text-muted-foreground ml-1">({profile.student_id})</span>
                      )}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    退出
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  登录
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden p-2 rounded-lg hover:bg-accent transition-smooth"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="xl:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-smooth ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-accent flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      管理后台
                    </Link>
                  )}
                  <div className="px-4 py-2 text-sm text-muted-foreground border-t border-border mt-2 pt-4">
                    当前用户: {profile?.username}
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-accent flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground flex items-center gap-2 justify-center"
                >
                  <User className="w-4 h-4" />
                  登录
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
