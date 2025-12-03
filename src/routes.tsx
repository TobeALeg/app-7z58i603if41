import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import SubmitWorkPage from './pages/SubmitWorkPage';
import MyRegistrationPage from './pages/MyRegistrationPage';
import RulesPage from './pages/RulesPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
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
    name: '比赛报名',
    path: '/register',
    element: (
      <ProtectedRoute>
        <RegisterPage />
      </ProtectedRoute>
    )
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
    name: '比赛规则',
    path: '/rules',
    element: <RulesPage />
  },
  {
    name: '登录',
    path: '/login',
    element: <LoginPage />,
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
