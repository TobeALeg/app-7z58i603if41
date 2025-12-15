import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import SubmitWorkPage from './pages/SubmitWorkPage';
import MyRegistrationPage from './pages/MyRegistrationPage';
import RulesPage from './pages/RulesPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import ResultsPage from './pages/ResultsPage';
import TestCSVPage from './pages/TestCSVPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <HomePage />
  },
  {
    name: '大赛报名',
    path: '/register',
    element: (
      <ProtectedRoute>
        <RegisterPage />
      </ProtectedRoute>
    )
  },
  {
    name: '大赛结果',
    path: '/results',
    element: <ResultsPage />
  },
  {
    name: '大赛规则',
    path: '/rules',
    element: <RulesPage />
  },
  {
    name: '作品提交',
    path: '/submit-work',
    element: (
      <ProtectedRoute>
        <SubmitWorkPage />
      </ProtectedRoute>
    )
  },
  {
    name: '我的报名',
    path: '/my-registration',
    element: (
      <ProtectedRoute>
        <MyRegistrationPage />
      </ProtectedRoute>
    )
  },
  {
    name: '个人信息',
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
    visible: false
  },
  {
    name: 'CSV测试',
    path: '/test-csv',
    element: <TestCSVPage />,
    visible: false
  },
  {
    name: '登录',
    path: '/login',
    element: <LoginPage />,
    visible: false
  },
  {
    name: 'OAuth回调',
    path: '/auth/callback',
    element: <OAuthCallbackPage />,
    visible: false
  },
  {
    name: '管理后台',
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminPage />
      </ProtectedRoute>
    ),
    visible: false
  }
];

export default routes;