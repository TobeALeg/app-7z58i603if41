import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import routes from '@/routes';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const navigation = routes.filter((route) => route.visible !== false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50">
      <nav className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/images/logo/wzbc.png"
                alt="Logo"
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                智能体大赛报名平台
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="flex-grow"></div>
            
            {user ? (
              <>
                {profile?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2 border-blue-600/50 text-blue-600 hover:bg-blue-50/50 dark:hover:bg-gray-800/50">
                      <Shield className="w-4 h-4" />
                      管理后台
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {profile?.real_name || profile?.username}
                      {profile?.student_id && (
                        <span className="text-muted-foreground ml-1">({profile.student_id})</span>
                      )}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <LogOut className="w-4 h-4" />
                    退出
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <User className="w-4 h-4" />
                  登录
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
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
                      className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      管理后台
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    个人信息
                  </button>
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
                    当前用户: {profile?.real_name || profile?.username}
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 rounded-md bg-blue-600 text-white text-base font-medium flex items-center gap-2 justify-center"
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